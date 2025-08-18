import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../../generated/prisma";
import { NextRequest } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const prisma = new PrismaClient();

// PUT - 上传背景图片
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "未授权访问" 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('background') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "未找到上传文件" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "文件格式不支持，请上传 JPG、PNG 或 GIF 格式的图片" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "文件大小不能超过 5MB" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 创建上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'backgrounds');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // 生成文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `user_${session.user.id}_bg_${timestamp}.${extension}`;
    const filePath = join(uploadDir, fileName);
    const publicPath = `/uploads/backgrounds/${fileName}`;

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 删除旧的背景文件
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { background: true }
    });

    if (currentUser?.background) {
      try {
        const oldFilePath = join(process.cwd(), 'public', currentUser.background);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
        }
      } catch (error) {
        console.error('删除旧背景文件失败:', error);
      }
    }

    // 更新数据库
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: { background: publicPath }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "背景上传成功",
        data: {
          background: publicPath
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
    console.error("上传背景错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "上传背景时发生错误" 
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

// DELETE - 删除背景图片
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "未授权访问" 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 获取当前背景文件路径
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { background: true }
    });

    // 删除背景文件
    if (currentUser?.background) {
      try {
        const filePath = join(process.cwd(), 'public', currentUser.background);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error('删除背景文件失败:', error);
      }
    }

    // 更新数据库
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: { background: null }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "背景已重置" 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("删除背景错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "删除背景时发生错误" 
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
