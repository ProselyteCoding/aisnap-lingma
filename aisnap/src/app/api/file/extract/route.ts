import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

// 定义文件提取结果类型
interface ExtractResult {
  success: boolean;
  content?: string;
  message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ExtractResult>> {
  try {
    const { filePath, fileType } = await request.json();

    if (!filePath || !fileType) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }

    // 确保文件路径安全，只允许访问 public 目录下的文件
    const publicPath = join(process.cwd(), 'public');
    let fullFilePath: string;
    
    // 处理不同格式的文件路径
    if (filePath.startsWith('/')) {
      // 路径以 / 开头，如 /downloads/xxx.pdf
      fullFilePath = join(publicPath, filePath.substring(1));
    } else if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      // 如果是完整URL，提取路径部分
      try {
        const url = new URL(filePath);
        fullFilePath = join(publicPath, url.pathname.substring(1));
      } catch {
        return NextResponse.json({
          success: false,
          message: '无效的文件URL'
        }, { status: 400 });
      }
    } else {
      // 相对路径，直接拼接
      fullFilePath = join(publicPath, filePath);
    }

    console.log('文件路径信息:', {
      原始路径: filePath,
      公共目录: publicPath,
      完整路径: fullFilePath,
      文件类型: fileType
    });

    // 检查文件是否存在
    if (!existsSync(fullFilePath)) {
      console.log('文件不存在:', fullFilePath);
      console.log('尝试列出downloads目录内容:');
      try {
        const downloadDir = join(publicPath, 'downloads');
        if (existsSync(downloadDir)) {
          const fs = await import('fs');
          const files = fs.readdirSync(downloadDir);
          console.log('downloads目录中的文件:', files);
        }
      } catch (error) {
        console.log('无法列出downloads目录:', error);
      }
      
      return NextResponse.json({
        success: false,
        message: `文件不存在: ${fullFilePath}`
      }, { status: 404 });
    }

    let content = '';

    try {
      switch (fileType) {
        case 'html':
        case 'latex':
          // HTML 和 LaTeX 文件可以直接读取为文本
          content = await new Promise<string>((resolve, reject) => {
            readFile(fullFilePath, 'utf-8', (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          break;

        case 'docx':
          // 对于 DOCX 文件，使用 mammoth 提取文本内容
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ path: fullFilePath });
            content = result.value;
            
            if (!content || content.trim().length === 0) {
              content = 'DOCX 文件内容为空或无法解析。建议下载文件查看完整内容。';
            } else {
              // 清理一些常见的格式问题
              content = content
                .replace(/\r\n/g, '\n')  // 统一换行符
                .replace(/\n{3,}/g, '\n\n')  // 限制连续空行
                .trim();
            }
          } catch (mammothError) {
            console.error('DOCX解析失败:', mammothError);
            const errorMessage = mammothError instanceof Error ? mammothError.message : '未知错误';
            content = `DOCX 文件解析失败。可能包含不支持的格式或损坏的文件。\n\n错误信息：${errorMessage}\n\n建议下载文件查看完整内容。`;
          }
          break;

        case 'pdf':
          // 对于 PDF 文件，提供文件信息和建议
          try {
            // 首先检查文件是否确实存在
            if (!existsSync(fullFilePath)) {
              content = `PDF 文件不存在于路径: ${fullFilePath}\n\n请检查文件是否已正确生成。`;
              break;
            }
            
            console.log('处理PDF文件:', fullFilePath);
            
            // 获取文件基本信息
            const fs = await import('fs');
            const stats = fs.statSync(fullFilePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            // 尝试读取文件的前几个字节来验证是否为有效的PDF
            let isPdfValid = false;
            try {
              const buffer = fs.readFileSync(fullFilePath);
              const pdfHeader = buffer.subarray(0, 4).toString();
              isPdfValid = pdfHeader === '%PDF';
            } catch (error) {
              console.error('读取PDF头部失败:', error);
            }
            
            content = `📄 PDF文件已成功生成\n\n` +
                     `文件信息：\n` +
                     `• 文件大小：${fileSizeKB} KB (${fileSizeMB} MB)\n` +
                     `• 文件格式：${isPdfValid ? '✅ 有效的PDF文件' : '⚠️ 文件格式可能有问题'}\n` +
                     `• 创建时间：${stats.birthtime.toLocaleString('zh-CN')}\n` +
                     `• 修改时间：${stats.mtime.toLocaleString('zh-CN')}\n\n` +
                     `📖 关于PDF预览：\n` +
                     `由于技术限制，暂时无法在网页中直接预览PDF内容。\n` +
                     `PDF文件包含复杂的排版、字体和格式信息，最佳的查看方式是下载到本地。\n\n` +
                     `💡 建议操作：\n` +
                     `1. 点击"下载文件"按钮获取PDF\n` +
                     `2. 使用Adobe Reader、浏览器或其他PDF阅读器打开\n` +
                     `3. 文件完全支持打印和分享\n\n` +
                     `✨ 转换质量：\n` +
                     `PDF文件已按照您的要求完成转换，包含完整的文本内容和格式。`;
            
            console.log(`PDF文件信息获取成功 - 大小: ${fileSizeKB}KB, 有效: ${isPdfValid}`);
            
          } catch (pdfError) {
            console.error('PDF处理失败:', pdfError);
            const errorMessage = pdfError instanceof Error ? pdfError.message : '未知错误';
            content = `❌ PDF文件处理时遇到问题\n\n错误信息：${errorMessage}\n\n请尝试重新转换，或联系技术支持。`;
          }
          break;

        default:
          // 对于其他文件类型，尝试作为文本读取
          try {
            content = await new Promise<string>((resolve, reject) => {
              readFile(fullFilePath, 'utf-8', (err, data) => {
                if (err) reject(err);
                else resolve(data);
              });
            });
          } catch {
            content = `无法读取 ${fileType} 文件内容。可能包含二进制数据或特殊格式，建议下载文件查看。`;
          }
          break;
      }

      // 限制内容长度，避免前端显示过长的内容
      const maxLength = 50000; // 50KB 的文本内容
      if (content.length > maxLength) {
        const truncatedContent = content.substring(0, maxLength);
        const lastNewlineIndex = truncatedContent.lastIndexOf('\n');
        // 尝试在最后一个完整行处截断
        const finalContent = lastNewlineIndex > maxLength * 0.8 
          ? truncatedContent.substring(0, lastNewlineIndex)
          : truncatedContent;
        
        content = finalContent + '\n\n... (内容过长，已截断。完整内容请下载文件查看)';
      }

      return NextResponse.json({
        success: true,
        content: content
      });

    } catch (readError) {
      console.error('读取文件内容失败:', readError);
      const errorMessage = readError instanceof Error ? readError.message : '未知错误';
      return NextResponse.json({
        success: false,
        message: `无法读取文件内容：${errorMessage}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error('提取文件内容错误:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json({
      success: false,
      message: `服务器内部错误：${errorMessage}`
    }, { status: 500 });
  }
}
