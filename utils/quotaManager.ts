
import { ModelQuota, ModelUsage } from './types';
import { MODEL_CONFIGS } from '../constants';

const STORAGE_KEY = 'gemini_quota_usage_v1';

class QuotaManager {
  private usage: Record<string, ModelUsage> = {};
  private listeners: (() => void)[] = [];
  // Store configs internally so they can be updated dynamically
  private currentConfigs: ModelQuota[] = [...MODEL_CONFIGS];

  constructor() {
    this.loadUsage();
  }

  // Allow App to update configs (e.g. from user edits)
  public updateConfigs(newConfigs: ModelQuota[]) {
    this.currentConfigs = newConfigs;
    this.notifyListeners();
  }

  public getConfigs(): ModelQuota[] {
    return this.currentConfigs;
  }

  private loadUsage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.usage = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load quota usage", e);
    }
    
    // Initialize missing models and check for daily reset
    const today = new Date().toISOString().split('T')[0];
    
    // Use currentConfigs instead of static import
    this.currentConfigs.forEach(model => {
      if (!this.usage[model.id] || this.usage[model.id].lastResetDate !== today) {
        // Reset daily counters
        this.usage[model.id] = {
          requestsToday: 0,
          lastResetDate: today,
          recentRequests: [],
          cooldownUntil: 0,
          isDepleted: false
        };
      }
    });
    this.saveUsage();
  }

  private saveUsage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.usage));
      this.notifyListeners();
    } catch (e) {
      console.error("Failed to save quota usage", e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public getModelUsage(modelId: string): ModelUsage {
    return this.usage[modelId];
  }

  /**
   * Check if a model is currently available for use.
   * Checks: Depleted status, Daily Limit (RPD), Explicit Cooldown, and RPM limit.
   */
  public isModelAvailable(modelId: string): boolean {
    const usage = this.usage[modelId];
    // Find config from dynamic state
    const modelConfig = this.currentConfigs.find(m => m.id === modelId);
    
    if (!usage || !modelConfig) return false;

    // 0. Check Depleted State (Quota Exceeded)
    if (usage.isDepleted) {
        return false;
    }

    const now = Date.now();

    // 1. Check Daily Limit (Requests Per Day)
    if (usage.requestsToday >= modelConfig.rpdLimit) {
      return false;
    }

    // 2. Check Explicit Cooldown (from 429 errors)
    if (usage.cooldownUntil > now) {
      return false;
    }

    // 3. Check RPM (Requests Per Minute) - Local estimation
    // Filter out requests older than 1 minute
    const recent = usage.recentRequests.filter(t => now - t < 60000);
    // If we have reached the limit in the last minute, consider it busy
    if (recent.length >= modelConfig.rpmLimit) {
      return false;
    }

    return true;
  }

  /**
   * Check if ANY of the provided model IDs are available.
   */
  public hasAvailableModels(modelIds: string[]): boolean {
      return modelIds.some(id => this.isModelAvailable(id));
  }

  /**
   * Returns seconds to wait until RPM limit clears.
   * Returns 0 if not limited by RPM.
   */
  public getRpmWaitTime(modelId: string): number {
    const usage = this.usage[modelId];
    const modelConfig = this.currentConfigs.find(m => m.id === modelId);
    if (!usage || !modelConfig) return 0;

    const now = Date.now();
    const recent = usage.recentRequests.filter(t => now - t < 60000);

    if (recent.length >= modelConfig.rpmLimit) {
        // Find the oldest request in the current window. 
        // We need to wait until (oldest + 60s) < now
        // Sort ascending just in case
        const sorted = recent.sort((a, b) => a - b);
        // The slot will free up when the oldest request becomes > 60s old
        // Wait time = (OldestTime + 60000) - Now
        const oldest = sorted[0]; // The request that needs to "expire" first
        const waitTime = Math.ceil(((oldest + 60000) - now) / 1000);
        return waitTime > 0 ? waitTime : 0;
    }
    return 0;
  }

  /**
   * Returns the best available model based on priority and current quota status.
   * If all models are exhausted/cooling down, returns null.
   */
  public getBestAvailableModel(): string | null {
    // Sort by priority
    const sortedModels = [...this.currentConfigs].sort((a, b) => a.priority - b.priority);

    for (const model of sortedModels) {
      if (this.isModelAvailable(model.id)) {
        return model.id;
      }
    }

    return null; // All models busy or depleted
  }

  /**
   * Call this when a request is successfully sent
   */
  public recordRequest(modelId: string) {
    const usage = this.usage[modelId];
    if (usage) {
      usage.requestsToday++;
      usage.recentRequests.push(Date.now());
      
      // Clean up old requests to keep array small
      const now = Date.now();
      usage.recentRequests = usage.recentRequests.filter(t => now - t < 60000);
      
      this.saveUsage();
    }
  }

  /**
   * Call this when a 429 (Too Many Requests) error occurs (Short term block)
   */
  public recordRateLimit(modelId: string) {
    const usage = this.usage[modelId];
    if (usage) {
      // Set cooldown for 60 seconds (standard backoff)
      usage.cooldownUntil = Date.now() + 60000; 
      this.saveUsage();
    }
  }

  /**
   * Call this when a "Quota Exceeded" / "Resource Exhausted" error occurs (Long term block)
   */
  public markAsDepleted(modelId: string) {
      const usage = this.usage[modelId];
      if (usage) {
          usage.isDepleted = true;
          // Set cooldown for 1 hour just in case logic checks cooldown first
          usage.cooldownUntil = Date.now() + 3600000; 
          this.saveUsage();
          console.warn(`Model ${modelId} has been marked as DEPLETED (Quota Exceeded) for today.`);
      }
  }

  /**
   * Returns the time remaining for a specific model's cooldown (Explicit 429)
   */
  public getCooldownRemaining(modelId: string): number {
    const usage = this.usage[modelId];
    if (!usage || usage.cooldownUntil <= Date.now()) return 0;
    return Math.ceil((usage.cooldownUntil - Date.now()) / 1000);
  }

  /**
   * Reset all quota data (Used for App Reset)
   */
  public reset() {
    this.usage = {};
    localStorage.removeItem(STORAGE_KEY);
    this.loadUsage(); // Re-init defaults
    this.notifyListeners();
  }

  /**
   * Manually reset daily quotas for all models.
   * Useful if the automatic date check fails or user wants to force reset.
   */
  public resetDailyQuotas() {
    const today = new Date().toISOString().split('T')[0];
    for (const key in this.usage) {
        this.usage[key] = {
            ...this.usage[key],
            requestsToday: 0,
            isDepleted: false,
            lastResetDate: today
        };
    }
    this.saveUsage();
  }
}

export const quotaManager = new QuotaManager();