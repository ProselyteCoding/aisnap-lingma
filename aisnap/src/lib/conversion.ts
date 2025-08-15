// 公共的转换处理逻辑

// 定义图片设置接口
interface ImageSettings {
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  aiLogo: string;
  theme: string;
  width: number;
  padding: number;
}

export interface ConversionOptions {
  inputContent: string;
  inputType: string;
  outputType: string;
  outputFormat?: string; // 输出2格式（仅当outputType为image时使用）
  imageSettings?: ImageSettings;
}

export interface ConversionResult {
  success: boolean;
  message: string;
  data?: {
    result?: string;
    outputFile?: string;
    format?: string;
    imageSettings?: ImageSettings;
  };
  error?: string;
}

/**
 * 通用转换处理函数
 * @param options 转换选项
 * @returns 转换结果
 */
export async function processConversion(options: ConversionOptions): Promise<ConversionResult> {
  const { inputContent, inputType, outputType, outputFormat, imageSettings } = options;
  
  console.log('开始处理转换:', { inputType, outputType, outputFormat });
  
  // 引入pandoc库
  const pandocLib = (await import('@/lib/pandoc')).default;
  
  // 根据输出1类型处理
  if (outputType === 'image') {
    // 图片输出：根据输出2格式处理内容
    const finalOutputFormat = outputFormat || 'markdown'; // 默认使用markdown
    
    let finalContent = '';
    
    if (finalOutputFormat === 'markdown') {
      // 直接返回原始内容
      finalContent = inputContent;
      console.log('图片输出：直接使用markdown文本');
    } else if (finalOutputFormat === 'docx' || finalOutputFormat === 'latex') {
      // 使用pandoc转换为对应格式，然后提取文本内容
      console.log(`图片输出：转换为${finalOutputFormat}格式并提取文本...`);
      
      const convertResult = await pandocLib.convertContent(inputContent, {
        from: inputType,
        to: finalOutputFormat as 'docx' | 'latex'
      });
      
      if (!convertResult.success) {
        console.error('Pandoc转换失败:', convertResult.error);
        return {
          success: false,
          message: `转换为${finalOutputFormat}格式失败: ${convertResult.error}`,
          error: convertResult.error
        };
      }
      
      // 如果生成了文件，提取其文本内容
      if (convertResult.outputPath) {
        console.log('从生成的文件提取文本内容...');
        
        if (finalOutputFormat === 'docx') {
          const extractResult = await pandocLib.extractTextFromDocx(convertResult.outputPath);
          if (extractResult.success && extractResult.result) {
            finalContent = extractResult.result;
          } else {
            console.error('提取DOCX文本失败:', extractResult.error);
            return {
              success: false,
              message: `提取DOCX文本失败: ${extractResult.error}`,
              error: extractResult.error
            };
          }
        } else {
          // 对于latex，直接读取文件内容
          const fs = await import('fs/promises');
          try {
            finalContent = await fs.readFile(convertResult.outputPath, 'utf-8');
          } catch (readError) {
            console.error('读取LaTeX文件失败:', readError);
            return {
              success: false,
              message: `读取LaTeX文件失败: ${readError}`,
              error: readError instanceof Error ? readError.message : String(readError)
            };
          }
        }
      } else if (convertResult.result) {
        // 如果是直接返回的文本结果
        finalContent = convertResult.result;
      }
    } else {
      return {
        success: false,
        message: `不支持的输出2格式: ${finalOutputFormat}`,
        error: `Unsupported output format: ${finalOutputFormat}`
      };
    }

    console.log('最终内容长度:', finalContent.length);

    // 返回结果供前端html2canvas使用
    return {
      success: true,
      message: "预览内容准备就绪",
      data: {
        result: finalContent,
        format: finalOutputFormat,
        imageSettings: imageSettings
      }
    };
  }
  
  // 对于纯文本输出类型：先生成docx文件再提取纯文本内容
  if (outputType === 'plain') {
    const pandocResult = await pandocLib.convertToPlainText(inputContent, {
      from: inputType,
      to: 'plain'
    });
    
    console.log('Pandoc result for plain text conversion:', pandocResult);
    
    if (pandocResult.success && pandocResult.result) {
      return {
        success: true,
        message: "纯文本转换成功",
        data: {
          result: pandocResult.result
        }
      };
    } else {
      return {
        success: false,
        message: "纯文本转换失败: " + (pandocResult.error || '未知错误'),
        error: pandocResult.error
      };
    }
  }
  
  // 对于文件输出类型 (docx, html, latex, pdf) 使用pandoc直接生成文件
  if (['docx', 'html', 'latex', 'pdf'].includes(outputType)) {
    const pandocResult = await pandocLib.convertContent(inputContent, {
      from: inputType,
      to: outputType as 'docx' | 'html' | 'latex' | 'pdf'
    });
    
    console.log('Pandoc result for file conversion:', pandocResult);
    
    if (pandocResult.success && pandocResult.outputPath) {
      // 获取文件名
      const pathParts = pandocResult.outputPath.split(/[/\\]/);
      const actualFileName = pathParts[pathParts.length - 1];
      const outputFile = `/downloads/${actualFileName}`;
      
      return {
        success: true,
        message: "文件转换成功",
        data: {
          outputFile: outputFile
        }
      };
    } else {
      return {
        success: false,
        message: "文件转换失败: " + (pandocResult.error || '未知错误'),
        error: pandocResult.error
      };
    }
  }
  
  // 默认情况：不支持的输出格式
  return {
    success: false,
    message: `不支持的输出格式: ${outputType}`,
    error: `Unsupported output type: ${outputType}`
  };
}
