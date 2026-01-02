
export enum FileStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  REPAIRING = 'REPAIRING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface FileItem {
  id: string;
  orderIndex: number; // Thêm để quản lý thứ tự tuyệt đối
  name: string;
  content: string;
  translatedContent: string | null;
  status: FileStatus;
  errorMessage?: string;
  retryCount: number;
  originalCharCount: number;
  remainingRawCharCount: number;
  usedModel?: string;
}

export interface StoryInfo {
  title: string;
  author: string;
  languages: string[];
  genres: string[];
  mcPersonality: string[];
  worldSetting: string[];
  sectFlow: string[];
  contextNotes?: string;
}

export interface ReaderSettings {
  fontSize: number;
  bgColor: string;
  fontFamily: string;
  ttsVoice?: string;
  ttsRate?: number;
  showOriginal?: boolean;
  autoScrollSpeed?: number;
  isAutoScrollActive?: boolean;
}

export interface StoryProject {
  id: string;
  info: StoryInfo;
  chapters: FileItem[];
  promptTemplate: string;
  dictionary: string;
  globalContext: string;
  createdAt: number;
  lastModified: number;
  lastCrawlUrl?: string;
  readerSettings?: ReaderSettings;
}

export interface ModelQuota {
  id: string;
  name: string;
  rpmLimit: number;
  rpdLimit: number;
  priority: number;
  maxOutputTokens: number;
}

export interface ModelUsage {
  requestsToday: number;
  lastResetDate: string;
  recentRequests: number[];
  cooldownUntil: number;
  isDepleted: boolean;
}
