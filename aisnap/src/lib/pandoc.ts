import pandoc from 'node-pandoc';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import tmp from 'tmp';

const execPromise = promisify(exec);

// 定义接口
export interface ConvertOptions {
  from: string;
  to: string;
  extraArgs?: string[];
}

export interface ConvertResult {
  success: boolean;
  result?: string;
  outputPath?: string;
  error?: string;
}

export interface PandocResult {
  success: boolean;
  result?: string;
  outputPath?: string;
  error?: string;
}

class PandocConverter {
  private outputBaseDir: string;

  constructor(outputBaseDir: string = './public/downloads') {
    this.outputBaseDir = outputBaseDir;
  }

  /**
   * 检查系统是否安装了pandoc
   */
  private async checkPandocInstallation(): Promise<boolean> {
    try {
      await execPromise('pandoc --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查node-pandoc是否正常工作
   */
  private async isNodePandocWorking(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // 简单测试转换
        pandoc('# Test', '--from=markdown --to=html', (err, result) => {
          resolve(!err && typeof result === 'string');
        });
      } catch {
        resolve(false);
      }
    });
  }

  /**
   * 使用node-pandoc进行转换
   */
  private async convertWithNodePandoc(
    content: string,
    options: ConvertOptions
  ): Promise<ConvertResult> {
    if (['docx', 'html', 'latex', 'pdf'].includes(options.to)) {
      // 文件输出模式
      await fs.mkdir(this.outputBaseDir, { recursive: true });
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const outputFile = path.resolve(this.outputBaseDir, `${fileName}.${options.to}`);
      
      let args = `--from=${options.from} --to=${options.to} --output="${outputFile}"`;
      if (options.extraArgs && options.extraArgs.length > 0) {
        args += ' ' + options.extraArgs.join(' ');
      }

      return new Promise((resolve) => {
        pandoc(content, args, (err: Error | null) => {
          if (err) {
            resolve({
              success: false,
              error: `Node-pandoc转换错误: ${err.message}`,
            });
          } else {
            resolve({
              success: true,
              outputPath: outputFile,
            });
          }
        });
      });
    } else {
      // 文本输出模式
      let args = `--from=${options.from} --to=${options.to}`;
      if (options.extraArgs && options.extraArgs.length > 0) {
        args += ' ' + options.extraArgs.join(' ');
      }

      return new Promise((resolve) => {
        pandoc(content, args, (err: Error | null, result: string | boolean) => {
          if (err) {
            resolve({
              success: false,
              error: `Node-pandoc转换错误: ${err.message}`,
            });
          } else {
            resolve({
              success: true,
              result: result as string,
            });
          }
        });
      });
    }
  }

