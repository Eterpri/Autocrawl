
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  FileText, Download, Trash2, AlertCircle, CheckCircle, Loader2, Settings, Zap, Sparkles, ChevronDown, RefreshCw, Languages, Plus, Search, Link2, Book, Brain, Type, Volume2, VolumeX, SkipBack, SkipForward, LogOut, Eye, EyeOff, Menu, ScrollText, Key, ExternalLink, Github, HelpCircle, AlertTriangle, X, PlusCircle, History, Hourglass, Info, Wand2, FileArchive, ArrowRight, Play, Pause, Square, Sliders, Coffee, Sun, Moon, FileOutput, Save, BookOpen, ToggleLeft, ToggleRight, Wand, UploadCloud, Smartphone
} from 'lucide-react';
import { FileItem, FileStatus, StoryProject, ReaderSettings } from './utils/types';
import { DEFAULT_PROMPT, MODEL_CONFIGS, AVAILABLE_LANGUAGES, AVAILABLE_GENRES, AVAILABLE_PERSONALITIES, AVAILABLE_SETTINGS, AVAILABLE_FLOWS, DEFAULT_DICTIONARY } from './constants';
import { translateBatch, analyzeStoryContext } from './geminiService';
import { createMergedFile, downloadTextFile, fetchContentFromUrl, unzipFiles, generateEpub, translateChapterTitle } from './utils/fileHelpers';
import { replacePromptVariables } from './utils/textHelpers';
import { saveProject, getAllProjects, deleteProject } from './utils/storage';
import { quotaManager } from './utils/quotaManager';

const MAX_CONCURRENCY = 1; 
const BATCH_FILE_LIMIT = 2; 

const BG_COLORS = [
    { name: 'Trắng', code: 'bg-white text-slate-900' },
    { name: 'Giấy cũ', code: 'bg-[#f4ecd8] text-slate-900' },
    { name: 'Xanh dịu', code: 'bg-[#e8f5e9] text-slate-900' },
    { name: 'Tối', code: 'bg-slate-900 text-slate-300' }
];

const getStatusLabel = (status: FileStatus) => {
    switch (status) {
        case FileStatus.IDLE: return { label: 'Chờ dịch', color: 'bg-slate-100 text-slate-500' };
        case FileStatus.PROCESSING: return { label: 'Đang dịch...', color: 'bg-indigo-100 text-indigo-600 animate-pulse' };
        case FileStatus.COMPLETED: return { label: 'Đã xong', color: 'bg-emerald-100 text-emerald-600' };
        case FileStatus.ERROR: return { label: 'Lỗi', color: 'bg-rose-100 text-rose-600' };
        default: return { label: 'Chờ', color: 'bg-slate-100 text-slate-500' };
    }
};

