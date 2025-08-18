import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "../../../generated/prisma";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

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

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id as string
      },
      select: {
        nickname: true,
        avatar: true,
        background: true
      }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "用户不存在" 
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: user
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("获取用户信息错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "获取用户信息时发生错误" 
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