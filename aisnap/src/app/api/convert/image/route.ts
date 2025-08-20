import { NextRequest } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import OpenAI from 'openai';
import { processConversion } from '@/lib/conversion';

// 定义类型
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

export async function POST(request: NextRequest) {
  try {
    console.log('图片转换API被调用');
    
    // 安全地获取用户会话，不阻断转换流程
    let userId = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id || null;
      console.log('用户状态:', { hasSession: !!session, userId });
    } catch (authError: unknown) {
      console.warn('获取用户会话失败，继续以游客模式执行:', authError instanceof Error ? authError.message : '未知错误');
    }
    
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const outputType = formData.get('outputType') as string || 'markdown'; // 输出1格式，统一命名
    const prompt = formData.get('prompt') as string || '';
    const imageSettingsStr = formData.get('imageSettings') as string || '{}';
    const imageSettings = JSON.parse(imageSettingsStr) as ImageSettings;
    
    // 对于图片输出，还需要获取输出2格式
    const outputFormat = formData.get('outputFormat') as string || 'markdown'; // 输出2格式
    
    console.log('接收到的参数:', { 
      hasImage: !!image, 
      outputType, 
      prompt: prompt?.substring(0, 50) + '...',
      imageSettings: Object.keys(imageSettings),
      userId
    });

    if (!image) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "请上传图片文件",
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 步骤1: 使用通义千问将图片转换为markdown文本
    console.log('步骤1: 调用通义千问识别图片...');
    
    // 检查 API Key
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "API_KEY 未配置",
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 将图片转换为base64
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = image.type;

    // 保存上传的图片文件到服务器
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = image.name?.split('.').pop() || 'jpg';
    const savedFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // 确保uploads目录存在
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }
    
    // 保存文件
    const savedFilePath = path.join(uploadsDir, savedFileName);
    await fs.writeFile(savedFilePath, Buffer.from(imageBuffer));
    
    // 生成可访问的URL路径
    const inputFileUrl = `/uploads/${savedFileName}`;
    console.log('图片已保存到:', inputFileUrl);

    // 初始化OpenAI客户端
    const ai = new OpenAI({
      apiKey: API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    // 根据outputType参数调整提示词内容
    let promptContent;
    if (outputType === "markdown") {
      promptContent = '请识别图片中AI生成的对话框中的文本内容，将其转换为可直接复制的Markdown格式文本。请保持原有的对话结构和格式，只返回转换后的内容，不要其他解释。';
    } else if (outputType === "docx") {
      promptContent = '请识别图片中的文本内容，将其转换为适合Word文档的markdown格式文本。请保持原有的结构和格式，只返回转换后的内容，不要其他解释。';
    } else if (outputType === "latex") {
      promptContent = '请识别图片中的文本内容，将其转换为适合LaTeX文档的markdown格式文本。请保持原有的结构和格式，只返回转换后的内容，不要其他解释。';
    } else {
      promptContent = '请识别图片中的文本内容，将其转换为markdown格式文本。请保持原有的结构和格式，只返回转换后的内容，不要其他解释。';
    }

    // 如果用户提供了额外的提示词，添加到系统提示中
    if (prompt) {
      promptContent += `\n\n用户额外要求：${prompt}`;
    }

    // 尝试多个支持视觉的模型
    const visionModels = ['qwen-vl-plus', 'qwen-vl-max', 'qvq-72b-preview'];
    let completion = null;
    let markdownText = '';

    for (const modelName of visionModels) {
      try {
        console.log(`尝试使用模型: ${modelName}`);
        
        completion = await ai.chat.completions.create({
          model: modelName,
          messages: [
            {
              role: "system",
              content: promptContent
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "请识别并转换这张图片中的文本内容："
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                  }
                }
              ]
            },
          ],
        });
        
        // 如果成功，跳出循环
        console.log(`模型 ${modelName} 调用成功`);
        markdownText = completion.choices[0]?.message?.content || '';
        break;
        
      } catch (modelError: unknown) {
        const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
        console.warn(`模型 ${modelName} 调用失败:`, errorMessage);
        completion = null;
      }
    }

    // 如果所有视觉模型都失败，返回错误或使用降级方案
    if (!completion || !markdownText) {
      console.log('所有视觉模型失败，使用降级方案...');
      
      // 生成降级模板
      let templateContent;
      if (outputType === 'markdown') {
        templateContent = `## AI对话转换模板

**用户问题**：
[请在此处粘贴从截图中复制的用户问题]

**AI回答**：
[请在此处粘贴从截图中复制的AI回答]

---
*注意：由于API限制，请手动从截图中复制文本内容到上述模板中*
*转换时间：${new Date().toLocaleString()}*`;
      } else {
        templateContent = `AI对话转换模板

用户问题：
[请在此处粘贴从截图中复制的用户问题]

AI回答：
[请在此处粘贴从截图中复制的AI回答]

注意：由于API限制，请手动从截图中复制文本内容到上述模板中
转换时间：${new Date().toLocaleString()}`;
      }
      
      markdownText = templateContent;
    }
    
    console.log('图片识别完成，markdown文本长度:', markdownText.length);

    // 步骤2: 根据输出1类型处理（与文本转换API保持一致）
    console.log('步骤2: 处理输出1类型 -', outputType);
    
    // 如果输出1是图片，需要根据输出2格式处理内容
    if (outputType === 'image') {
      let finalContent = '';
      
      if (outputFormat === 'markdown') {
        // 直接返回markdown文本
        finalContent = markdownText;
        console.log('图片输出：直接使用markdown文本');
      } else if (outputFormat === 'docx' || outputFormat === 'latex') {
        // 使用pandoc转换为对应格式，然后提取文本内容
        console.log(`图片输出：转换为${outputFormat}格式并提取文本...`);
        
        const pandocLib = (await import('@/lib/pandoc')).default;
        const convertResult = await pandocLib.convertContent(markdownText, {
          from: 'markdown',
          to: outputFormat as 'docx' | 'latex'
        });
        
        if (!convertResult.success) {
          console.error('Pandoc转换失败:', convertResult.error);
          return new Response(
            JSON.stringify({
              success: false,
              message: `转换为${outputFormat}格式失败: ${convertResult.error}`,
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // 如果生成了文件，提取其文本内容
        if (convertResult.outputPath) {
          console.log('从生成的文件提取文本内容...');
          
          if (outputFormat === 'docx') {
            const extractResult = await pandocLib.extractTextFromDocx(convertResult.outputPath);
            if (extractResult.success && extractResult.result) {
              finalContent = extractResult.result;
            } else {
              console.error('提取DOCX文本失败:', extractResult.error);
              return new Response(
                JSON.stringify({
                  success: false,
                  message: `提取DOCX文本失败: ${extractResult.error}`,
                }),
                {
                  status: 500,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            }
          } else {
            // 对于latex，直接读取文件内容
            const fs = await import('fs/promises');
            try {
              finalContent = await fs.readFile(convertResult.outputPath, 'utf-8');
            } catch (readError) {
              console.error('读取LaTeX文件失败:', readError);
              return new Response(
                JSON.stringify({
                  success: false,
                  message: `读取LaTeX文件失败: ${readError}`,
                }),
                {
                  status: 500,
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            }
          }
        } else if (convertResult.result) {
          // 如果是直接返回的文本结果
          finalContent = convertResult.result;
        }
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            message: `不支持的输出2格式: ${outputFormat}`,
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      console.log('最终内容长度:', finalContent.length);

      // 保存历史记录，使用公共转换函数
      const result = await processConversion({
        inputContent: markdownText,
        inputType: 'markdown', // 处理时使用markdown
        outputType: outputType,
        outputFormat: outputFormat,
        imageSettings: imageSettings,
        userId: userId,
        inputFile: inputFileUrl, // 传递真实的图片文件路径
        originalInputType: 'image' // 历史记录中记录原始输入类型为图片
      });

      // 返回结果供前端html2canvas使用
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            result: finalContent,
            format: outputFormat,
            imageSettings: imageSettings,
            outputFile: result.data?.outputFile // 传递输出文件路径
          },
          message: "预览内容准备就绪"
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // 使用公共转换函数处理后续转换
    const result = await processConversion({
      inputContent: markdownText,
      inputType: 'markdown', // 处理时使用markdown
      outputType: outputType,
      outputFormat: outputFormat,
      imageSettings: imageSettings,
      userId: userId, // 传递用户ID用于历史记录保存
      inputFile: inputFileUrl, // 传递真实的图片文件路径
      originalInputType: 'image' // 历史记录中记录原始输入类型为图片
    });
    
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('图片转换错误:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: "服务器错误: " + (error instanceof Error ? error.message : '未知错误')
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export const runtime = 'nodejs';