const generateId = () => {
    try {
        return crypto.randomUUID();
    } catch (e) {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
};

const App: React.FC = () => {
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [activeWorkers, setActiveWorkers] = useState<number>(0);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showContextSetup, setShowContextSetup] = useState<boolean>(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [showTTSSettings, setShowTTSSettings] = useState<boolean>(false);
  
  const [linkInput, setLinkInput] = useState<string>("");
  const [isAutoCrawlEnabled, setIsAutoCrawlEnabled] = useState<boolean>(true);
  const [isFetchingLinks, setIsFetchingLinks] = useState<boolean>(false);
  const isFetchingLinksRef = useRef<boolean>(false);
  const [fetchProgress, setFetchProgress] = useState<{current: number, total: number} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  const [viewingFileId, setViewingFileId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{id: string, message: string, type: string}[]>([]);

  const readerScrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const isReaderActiveRef = useRef<boolean>(false); 
  const synthesisRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTTSIndex, setActiveTTSIndex] = useState<number>(-1);
  const [isTTSPaused, setIsTTSPaused] = useState<boolean>(false);

  const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId) || null, [projects, currentProjectId]);

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>({
      fontSize: 19,
      bgColor: 'bg-[#f4ecd8] text-slate-900',
      fontFamily: 'font-serif',
      ttsRate: 1.2,
      ttsVoice: '',
      showOriginal: false,
      isAutoScrollActive: true
  });

  const [newProjectInfo, setNewProjectInfo] = useState({
      title: '', author: '', languages: ['Convert thô'], genres: ['Tiên Hiệp'], mcPersonality: ['Trầm ổn/Già dặn'], worldSetting: ['Trung Cổ/Cổ Đại'], sectFlow: ['Phàm nhân lưu']
  });

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey && savedKey.length > 30) setApiKey(savedKey);
    else setShowApiKeyModal(true);
  }, []);

  const handleSaveApiKey = () => {
    const keyToSave = apiKeyInput.trim();
    if (keyToSave.length < 30) return addToast("API Key không hợp lệ.", "error");
    localStorage.setItem('gemini_api_key', keyToSave);
    setApiKey(keyToSave);
    setShowApiKeyModal(false);
    addToast("Đã lưu API Key thành công!", "success");
  };

  const addToast = useCallback((message: any, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message: String(message), type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const toggleWakeLock = async () => {
    if (!('wakeLock' in navigator)) return addToast("Không hỗ trợ Wake Lock", "warning");
    try {
        if (isWakeLockActive) {
            if (wakeLockRef.current) await wakeLockRef.current.release();
            setIsWakeLockActive(false);
        } else {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            setIsWakeLockActive(true);
        }
    } catch (err: any) { addToast("Lỗi Wake Lock", "error"); }
  };

  useEffect(() => { getAllProjects().then(setProjects); }, []);

  const updateProject = (id: string, updates: Partial<StoryProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastModified: Date.now() } : p));
  };

  const persistProject = async (project: StoryProject) => {
    setIsSaving(true);
    try { await saveProject(project); } finally { setIsSaving(false); }
  };

  useEffect(() => { if (currentProject) persistProject(currentProject); }, [currentProject?.lastModified]);

  const handleAIAnalyze = async () => {
    if (!currentProject || currentProject.chapters.length === 0 || !apiKey) return;
    setIsAnalyzing(true);
    try {
        const result = await analyzeStoryContext(currentProject.chapters, currentProject.info, apiKey);
        updateProject(currentProject.id, { globalContext: result });
        addToast("Đã hoàn thành phân tích bối cảnh!", "success");
    } catch (e: any) {
        addToast("Lỗi phân tích: " + e.message, "error");
    } finally { setIsAnalyzing(false); }
  };

  const createNewProject = async () => {
    if (!newProjectInfo.title.trim()) return addToast("Tên truyện trống", "warning");
    const projectId = generateId();
    const newProject: StoryProject = {
      id: projectId,
      info: { ...newProjectInfo, contextNotes: "" },
      chapters: [],
      promptTemplate: DEFAULT_PROMPT,
      dictionary: DEFAULT_DICTIONARY,
      globalContext: "",
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    await saveProject(newProject);
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(projectId);
    setShowNewProjectModal(false);
    addToast("Đã tạo truyện mới", "success");
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Xóa truyện?")) return;
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || !e.target.files?.length) return;
    const files = e.target.files;
    let newChapters: FileItem[] = [];
    const currentMaxOrder = currentProject.chapters.length > 0 ? Math.max(...currentProject.chapters.map(c => c.orderIndex)) + 1 : 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            if (file.name.endsWith('.zip')) {
                const unzipped = await unzipFiles(file, currentMaxOrder + newChapters.length);
                newChapters = [...newChapters, ...unzipped];
            } else {
                const content = await file.text();
                newChapters.push({ 
                    id: generateId(), 
                    orderIndex: currentMaxOrder + newChapters.length,
                    name: translateChapterTitle(file.name.replace('.txt', '')), 
                    content, translatedContent: null, status: FileStatus.IDLE, 
                    retryCount: 0, originalCharCount: content.length, remainingRawCharCount: 0 
                });
            }
        } catch (err) { addToast(`Lỗi đọc file: ${file.name}`, "error"); }
    }
    updateProject(currentProject.id, { chapters: [...currentProject.chapters, ...newChapters] });
    addToast(`Đã thêm ${newChapters.length} chương`, "success");
  };

  const handleRetranslate = (chapterId: string) => {
      if (!currentProject) return;
      updateProject(currentProject.id, { 
          chapters: currentProject.chapters.map(c => c.id === chapterId ? { ...c, status: FileStatus.IDLE, translatedContent: null } : c)
      });
      addToast("Đã đưa chương vào hàng chờ dịch lại.", "info");
      if (!isProcessing) startTranslation(false);
  };

  const handleLinkCrawl = async () => {
    if (!currentProject || isFetchingLinksRef.current) return;
    const startUrl = linkInput;
    if (!startUrl) return addToast("Nhập link!", "warning");

    isFetchingLinksRef.current = true;
    setIsFetchingLinks(true);
    setShowLinkModal(false);

    try {
        const result = await fetchContentFromUrl(startUrl);
        const nextOrder = currentProject.chapters.length;
        const newChapter: FileItem = { 
            id: generateId(), 
            orderIndex: nextOrder,
            name: result.title, 
            content: result.content, 
            translatedContent: null, status: FileStatus.IDLE, 
            retryCount: 0, originalCharCount: result.content.length, remainingRawCharCount: 0 
        };
        
        updateProject(currentProject.id, { 
            chapters: [...currentProject.chapters, newChapter], 
            lastCrawlUrl: result.nextUrl || startUrl 
        });
        addToast(`Đã nạp mốc chương mới.`, "success");
    } catch (e: any) { addToast(`Cào thất bại: ${e.message}`, "error"); } finally {
        isFetchingLinksRef.current = false;
        setIsFetchingLinks(false);
        setLinkInput("");
    }
  };

  const startTranslation = useCallback((retryAll: boolean = false) => {
    if (!currentProject) return;
    const toProcess = currentProject.chapters
        .filter(c => retryAll ? true : (c.status === FileStatus.IDLE || c.status === FileStatus.ERROR))
        .map(c => c.id);
    if (toProcess.length === 0 && !currentProject.lastCrawlUrl) return addToast("Tất cả đã xong", "info");
    
    setProcessingQueue(prev => [...new Set([...prev, ...toProcess])]);
    setIsProcessing(true);
    addToast("Bắt đầu dịch...", "success");
  }, [currentProject]);

  const stopTranslation = () => { setIsProcessing(false); setProcessingQueue([]); };

  useEffect(() => {
    if (!isProcessing || processingQueue.length === 0 || activeWorkers >= MAX_CONCURRENCY || !currentProjectId || !apiKey) return;
    const processBatch = async () => {
        const batchIds = processingQueue.slice(0, BATCH_FILE_LIMIT);
        setProcessingQueue(prev => prev.slice(BATCH_FILE_LIMIT));
        setActiveWorkers(prev => prev + 1);
        
        updateProject(currentProjectId, {
            chapters: currentProject!.chapters.map(c => batchIds.includes(c.id) ? { ...c, status: FileStatus.PROCESSING } : c)
        });

        try {
            const targetProj = projects.find(p => p.id === currentProjectId)!;
            const prompt = replacePromptVariables(targetProj.promptTemplate, targetProj.info);
            const { results, model } = await translateBatch(
                targetProj.chapters.filter(c => batchIds.includes(c.id)), 
                prompt, targetProj.dictionary, targetProj.globalContext, 
                MODEL_CONFIGS.map(m => m.id), apiKey
            );
            
            updateProject(currentProjectId, { chapters: targetProj.chapters.map(c => {
                if (batchIds.includes(c.id)) {
                    const translated = results.get(c.id);
                    if (translated) {
                        const firstLine = translated.split('\n')[0];
                        const newName = firstLine.length < 100 ? translateChapterTitle(firstLine) : c.name;
                        return { ...c, name: newName, status: FileStatus.COMPLETED, translatedContent: translated, usedModel: model };
                    }
                    return { ...c, status: FileStatus.ERROR };
                }
                return c;
            }) });
        } catch (e: any) {
            addToast(`Lỗi: ${e.message}`, 'error');
            updateProject(currentProjectId, { chapters: currentProject!.chapters.map(c => batchIds.includes(c.id) ? { ...c, status: FileStatus.ERROR } : c) });
        } finally { setActiveWorkers(prev => prev - 1); }
    };
    processBatch();
  }, [isProcessing, processingQueue.length, activeWorkers, currentProjectId]);

  const sortedChapters = useMemo(() => {
    if (!currentProject) return [];
    return [...currentProject.chapters].sort((a, b) => a.orderIndex - b.orderIndex);
  }, [currentProject]);

  const handleExportEpub = async () => {
    if (!currentProject) return;
    const completed = currentProject.chapters.filter(c => c.status === FileStatus.COMPLETED);
    if (completed.length === 0) return addToast("Chưa có chương nào dịch xong.", "warning");
    try {
        addToast("Đang tạo EPUB...", "info");
        const blob = await generateEpub(currentProject.chapters, currentProject.info);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.info.title}.epub`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e: any) { addToast("Lỗi xuất EPUB: " + e.message, "error"); }
  };

  const closeReader = () => { isReaderActiveRef.current = false; setViewingFileId(null); if(synthesisRef.current) synthesisRef.current.cancel(); };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl">
                <Key className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Nhập Gemini API Key</h2>
                <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className="w-full p-4 rounded-xl bg-slate-100 mb-4 outline-none" placeholder="Paste your key here..." />
                <button onClick={handleSaveApiKey} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Lưu & Bắt đầu</button>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="block mt-4 text-xs text-indigo-500 underline">Lấy key tại Google AI Studio</a>
            </div>
        </div>
      )}

      <aside className={`fixed lg:relative z-50 w-72 h-full bg-white border-r transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-indigo-600 mb-4">AI Novel Pro</h1>
            <button onClick={() => setShowNewProjectModal(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold"><Plus className="w-5 h-5" />Tạo Truyện</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {projects.map(p => (
              <div key={p.id} onClick={() => setCurrentProjectId(p.id)} className={`p-4 rounded-xl cursor-pointer flex items-center justify-between ${currentProjectId === p.id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50 border-transparent'} border`}>
                <div className="truncate pr-2">
                  <p className="font-bold text-sm truncate">{p.info.title}</p>
                  <p className="text-xs text-slate-400">{p.chapters.length} chương</p>
                </div>
                <button onClick={(e) => handleDeleteProject(p.id, e)} className="text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t space-y-2">
            <button onClick={() => setShowApiKeyModal(true)} className="w-full flex items-center gap-2 p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"><Key className="w-4 h-4" /> Đổi API Key</button>
            <button onClick={toggleWakeLock} className="w-full flex items-center gap-2 p-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">{isWakeLockActive ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />} Giữ sáng màn hình</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2"><Menu /></button>
            <h2 className="font-bold truncate">{currentProject?.info.title || "Chọn truyện"}</h2>
          </div>
          {currentProject && (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowContextSetup(true)} className="p-2 bg-slate-50 rounded-lg hover:bg-slate-100"><Brain className="w-5 h-5 text-indigo-600" /></button>
              <button onClick={() => isProcessing ? stopTranslation() : startTranslation()} className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm flex items-center gap-2 ${isProcessing ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span className="hidden sm:inline">{isProcessing ? "Dừng" : "Dịch"}</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {currentProject ? (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-wrap gap-2">
                <input type="file" id="fileup" hidden multiple accept=".txt,.zip" onChange={handleFileUpload} />
                <label htmlFor="fileup" className="px-4 py-2 bg-white border rounded-xl cursor-pointer flex items-center gap-2 text-sm font-bold"><PlusCircle className="w-4 h-4" /> Thêm chương</label>
                <button onClick={() => setShowLinkModal(true)} className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2 text-sm font-bold"><Link2 className="w-4 h-4" /> Cào Link</button>
                <button onClick={() => downloadTextFile(`${currentProject.info.title}.txt`, createMergedFile(currentProject.chapters))} className="px-4 py-2 bg-white border rounded-xl flex items-center gap-2 text-sm font-bold"><Download className="w-4 h-4" /> Xuất TXT</button>
                <button onClick={handleExportEpub} className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-md"><FileOutput className="w-4 h-4" /> Xuất EPUB</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedChapters.map((ch) => {
                  const { label, color } = getStatusLabel(ch.status);
                  return (
                    <div key={ch.id} className="bg-white p-4 rounded-2xl border hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h4 className="font-bold text-sm line-clamp-2" title={ch.name}>{ch.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${color}`}>{label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-slate-400">#{ch.orderIndex + 1}</span>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {ch.status === FileStatus.COMPLETED && (
                                <>
                                    <button onClick={() => setViewingFileId(ch.id)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg" title="Đọc"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => handleRetranslate(ch.id)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg" title="Dịch lại"><RefreshCw className="w-4 h-4" /></button>
                                </>
                            )}
                            <button onClick={() => updateProject(currentProject.id, { chapters: currentProject.chapters.filter(c => c.id !== ch.id) })} className="p-1.5 bg-rose-50 text-rose-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Book className="w-16 h-16 mb-4 opacity-20" />
               <p>Chọn hoặc tạo một bộ truyện để bắt đầu</p>
            </div>
          )}
        </div>
      </main>

      {/* Reader Overlay logic should follow here, I'll keep it concise for the update */}
      {viewingFileId && (
          <div className={`fixed inset-0 z-[60] flex flex-col bg-white overflow-hidden`}>
              <header className="h-16 border-b flex items-center justify-between px-6 bg-slate-50">
                  <button onClick={closeReader} className="p-2"><X /></button>
                  <h3 className="font-bold truncate max-w-xs">{sortedChapters.find(c => c.id === viewingFileId)?.name}</h3>
                  <div className="w-10"></div>
              </header>
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                  <div className="max-w-2xl mx-auto space-y-6 text-lg leading-relaxed font-serif">
                      {sortedChapters.find(c => c.id === viewingFileId)?.translatedContent?.split('\n').map((line, i) => (
                          <p key={i}>{line.trim()}</p>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Modal New Project */}
      {showNewProjectModal && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6">Tạo truyện mới</h3>
                  <input type="text" placeholder="Tiêu đề truyện" value={newProjectInfo.title} onChange={e => setNewProjectInfo({...newProjectInfo, title: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl mb-6 outline-none font-bold" />
                  <div className="flex gap-4">
                      <button onClick={() => setShowNewProjectModal(false)} className="flex-1 font-bold text-slate-400">Hủy</button>
                      <button onClick={createNewProject} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">Xác nhận</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Crawl */}
      {showLinkModal && (
          <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                  <h3 className="text-xl font-bold mb-4">Cào Link Chương</h3>
                  <p className="text-xs text-slate-400 mb-4 italic">* Hệ thống sẽ bắt đầu từ link này và tự động tìm chương tiếp theo.</p>
                  <input type="text" placeholder="Dán URL chương 1 vào đây..." value={linkInput} onChange={e => setLinkInput(e.target.value)} className="w-full p-4 bg-slate-100 rounded-xl mb-6 outline-none" />
                  <div className="flex gap-4">
                      <button onClick={() => setShowLinkModal(false)} className="flex-1 font-bold text-slate-400">Hủy</button>
                      <button onClick={handleLinkCrawl} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg">Bắt đầu cào</button>
                  </div>
              </div>
          </div>
      )}

      {/* Toasts Rendering */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
              <div key={t.id} className={`p-4 rounded-2xl shadow-xl border bg-white pointer-events-auto flex items-center gap-3 animate-in slide-in-from-right ${t.type === 'success' ? 'border-emerald-100' : 'border-slate-100'}`}>
                  {t.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Info className="w-4 h-4 text-indigo-500" />}
                  <span className="text-sm font-bold">{t.message}</span>
              </div>
          ))}
      </div>
    </div>
  );
};

export default App;
