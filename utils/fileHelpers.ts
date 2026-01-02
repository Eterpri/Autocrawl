
import JSZip from 'jszip';
import { FileItem, FileStatus, StoryInfo } from './types';

const PROXY_LIST = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/"
];

const JUNK_PHRASES = [
    "重要声明", "本站", "版权归", "All rights reserved", "最新章节", "永久地址", 
    "网友发表", "来自搜索引擎", "本站立场无关", "www.", ".com", ".net", ".org",
    "点击下一页", "继续阅读", "顶点小说", "笔趣阁", "69书吧", "飘天文学", "shubao", "paoshu"
];

const CONTENT_SELECTORS = [
    '#content', '#htmlContent', '#article', '#booktxt', '#chaptercontent', '#chapterContent', 
    '.content', '.showtxt', '.read-content', '.chapter-content', '.post-content', '.txtnav',
    'article', 'main', '.entry-content'
];

const NEXT_CHAPTER_KEYWORDS = [
    "下一章", "下一页", "下一节", "next chapter", "chương sau", "chương tiếp", "下一页",
    ">", "next", "下—章"
];

export const translateChapterTitle = (title: string): string => {
  let clean = title.trim();
  clean = clean.replace(/第\s*(\d+)\s*[章話节回]/g, 'Chương $1');
  clean = clean.replace(/Chapter\s*(\d+)/gi, 'Chương $1');
  
  const hanVietMap: Record<string, string> = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '七': '7', '八': '8', '九': '9', '十': '10' };
  clean = clean.replace(/第\s*([一二三四五六七八九十]+)\s*[章話节回]/g, (match, p1) => {
    return `Chương ${hanVietMap[p1] || p1}`;
  });
  return clean;
};

const resolveUrl = (base: string, relative: string) => {
    try {
        return new URL(relative, base).href;
    } catch (e) {
        return relative;
    }
};

export const fetchContentFromUrl = async (url: string): Promise<{ title: string, content: string, nextUrl: string | null }> => {
    let lastError = "";
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http')) throw new Error("Link không hợp lệ.");

    for (const proxyBase of PROXY_LIST) {
        try {
            const finalUrl = `${proxyBase}${encodeURIComponent(cleanUrl)}`;
            const response = await fetch(finalUrl);
            if (!response.ok) continue;

            const buffer = await response.arrayBuffer();
            let tempHtml = new TextDecoder('utf-8').decode(buffer);
            if (tempHtml.toLowerCase().includes('charset=gbk') || tempHtml.toLowerCase().includes('charset=gb2312')) {
                tempHtml = new TextDecoder('gbk').decode(buffer);
            }

            const parser = new DOMParser();
            const doc = parser.parseFromString(tempHtml, 'text/html');

            let nextUrl: string | null = null;
            const allLinks = Array.from(doc.querySelectorAll('a'));
            for (const link of allLinks) {
                const text = (link.innerText || link.textContent || "").toLowerCase().trim();
                if (NEXT_CHAPTER_KEYWORDS.some(kw => text === kw || (text.includes(kw) && text.length < 15))) {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('javascript')) {
                        nextUrl = resolveUrl(cleanUrl, href);
                        break;
                    }
                }
            }

            let rawTitle = doc.title?.split('_')[0].split('-')[0].trim() || "Chương mới";
            const h1 = doc.querySelector('h1');
            if (h1) rawTitle = h1.innerText.trim();
            const title = translateChapterTitle(rawTitle);

            let target: HTMLElement | null = null;
            for (const selector of CONTENT_SELECTORS) {
                const found = doc.querySelector(selector);
                if (found && found.textContent && found.textContent.trim().length > 300) {
                    target = found as HTMLElement;
                    break;
                }
            }

            const finalContainer = target || doc.body;
            const lines = finalContainer.innerText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
            const cleanText = lines.join('\n\n').trim();

            return { title, content: cleanText, nextUrl };
        } catch (e) {
            lastError = "Proxy lỗi hoặc không bóc tách được.";
        }
    }
    throw new Error(lastError);
};

export const unzipFiles = async (file: File, startOrder: number = 0): Promise<FileItem[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  const files: FileItem[] = [];
  const filePaths = Object.keys(loadedZip.files).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
  let currentOrder = startOrder;
  for (const relativePath of filePaths) {
    const zipEntry = loadedZip.files[relativePath];
    if (!zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.txt')) {
      const content = await zipEntry.async('string');
      files.push({ 
        id: crypto.randomUUID(), 
        orderIndex: currentOrder++,
        name: translateChapterTitle(zipEntry.name.split('/').pop() || zipEntry.name), 
        content, 
        translatedContent: null, 
        status: FileStatus.IDLE, 
        retryCount: 0, 
        originalCharCount: content.length, 
        remainingRawCharCount: 0 
      });
    }
  }
  return files;
};

export const createMergedFile = (files: FileItem[]): string => {
  return [...files].sort((a, b) => a.orderIndex - b.orderIndex)
    .filter((f) => f.status === FileStatus.COMPLETED && f.translatedContent)
    .map((f) => `### ${f.name}\n\n${f.translatedContent?.trim()}`) 
    .join('\n\n'); 
};

export const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

export const generateEpub = async (files: FileItem[], storyInfo: StoryInfo): Promise<Blob> => {
  const zip = new JSZip();
  const sortedFiles = [...files]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .filter(f => f.status === FileStatus.COMPLETED);
  
  // EPUB Requirement: mimetype file must be first and uncompressed
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  
  const metaInf = zip.folder("META-INF");
  metaInf?.file("container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  
  const oebps = zip.folder("OEBPS");
  oebps?.file("Styles/style.css", `body { font-family: serif; line-height: 1.6; padding: 5%; } h2 { text-align: center; margin-bottom: 1.5em; } p { text-indent: 1em; margin: 0.5em 0; }`);
  
  let manifest = ""; 
  let spine = "";
  let navItems = "";

  sortedFiles.forEach((f, i) => {
    const id = `ch${i + 1}`;
    const fileName = `${id}.xhtml`;
    const chapterTitle = f.name;
    
    const htmlContent = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${chapterTitle}</title>
  <link href="../Styles/style.css" rel="stylesheet" type="text/css"/>
</head>
<body>
    <h2>${chapterTitle}</h2>
    ${(f.translatedContent || "").split('\n').filter(l => l.trim()).map(l => `<p>${l.trim()}</p>`).join('\n')}
</body>
</html>`;

    oebps?.file(`Text/${fileName}`, htmlContent);
    manifest += `<item id="${id}" href="Text/${fileName}" media-type="application/xhtml+xml"/>\n`;
    spine += `<itemref idref="${id}"/>\n`;
    navItems += `<li><a href="Text/${fileName}">${chapterTitle}</a></li>\n`;
  });

  oebps?.file("nav.xhtml", `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Toc</title></head>
<body>
  <nav epub:type="toc">
    <h1>Mục lục</h1>
    <ol>${navItems}</ol>
  </nav>
</body>
</html>`);

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">uuid-${crypto.randomUUID()}</dc:identifier>
    <dc:title>${storyInfo.title}</dc:title>
    <dc:creator>${storyInfo.author || 'AI Translator'}</dc:creator>
    <dc:language>vi</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="Styles/style.css" media-type="text/css"/>
    ${manifest}
  </manifest>
  <spine>
    <itemref idref="nav"/>
    ${spine}
  </spine>
</package>`;

  oebps?.file("content.opf", opf);

  return await zip.generateAsync({ 
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE"
  });
};
