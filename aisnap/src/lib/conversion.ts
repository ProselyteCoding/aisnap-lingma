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
  userId?: string | null; // 添加用户ID参数
  inputFile?: string; // 添加输入文件路径参数
  originalInputType?: string; // 原始输入类型（用于历史记录）
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
 * 保存转换历史记录到数据库
 */
async function saveConversionHistory(
  userId: string,
  inputType: string,
  outputType: string,
  inputContent: string,
  outputResult?: string,
  outputFile?: string,
  inputFile?: string
) {
  try {
    console.log('保存转换历史记录:', { userId, inputType, outputType });
    
    // 在服务端直接使用Prisma调用数据库，而不是fetch API
    const { PrismaClient } = await import('../generated/prisma');
    const prisma = new PrismaClient();
    
    await prisma.history.create({
      data: {
        userId,
        inputType,
        outputType,
        input: inputType === 'image' ? 
          '图片内容 (已保存为文件)' : // 对于图片输入，只保存简短描述
          inputContent.substring(0, 500), // 对于文本输入，限制为500字符
        output: outputResult ? outputResult.substring(0, 500) : null, // 输出也限制为500字符
        inputFile: inputFile || null,
        outputFile: outputFile || null,
        createdAt: new Date()
      }
    });
    
    await prisma.$disconnect();
    console.log('历史记录保存成功');
  } catch (error) {
    console.warn('保存历史记录时出错:', error);
    // 不阻断主流程，只记录警告
  }
}

/**
 * 通用转换处理函数
 * @param options 转换选项
 * @returns 转换结果
 */
export async function processConversion(options: ConversionOptions): Promise<ConversionResult> {
  const { inputContent, inputType, outputType, outputFormat, imageSettings, userId } = options;
  
  console.log('开始处理转换:', { inputType, outputType, outputFormat, hasUserId: !!userId });
  
  // 引入pandoc库
  const pandocLib = (await import('@/lib/pandoc')).default;
  
  let conversionResult: ConversionResult;
  
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
    conversionResult = {
      success: true,
      message: "预览内容准备就绪",
      data: {
        result: finalContent,
        format: finalOutputFormat,
        imageSettings: imageSettings
      }
    };

    // 保存历史记录（如果用户已登录）
    if (userId) {
      // 为图片输出生成一个占位的文件路径（实际文件将由前端生成）
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const imageFileName = `${timestamp}-${randomString}.png`;
      const imageOutputPath = `/downloads/${imageFileName}`;
      
      await saveConversionHistory(
        userId,
        options.originalInputType || inputType, // 使用原始输入类型
        'image', // 输出1类型
        inputContent,
        `图片输出 (${finalOutputFormat})`, // 简化的输出描述
        imageOutputPath, // 保存预期的图片输出路径
        options.inputFile // 传递输入文件路径
      );
      
      // 将预期的输出文件路径添加到返回结果中，供前端使用
      conversionResult.data!.outputFile = imageOutputPath;
    }

    return conversionResult;
  }
  
  // 对于纯文本输出类型：先生成docx文件再提取纯文本内容
  if (outputType === 'plain') {
    const pandocResult = await pandocLib.convertToPlainText(inputContent, {
      from: inputType,
      to: 'plain'
    });
    
    console.log('Pandoc result for plain text conversion:', pandocResult);
    
    if (pandocResult.success && pandocResult.result) {
      conversionResult = {
        success: true,
        message: "纯文本转换成功",
        data: {
          result: pandocResult.result
        }
      };

      // 保存历史记录（如果用户已登录）
      if (userId) {
        await saveConversionHistory(
          userId,
          options.originalInputType || inputType, // 使用原始输入类型
          'plain',
          inputContent,
          pandocResult.result,
          undefined, // 没有输出文件
          options.inputFile // 传递输入文件路径
        );
      }

      return conversionResult;
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
      
      conversionResult = {
        success: true,
        message: "文件转换成功",
        data: {
          outputFile: outputFile
        }
      };

      // 保存历史记录（如果用户已登录）
      if (userId) {
        await saveConversionHistory(
          userId,
          options.originalInputType || inputType, // 使用原始输入类型
          outputType,
          inputContent,
          undefined, // 文件输出没有文本结果
          outputFile, // 保存输出文件路径
          options.inputFile // 传递输入文件路径
        );
      }

      return conversionResult;
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
