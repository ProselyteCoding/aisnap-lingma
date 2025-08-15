import { NextRequest } from 'next/server';
import { processConversion } from '@/lib/conversion';

// 定义输出类型
export type OutputType = 'docx' | 'html' | 'latex' | 'pdf' | 'plain' | 'image';
export type InputType = 'markdown' | 'html' | 'latex';
export type PandocOutputFormat = 'docx' | 'html' | 'latex' | 'pdf' | 'plain';

export async function POST(request: NextRequest) {
  try {
    // 文本转换API只处理基础的文档格式转换
    // template、prompt、imageSettings属于图片转换功能，不在此API处理
    const { input, inputType, outputType, outputFormat, imageSettings } = await request.json();
    
    // 添加详细的日志记录以帮助调试
    console.log('API Request Body:', { input: input?.substring(0, 100) + '...', inputType, outputType, outputFormat });
    
    // 验证必要参数
    if (!input || !inputType || !outputType) {
      console.error('Missing required parameters:', { input: !!input, inputType: !!inputType, outputType: !!outputType });
      return new Response(
        JSON.stringify({
          success: false,
          message: "缺少必要参数: input, inputType 或 outputType",
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // 验证 inputType 和 outputType 是否有效
    const validInputTypes: InputType[] = ['markdown', 'html', 'latex'];
    const validOutputTypes: OutputType[] = ['docx', 'html', 'latex', 'pdf', 'plain', 'image'];
    
    if (!validInputTypes.includes(inputType)) {
      console.error('Invalid inputType:', inputType);
      return new Response(
        JSON.stringify({
          success: false,
          message: `无效的 inputType: ${inputType}. 有效值: ${validInputTypes.join(', ')}`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (!validOutputTypes.includes(outputType)) {
      console.error('Invalid outputType:', outputType);
      return new Response(
        JSON.stringify({
          success: false,
          message: `无效的 outputType: ${outputType}. 有效值: ${validOutputTypes.join(', ')}`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // 使用公共转换函数
    const result = await processConversion({
      inputContent: input,
      inputType: inputType,
      outputType: outputType,
      outputFormat: outputFormat,
      imageSettings: imageSettings
    });
    
    if (result.success) {
      return new Response(
        JSON.stringify(result),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } else {
      return new Response(
        JSON.stringify(result),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

  } catch (error) {
    console.error('Text conversion error:', error);
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
