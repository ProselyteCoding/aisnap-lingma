import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  // 用户设置
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // UI状态
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  
  // 模板配置
  templateConfig: {
    font: string;
    fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
    style: 'simple' | 'classic' | 'modern' | 'academic';
    watermark: 'none' | 'text' | 'logo';
    aiLogo: 'none' | 'tongyi' | 'wenxin' | 'spark';
  };
  setTemplateConfig: (config: Partial<AppState['templateConfig']>) => void;
}

export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      // 默认主题
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      
      // 默认处理状态
      isProcessing: false,
      setIsProcessing: (isProcessing) => set({ isProcessing }),
      
      // 默认模板配置
      templateConfig: {
        font: 'Microsoft YaHei',
        fontSize: 'medium',
        style: 'simple',
        watermark: 'none',
        aiLogo: 'tongyi',
      },
      setTemplateConfig: (config) => set((state) => ({
        templateConfig: { ...state.templateConfig, ...config }
      })),
    }),
  )
);