import pandoc from 'node-pandoc';
import fs from 'fs/promises';
import path from 'path';

// 定义转换选项类型
interface ConvertOptions {
  from: 'markdown' | 'html' | 'docx' | 'latex';
  to: 'docx' | 'html' | 'latex' | 'pdf' | 'plain';
  outputDir?: string;
  template?: string;
  extraArgs?: string[];
}

// 定义转换结果类型
interface ConvertResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

class PandocConverter {
  private outputBaseDir: string;

  constructor(outputBaseDir: string = './public/downloads') {
    this.outputBaseDir = outputBaseDir;
  }

  /**
   * 将文本内容转换为目标格式
   * @param content 输入内容
   * @param options 转换选项
   * @returns 转换结果
   */
  async convertContent(
    content: string,
    options: ConvertOptions
  ): Promise<ConvertResult> {
    try {
      // 确保输出目录存在
      await fs.mkdir(this.outputBaseDir, { recursive: true });

      // 生成唯一文件名
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const inputFile = path.join(this.outputBaseDir, `${fileName}.${options.from}`);
      const outputFile = path.join(this.outputBaseDir, `${fileName}.${options.to}`);

      // 写入输入文件
      await fs.writeFile(inputFile, content, 'utf8');

      // 构建转换参数
      const args = [
        inputFile,
        '-f',
        options.from,
        '-t',
        options.to,
        '-o',
        outputFile,
      ];

      // 添加额外参数
      if (options.extraArgs) {
        args.push(...options.extraArgs);
      }

      // 执行转换
      return new Promise((resolve) => {
        pandoc(args, (err, result) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
            });
          } else {
            resolve({
              success: true,
              outputPath: outputFile,
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * 提取DOCX文档的纯文本
   * @param filePath DOCX文件路径
   * @returns 提取的文本内容
   */
  async extractTextFromDocx(filePath: string): Promise<ConvertResult> {
    try {
      const fileName = path.basename(filePath, '.docx');
      const outputFile = path.join(this.outputBaseDir, `${fileName}.txt`);

      const args = [filePath, '-f', 'docx', '-t', 'plain', '-o', outputFile];

      return new Promise((resolve) => {
        pandoc(args, (err, result) => {
          if (err) {
            resolve({
              success: false,
              error: err.message,
            });
          } else {
            resolve({
              success: true,
              outputPath: outputFile,
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }
}

// 创建并导出单例
const pandocConverter = new PandocConverter();

export default pandocConverter;