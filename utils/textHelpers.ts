
// Regex to detect Chinese (Hanzi), Japanese (Hiragana/Katakana), Korean (Hangul), and Cyrillic
export const FOREIGN_CHARS_REGEX = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u0400-\u04ff]/;

export interface LineContext {
  index: number;
  originalLine: string;
}

export const findLinesWithForeignChars = (text: string): LineContext[] => {
  if (!text) return [];
  const lines = text.split('\n');
  const badLines: LineContext[] = [];

  lines.forEach((line, index) => {
    // Check if line contains foreign characters, ignore empty lines or lines with only symbols
    if (line.trim().length > 0 && FOREIGN_CHARS_REGEX.test(line)) {
      badLines.push({
        index,
        originalLine: line,
      });
    }
  });

  return badLines;
};

export const mergeFixedLines = (fullText: string, fixedLines: { index: number; text: string }[]): string => {
  const lines = fullText.split('\n');
  
  fixedLines.forEach((fix) => {
    if (fix.index >= 0 && fix.index < lines.length) {
      lines[fix.index] = fix.text;
    }
  });

  return lines.join('\n');
};

export const countForeignChars = (text: string): number => {
  if (!text) return 0;
  // Create a global version of the regex for matching all occurrences
  const globalRegex = new RegExp(FOREIGN_CHARS_REGEX, 'g');
  const matches = text.match(globalRegex);
  return matches ? matches.length : 0;
};

export const replacePromptVariables = (template: string, info: any): string => {
    if (!template) return "";
    let result = template;
    const val = (v: any) => {
        if (Array.isArray(v)) return v.join(', ');
        return v ? String(v) : 'Chưa rõ';
    };
    
    result = result.replace(/\{\{TITLE\}\}/g, val(info.title));
    result = result.replace(/\{\{AUTHOR\}\}/g, val(info.author));
    result = result.replace(/\{\{LANGUAGE\}\}/g, val(info.languages));
    result = result.replace(/\{\{GENRE\}\}/g, val(info.genres));
    result = result.replace(/\{\{PERSONALITY\}\}/g, val(info.mcPersonality));
    result = result.replace(/\{\{SETTING\}\}/g, val(info.worldSetting));
    result = result.replace(/\{\{FLOW\}\}/g, val(info.sectFlow));
    
    return result;
};
