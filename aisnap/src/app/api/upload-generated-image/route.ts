import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const expectedPath = formData.get('expectedPath') as string;

    if (!imageFile || !expectedPath) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "缺少必要参数"
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 提取文件名
    const fileName = expectedPath.split('/').pop();
    if (!fileName) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "无效的文件路径"
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 确保downloads目录存在
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    try {
      await fs.access(downloadsDir);
    } catch {
      await fs.mkdir(downloadsDir, { recursive: true });
    }

    // 保存文件
    const filePath = path.join(downloadsDir, fileName);
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    console.log('生成的图片已保存到:', expectedPath);

    return new Response(
      JSON.stringify({
        success: true,
        message: "图片上传成功",
        path: expectedPath
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('上传图片时出错:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "上传失败"
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