  /**
   * 使用系统pandoc调用进行转换
   */
  private async convertWithSystemPandoc(
    content: string,
    options: ConvertOptions
  ): Promise<ConvertResult> {
    return new Promise((resolve) => {
      // 创建临时输入文件
      const inputFile = tmp.fileSync({ 
        postfix: `.${options.from}`,
        keep: false // 自动清理
      });
      
      try {
        // 写入内容到临时文件
        fsSync.writeFileSync(inputFile.name, content, 'utf8');
        
        if (['docx', 'html', 'latex', 'pdf'].includes(options.to)) {
          // 文件输出模式
          this.convertToFileWithSystemPandoc(inputFile, options, resolve);
        } else {
          // 文本输出模式
          this.convertToTextWithSystemPandoc(inputFile, options, resolve);
        }
      } catch (error) {
        inputFile.removeCallback();
        resolve({
          success: false,
          error: `创建临时文件失败: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    });
  }

  /**
   * 系统pandoc文件输出转换
   */
  private async convertToFileWithSystemPandoc(
    inputFile: tmp.FileResult,
    options: ConvertOptions,
    resolve: (result: ConvertResult) => void
  ): Promise<void> {
    try {
      await fs.mkdir(this.outputBaseDir, { recursive: true });
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const outputFile = path.resolve(this.outputBaseDir, `${fileName}.${options.to}`);
      
      // 构建pandoc参数
      const args = [
        inputFile.name,
        '--from', options.from,
        '--to', options.to,
        '--output', outputFile
      ];
      
      if (options.extraArgs && options.extraArgs.length > 0) {
        args.push(...options.extraArgs);
      }
      
      console.log('System pandoc command:', 'pandoc', args.join(' '));
      
      // 使用spawn执行命令
      const pandocProcess = spawn('pandoc', args);
      
      let stderr = '';
      pandocProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pandocProcess.on('close', async (code) => {
        inputFile.removeCallback(); // 清理临时文件
        
        if (code === 0) {
          try {
            await fs.access(outputFile);
            resolve({
              success: true,
              outputPath: outputFile,
            });
          } catch {
            resolve({
              success: false,
              error: '转换完成但输出文件未找到',
            });
          }
        } else {
          resolve({
            success: false,
            error: `Pandoc进程退出，代码: ${code}${stderr ? `，错误: ${stderr}` : ''}`,
          });
        }
      });
      
      pandocProcess.on('error', (error) => {
        inputFile.removeCallback();
        resolve({
          success: false,
          error: `启动pandoc进程失败: ${error.message}`,
        });
      });
    } catch (error) {
      inputFile.removeCallback();
      resolve({
        success: false,
        error: `系统调用准备失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * 系统pandoc文本输出转换
   */
  private convertToTextWithSystemPandoc(
    inputFile: tmp.FileResult,
    options: ConvertOptions,
    resolve: (result: ConvertResult) => void
  ): void {
    // 构建pandoc参数
    const args = [
      inputFile.name,
      '--from', options.from,
      '--to', options.to
    ];
    
    if (options.extraArgs && options.extraArgs.length > 0) {
      args.push(...options.extraArgs);
    }
    
    console.log('System pandoc text command:', 'pandoc', args.join(' '));
    
    // 使用spawn执行命令
    const pandocProcess = spawn('pandoc', args);
    
    let stdout = '';
    let stderr = '';
    
    pandocProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pandocProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pandocProcess.on('close', (code) => {
      inputFile.removeCallback(); // 清理临时文件
      
      if (code === 0) {
        resolve({
          success: true,
          result: stdout,
        });
      } else {
        resolve({
          success: false,
          error: `Pandoc进程退出，代码: ${code}${stderr ? `，错误: ${stderr}` : ''}`,
        });
      }
    });
    
    pandocProcess.on('error', (error) => {
      inputFile.removeCallback();
      resolve({
        success: false,
        error: `启动pandoc进程失败: ${error.message}`,
      });
    });
  }

  /**
   * 主要转换方法：优先使用node-pandoc，失败时回退到系统调用
   * @param content 输入内容
   * @param options 转换选项
   * @returns 转换结果
   */
  async convertContent(
    content: string,
    options: ConvertOptions
  ): Promise<ConvertResult> {
    console.log('Starting content conversion with hybrid strategy...');
    
    // 检测环境并选择最佳策略
    const isNodePandocAvailable = await this.isNodePandocWorking();
    const isSystemPandocAvailable = await this.checkPandocInstallation();
    
    console.log('Environment check:', { 
      nodePandoc: isNodePandocAvailable, 
      systemPandoc: isSystemPandocAvailable 
    });

    if (isNodePandocAvailable) {
      try {
        console.log('Attempting conversion with node-pandoc...');
        const result = await this.convertWithNodePandoc(content, options);
        if (result.success) {
          console.log('Node-pandoc conversion successful');
          return result;
        } else {
          console.warn('Node-pandoc failed:', result.error);
        }
      } catch (error) {
        console.warn('Node-pandoc conversion failed:', error instanceof Error ? error.message : String(error));
      }
    }

    if (isSystemPandocAvailable) {
      console.log('Falling back to system pandoc...');
      try {
        const result = await this.convertWithSystemPandoc(content, options);
        if (result.success) {
          console.log('System pandoc conversion successful');
          return result;
        } else {
          console.error('System pandoc also failed:', result.error);
          return result;
        }
      } catch (error) {
        console.error('System pandoc conversion failed:', error instanceof Error ? error.message : String(error));
        return {
          success: false,
          error: `系统pandoc调用失败: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }

    return {
      success: false,
      error: 'No working pandoc implementation found. Please install pandoc or check node-pandoc configuration.',
    };
  }

  /**
   * 专门处理纯文本输出：先生成docx文件，再提取纯文本内容
   * @param content 输入内容
   * @param options 转换选项
   * @returns 转换结果（包含纯文本内容）
   */
  async convertToPlainText(
    content: string,
    options: ConvertOptions
  ): Promise<ConvertResult> {
    console.log('Converting to plain text via DOCX...');
    
    try {
      // 第一步：生成DOCX文件
      const docxOptions = { ...options, to: 'docx' };
      const docxResult = await this.convertContent(content, docxOptions);
      
      if (!docxResult.success || !docxResult.outputPath) {
        return {
          success: false,
          error: `生成DOCX文件失败: ${docxResult.error}`,
        };
      }
      
      // 第二步：从DOCX文件提取纯文本
      const textResult = await this.extractTextFromDocx(docxResult.outputPath);
      
      // 清理临时DOCX文件
      try {
        await fs.unlink(docxResult.outputPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary DOCX file:', cleanupError);
      }
      
      return textResult;
    } catch (error) {
      return {
        success: false,
        error: `纯文本转换失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 专门处理图片输出的内容生成：根据输出2格式生成相应内容字符串
   * @param content 输入内容（markdown）
   * @param contentFormat 输出2格式：markdown/docx/latex
   * @returns 转换结果（包含内容字符串）
   */
  async convertForImageOutput(
    content: string,
    contentFormat: 'markdown' | 'docx' | 'latex'
  ): Promise<ConvertResult> {
    console.log('Converting content for image output, format:', contentFormat);
    
    if (contentFormat === 'markdown') {
      // 直接返回markdown字符串
      return {
        success: true,
        result: content,
      };
    }
    
    try {
      // 生成对应格式的文件
      const options: ConvertOptions = {
        from: 'markdown',
        to: contentFormat,
      };
      
      const fileResult = await this.convertContent(content, options);
      
      if (!fileResult.success || !fileResult.outputPath) {
        return {
          success: false,
          error: `生成${contentFormat}文件失败: ${fileResult.error}`,
        };
      }
      
      // 读取文件内容
      let textContent: string;
      if (contentFormat === 'docx') {
        // DOCX需要提取纯文本
        const extractResult = await this.extractTextFromDocx(fileResult.outputPath);
        if (!extractResult.success) {
          return extractResult;
        }
        textContent = extractResult.result || '';
      } else {
        // LaTeX可以直接读取
        textContent = await fs.readFile(fileResult.outputPath, 'utf-8');
      }
      
      // 清理临时文件
      try {
        await fs.unlink(fileResult.outputPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary file:', cleanupError);
      }
      
      return {
        success: true,
        result: textContent,
      };
    } catch (error) {
      return {
        success: false,
        error: `图片内容生成失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * 规范化路径，在Windows下避免反斜杠问题
   */
  private normalizePath(filePath: string): string {
    // 在Windows下，将反斜杠转换为正斜杠
    return filePath.replace(/\\/g, '/');
  }

  /**
   * 从DOCX文件提取纯文本内容
   * @param filePath DOCX文件路径
   * @returns 提取的文本内容
   */
  async extractTextFromDocx(filePath: string): Promise<ConvertResult> {
    try {
      // 检查pandoc是否安装
      const isPandocInstalled = await this.checkPandocInstallation();
      if (!isPandocInstalled) {
        return {
          success: false,
          error: '系统未安装pandoc，请先安装pandoc: https://pandoc.org/installing.html',
        };
      }

      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch {
        return {
          success: false,
          error: `文件不存在: ${filePath}`,
        };
      }

      // 读取DOCX文件并转换
      console.log('Extracting text from DOCX:', filePath);

      try {
        // 使用spawn而不是exec来更好地处理参数
        const pandocProcess = spawn('pandoc', [filePath, '--from=docx', '--to=plain']);
        
        let stdout = '';
        let stderr = '';
        
        pandocProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        pandocProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        return new Promise((resolve) => {
          pandocProcess.on('close', (code) => {
            if (code === 0) {
              resolve({
                success: true,
                result: stdout,
              });
            } else {
              console.error('Pandoc stderr:', stderr);
              resolve({
                success: false,
                error: `Pandoc提取文本失败，退出代码: ${code}${stderr ? `，错误: ${stderr}` : ''}`,
              });
            }
          });
          
          pandocProcess.on('error', (error) => {
            resolve({
              success: false,
              error: `启动pandoc进程失败: ${error.message}`,
            });
          });
        });
      } catch (cmdError) {
        console.error('Command line pandoc error:', cmdError);
        return {
          success: false,
          error: cmdError instanceof Error ? `命令行Pandoc错误: ${cmdError.message}` : '执行转换时发生未知错误',
        };
      }
    } catch {
      return {
        success: false,
        error: '发生未知错误',
      };
    }
  }
}

// 创建并导出单例
const pandocConverter = new PandocConverter();

export default pandocConverter;
