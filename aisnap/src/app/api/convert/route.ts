import { NextRequest } from 'next/server';

// POST /api/convert
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { inputType, outputType } = data;

    // 这里将实现实际的转换逻辑
    // 目前返回模拟数据

    return new Response(
      JSON.stringify({
        success: true,
        message: '转换请求已提交',
        data: {
          id: Math.random().toString(36).substring(7),
          inputType,
          outputType,
          status: 'processing',
          createdAt: new Date().toISOString(),
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '转换请求处理失败',
        error: error instanceof Error ? error.message : '未知错误'
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