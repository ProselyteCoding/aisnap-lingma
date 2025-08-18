import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../generated/prisma";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// 定义偏好设置类型
interface PreferenceRequestBody {
  font: string;
  fontSize: string;
  style: string;
  watermark: string;
  aiLogo: string;
}

export async function GET(request: NextRequest) {
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

    // 获取用户偏好设置
    const preference = await prisma.preference.findUnique({
      where: {
        userId: session.user.id as string
      }
    });

    // 如果用户没有偏好设置，创建默认设置
    if (!preference) {
      const defaultPreference = await prisma.preference.create({
        data: {
          userId: session.user.id as string
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: defaultPreference 
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: preference 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("获取用户偏好设置错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "获取用户偏好设置时发生错误" 
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

export async function POST(request: NextRequest) {
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

    const { font, fontSize, style, watermark, aiLogo }: PreferenceRequestBody = await request.json();

    // 更新或创建用户偏好设置
    const preference = await prisma.preference.upsert({
      where: {
        userId: session.user.id as string
      },
      update: {
        font,
        fontSize,
        style,
        watermark,
        aiLogo
      },
      create: {
        userId: session.user.id as string,
        font,
        fontSize,
        style,
        watermark,
        aiLogo
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "偏好设置已保存",
        data: preference
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("保存用户偏好设置错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "保存用户偏好设置时发生错误" 
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