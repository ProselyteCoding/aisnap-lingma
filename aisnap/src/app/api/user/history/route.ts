import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "../../../../generated/prisma";
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

    // 获取用户转换历史记录
    const history = await prisma.history.findMany({
      where: {
        userId: session.user.id as string
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        inputType: true,
        outputType: true,
        input: true,
        output: true,
        inputFile: true,
        outputFile: true,
        createdAt: true
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: history 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("获取转换历史错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "获取转换历史时发生错误" 
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params;

    // 检查记录是否属于当前用户
    const historyRecord = await prisma.history.findUnique({
      where: {
        id: id
      }
    });

    if (!historyRecord) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "记录不存在" 
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (historyRecord.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "无权删除此记录" 
        }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 删除记录
    await prisma.history.delete({
      where: {
        id: id
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "记录已删除" 
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("删除转换记录错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "删除转换记录时发生错误" 
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