
import { GoogleGenAI } from '@google/genai';
import { quotaManager } from './utils/quotaManager';
import { MODEL_CONFIGS, GLOSSARY_ANALYSIS_PROMPT } from './constants';
import { StoryInfo, FileItem } from './utils/types';

const getAiClient = (apiKey: string) => {
  if (!apiKey || apiKey.length < 30) {
    throw new Error("Gemini API Key không hợp lệ.");
  }
  return new GoogleGenAI({ apiKey });
};

const optimizeDictionary = (dictionary: string, content: string): string => {
  if (!content || !dictionary) return '';
  const lines = dictionary.split('\n');
  const uniqueMap = new Map<string, string>();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue; 
    const key = trimmed.substring(0, eqIndex).trim();
    if (key) uniqueMap.set(key, trimmed);
  }
  const usedLines: string[] = [];
  for (const [key, line] of uniqueMap.entries()) {
      if (content.includes(key)) usedLines.push(line);
  }
  return usedLines.join('\n');
};

const handleErrorQuota = (error: any, modelId: string) => {
    const msg = (error.message || error.toString()).toLowerCase();
    if (msg.includes('quota')) quotaManager.markAsDepleted(modelId);
    else if (error.status === 429) quotaManager.recordRateLimit(modelId);
};

export const analyzeStoryContext = async (files: FileItem[], storyInfo: StoryInfo, apiKey: string): Promise<string> => {
    const ai = getAiClient(apiKey);
    const modelId = 'gemini-3-flash-preview';
    const sampleFiles = files.slice(0, 3);
    let contextContent = sampleFiles.map(f => `--- ${f.name} ---\n${f.content.substring(0, 2000)}`).join('\n\n');
    
    const userPrompt = `Phân tích cốt truyện và nhân vật cho "${storyInfo.title}":\n\n${contextContent}`;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: userPrompt,
            config: { systemInstruction: GLOSSARY_ANALYSIS_PROMPT, temperature: 0.3 },
        });
        if (response.text) {
            quotaManager.recordRequest(modelId);
            return response.text.trim();
        }
    } catch (error: any) {
        handleErrorQuota(error, modelId);
    }
    throw new Error("AI không phản hồi.");
};

export const translateBatch = async (
    files: { id: string, content: string }[],
    userPrompt: string,
    dictionary: string,
    globalContext: string,
    allowedModelIds: string[],
    apiKey: string
): Promise<{ results: Map<string, string>, model: string }> => {
    const ai = getAiClient(apiKey);
    const combinedContent = files.map(f => f.content).join('\n');
    const relevantDictionary = optimizeDictionary(dictionary, combinedContent);

    let inputContent = "";
    for (const file of files) {
        inputContent += `\n[[[FILE_ID: ${file.id}]]]\n${file.content}\n[[[FILE_END: ${file.id}]]]\n`;
    }

    const systemInstruction = `BẠN LÀ CHUYÊN GIA DỊCH THUẬT VĂN HỌC TRUNG-VIỆT.
NHIỆM VỤ: Dịch nội dung được cung cấp sang tiếng Việt mượt mà, văn phong tiểu thuyết.

YÊU CẦU CỰC KỲ QUAN TRỌNG:
1. KHÔNG ĐƯỢC BỎ SÓT BẤT KỲ ĐOẠN VĂN NÀO. Dịch từ đầu đến cuối 100%.
2. DỊCH CẢ TIÊU ĐỀ CHƯƠNG (Thường nằm ở dòng đầu tiên của mỗi đoạn nội dung). 
3. Nếu tiêu đề chương có dạng "Chương X: ...", hãy dịch sát nghĩa phần sau dấu hai chấm.
4. GIỮ NGUYÊN các tag [[[FILE_ID: ID]]] và [[[FILE_END: ID]]].
5. TUYỆT ĐỐI không trả về tiếng Trung.
6. Sử dụng từ điển để nhất quán tên riêng.`;

    const fullPrompt = `[STORY_CONTEXT]\n${globalContext}\n\n[DICTIONARY]\n${relevantDictionary}\n\n[REQUIREMENTS]\n${userPrompt}\n\n[CONTENT]\n${inputContent}`;

    const modelId = 'gemini-3-flash-preview';
    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: fullPrompt,
            config: { systemInstruction, temperature: 0.1, maxOutputTokens: 60000 },
        });

        if (response.text) {
            const results = new Map<string, string>();
            for (const file of files) {
                const regex = new RegExp(`\\[\\[\\[FILE_ID:\\s*${file.id}\\s*\\]\\]\\]([\\s\\S]*?)\\[\\[\\[FILE_END:\\s*${file.id}\\s*\\]\\]\\]`, 'i');
                const match = response.text.match(regex);
                if (match) {
                    results.set(file.id, match[1].trim());
                }
            }
            if (results.size > 0) {
                quotaManager.recordRequest(modelId);
                return { results, model: modelId };
            }
        }
    } catch (error: any) {
        handleErrorQuota(error, modelId);
    }
    throw new Error("Dịch thất bại.");
};
