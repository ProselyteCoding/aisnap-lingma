import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../../generated/prisma";
import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { stat, mkdirSync } from "fs";

const prisma = new PrismaClient();

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
    const avatarFile: any = formData.get('avatar');

    // 验证文件
    if (!avatarFile || !(avatarFile instanceof Blob)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "请选择要上传的头像文件" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 检查文件类型
    if (!avatarFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "请上传有效的图片文件" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 检查文件大小 (限制为2MB)
    if (avatarFile.size > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "图片文件大小不能超过2MB" 
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
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // 目录可能已存在
    }

    // 生成文件名
    const fileExtension = avatarFile.type.split('/')[1];
    const fileName = `${session.user.id}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);
    const relativePath = `/uploads/avatars/${fileName}`;

    // 将文件保存到磁盘
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 更新用户头像
    await prisma.user.update({
      where: {
        id: session.user.id as string
      },
      data: {
        avatar: relativePath
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "头像更新成功",
        data: {
          avatar: relativePath
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
    console.error("更新头像错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "更新头像时发生错误" 
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