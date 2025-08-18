// 为 mammoth 包的部分功能添加补充类型
declare module 'mammoth' {
  interface ExtractRawTextResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  
  export function extractRawText(options: { path: string }): Promise<ExtractRawTextResult>;
}
