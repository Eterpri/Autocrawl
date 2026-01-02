
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

  const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId) || null, [projects, currentProjectId]);

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

  const [newProjectInfo, setNewProjectInfo] = useState({
      title: '', author: '', languages: ['Convert thô'], genres: ['Tiên Hiệp'], mcPersonality: ['Trầm ổn/Già dặn'], worldSetting: ['Trung Cổ/Cổ Đại'], sectFlow: ['Phàm nhân lưu']
  });

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
    const startUrl = linkInput.trim();
    if (!startUrl) return addToast("Vui lòng nhập link chương!", "warning");

    isFetchingLinksRef.current = true;
    setIsFetchingLinks(true);

    try {
        const result = await fetchContentFromUrl(startUrl);
        const nextOrder = currentProject.chapters.length > 0 ? Math.max(...currentProject.chapters.map(c => c.orderIndex)) + 1 : 0;
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
        addToast(`Đã nạp thành công: ${result.title}`, "success");
        setLinkInput("");
        setShowLinkModal(false);
    } catch (e: any) { 
        addToast(`Cào thất bại: ${e.message}. Hãy thử lại hoặc dùng link khác.`, "error"); 
    } finally {
        isFetchingLinksRef.current = false;
        setIsFetchingLinks(false);
    }
  };

  const startTranslation = useCallback((retryAll: boolean = false) => {
    if (!currentProject) return;
    const toProcess = currentProject.chapters
        .filter(c => retryAll ? true : (c.status === FileStatus.IDLE || c.status === FileStatus.ERROR))
        .map(c => c.id);
    if (toProcess.length === 0) return addToast("Tất cả đã xong hoặc không có chương chờ dịch", "info");
    
    setProcessingQueue(prev => [...new Set([...prev, ...toProcess])]);
    setIsProcessing(true);
    addToast("Bắt đầu hàng chờ dịch...", "success");
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
            addToast(`Lỗi API: ${e.message}`, 'error');
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

  const closeReader = () => { setViewingFileId(null); };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Loading Overlay for Crawling */}
      {isFetchingLinks && !showLinkModal && (
        <div className="fixed inset-0 z-[110] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="font-bold text-slate-700">Đang cào dữ liệu chương...</p>
        </div>
      )}

      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center shadow-2xl">
                <Key className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Nhập Gemini API Key</h2>
                <input type="password" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className="w-full p-4 rounded-xl bg-slate-100 mb-4 outline-none border focus:border-indigo-500" placeholder="Paste your key here..." />
                <button onClick={handleSaveApiKey} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Lưu & Bắt đầu</button>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="block mt-4 text-xs text-indigo-500 underline">Lấy key tại Google AI Studio</a>
            </div>
        </div>
      )}

      <aside className={`fixed lg:relative z-50 w-72 h-full bg-white border-r transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
               <BookOpen className="w-6 h-6" /> AI Novel Pro
            </h1>
            <button onClick={() => setShowNewProjectModal(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-indigo-700 transition-colors shadow-md">
              <Plus className="w-5 h-5" /> Tạo Truyện
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {projects.map(p => (
              <div key={p.id} onClick={() => { setCurrentProjectId(p.id); setIsSidebarOpen(false); }} className={`p-4 rounded-xl cursor-pointer flex items-center justify-between ${currentProjectId === p.id ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-slate-50 border-transparent'} border transition-all shadow-sm`}>
                <div className="truncate pr-2">
                  <p className="font-bold text-sm truncate">{p.info.title}</p>
                  <p className="text-xs text-slate-400">{p.chapters.length} chương</p>
                </div>
                <button onClick={(e) => handleDeleteProject(p.id, e)} className="text-slate-300 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t space-y-2 bg-slate-50/50">
            <button onClick={() => setShowApiKeyModal(true)} className="w-full flex items-center gap-2 p-2.5 text-sm text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"><Key className="w-4 h-4" /> Đổi API Key</button>
            <button onClick={toggleWakeLock} className="w-full flex items-center gap-2 p-2.5 text-sm text-slate-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">{isWakeLockActive ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />} Giữ sáng màn hình</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4 overflow-hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu /></button>
            <h2 className="font-bold truncate text-slate-800">{currentProject?.info.title || "Vui lòng chọn hoặc tạo truyện mới"}</h2>
          </div>
          {currentProject && (
            <div className="flex items-center gap-2">
              <button onClick={() => setShowContextSetup(true)} className="p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 text-indigo-600 border border-slate-200" title="Phân tích bối cảnh"><Brain className="w-5 h-5" /></button>
              <button onClick={() => isProcessing ? stopTranslation() : startTranslation()} className={`px-5 py-2.5 rounded-lg font-bold text-white shadow-md flex items-center gap-2 transition-all active:scale-95 ${isProcessing ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span className="hidden sm:inline">{isProcessing ? "Dừng dịch" : "Bắt đầu dịch"}</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentProject ? (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-wrap gap-3 p-1">
                <input type="file" id="fileup" hidden multiple accept=".txt,.zip" onChange={handleFileUpload} />
                <label htmlFor="fileup" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer flex items-center gap-2 text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"><PlusCircle className="w-4 h-4 text-indigo-500" /> Thêm file .txt/.zip</label>
                <button onClick={() => setShowLinkModal(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"><Link2 className="w-4 h-4 text-indigo-500" /> Cào link chương</button>
                <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                <button onClick={() => downloadTextFile(`${currentProject.info.title}.txt`, createMergedFile(currentProject.chapters))} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-700 shadow-sm hover:border-indigo-200 transition-all"><Download className="w-4 h-4" /> Xuất bản TXT</button>
                <button onClick={handleExportEpub} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all"><FileOutput className="w-4 h-4" /> Xuất bản EPUB</button>
              </div>

              {currentProject.chapters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedChapters.map((ch) => {
                    const { label, color } = getStatusLabel(ch.status);
                    return (
                      <div key={ch.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all group relative overflow-hidden">
                        {ch.status === FileStatus.PROCESSING && (
                           <div className="absolute top-0 left-0 h-1 bg-indigo-500 animate-pulse w-full"></div>
                        )}
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <h4 className="font-bold text-sm line-clamp-2 text-slate-800 leading-tight" title={ch.name}>{ch.name}</h4>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shrink-0 tracking-wider ${color}`}>{label}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                           <span className="text-xs font-medium text-slate-400">Chương {ch.orderIndex + 1}</span>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {ch.status === FileStatus.COMPLETED && (
                                  <>
                                      <button onClick={() => setViewingFileId(ch.id)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 hover:bg-indigo-100" title="Đọc chương"><Eye className="w-4 h-4" /></button>
                                      <button onClick={() => handleRetranslate(ch.id)} className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 hover:bg-amber-100" title="Dịch lại"><RefreshCw className="w-4 h-4" /></button>
                                  </>
                              )}
                              <button onClick={() => updateProject(currentProject.id, { chapters: currentProject.chapters.filter(c => c.id !== ch.id) })} className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-500">Chưa có chương nào trong bộ này</p>
                        <p className="text-sm text-slate-400 mt-1">Hãy thêm file hoặc dán link chương 1 để bắt đầu</p>
                    </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Book className="w-24 h-24 mb-6 opacity-10 animate-pulse" />
               <p className="text-lg font-medium">Chọn một dự án truyện từ thanh bên</p>
               <button onClick={() => setShowNewProjectModal(true)} className="mt-4 text-indigo-600 font-bold hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Hoặc tạo truyện mới ngay</button>
            </div>
          )}
        </div>
      </main>

      {/* Reader Overlay */}
      {viewingFileId && (
          <div className="fixed inset-0 z-[120] flex flex-col bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
              <header className="h-16 border-b flex items-center justify-between px-6 bg-slate-50/80 backdrop-blur-md">
                  <button onClick={closeReader} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
                  <h3 className="font-bold truncate max-w-xs md:max-w-md text-slate-800">{sortedChapters.find(c => c.id === viewingFileId)?.name}</h3>
                  <div className="flex gap-2">
                     <button onClick={() => window.print()} className="p-2.5 hover:bg-slate-200 rounded-full text-slate-500 hidden sm:block"><Download className="w-5 h-5" /></button>
                  </div>
              </header>
              <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 bg-[#fbfbfb]">
                  <div className="max-w-3xl mx-auto space-y-8 text-[20px] leading-[1.8] font-serif text-slate-900 selection:bg-indigo-100">
                      {sortedChapters.find(c => c.id === viewingFileId)?.translatedContent?.split('\n').filter(l => l.trim()).map((line, i) => (
                          <p key={i} className="mb-4">{line.trim()}</p>
                      ))}
                  </div>
                  <div className="h-32"></div>
              </div>
          </div>
      )}

      {/* Modal New Project */}
      {showNewProjectModal && (
          <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2"><PlusCircle className="text-indigo-600" /> Tạo bộ truyện mới</h3>
                  <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Tên truyện</label>
                        <input type="text" placeholder="Ví dụ: Phàm Nhân Tu Tiên" value={newProjectInfo.title} onChange={e => setNewProjectInfo({...newProjectInfo, title: e.target.value})} className="w-full p-4 bg-slate-100 rounded-xl outline-none font-bold border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all" />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                      <button onClick={() => setShowNewProjectModal(false)} className="flex-1 font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
                      <button onClick={createNewProject} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">Tạo ngay</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Crawl */}
      {showLinkModal && (
          <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Cào link chương</h3>
                    <button onClick={() => setShowLinkModal(false)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-xs text-slate-500 mb-6 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <Info className="w-4 h-4 inline mr-1 -mt-0.5 text-indigo-500" /> 
                    Dán link chương bạn muốn lấy nội dung. Hệ thống sẽ cố gắng tìm chương tiếp theo tự động sau khi tải xong.
                  </p>
                  <input 
                    type="text" 
                    placeholder="Dán link (URL) chương vào đây..." 
                    value={linkInput} 
                    onChange={e => setLinkInput(e.target.value)} 
                    disabled={isFetchingLinks}
                    className="w-full p-4 bg-slate-100 rounded-xl mb-8 outline-none border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all" 
                  />
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setShowLinkModal(false)} 
                        disabled={isFetchingLinks}
                        className="flex-1 font-bold text-slate-400 disabled:opacity-50"
                      >
                        Đóng
                      </button>
                      <button 
                        onClick={handleLinkCrawl} 
                        disabled={isFetchingLinks}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${isFetchingLinks ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      >
                        {isFetchingLinks ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
                        {isFetchingLinks ? "Đang cào..." : "Bắt đầu cào"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Toasts Rendering */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
          {toasts.map(t => (
              <div key={t.id} className={`p-4 rounded-2xl shadow-2xl border-2 bg-white pointer-events-auto flex items-start gap-3 animate-in slide-in-from-right duration-300 ${t.type === 'success' ? 'border-emerald-100' : t.type === 'error' ? 'border-rose-100' : 'border-indigo-100'}`}>
                  {t.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> : t.type === 'error' ? <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                      <p className={`text-sm font-bold ${t.type === 'success' ? 'text-emerald-800' : t.type === 'error' ? 'text-rose-800' : 'text-indigo-800'}`}>{t.message}</p>
                  </div>
                  <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-slate-300 hover:text-slate-500"><X className="w-4 h-4" /></button>
              </div>
          ))}
      </div>
    </div>
  );
};

export default App;
