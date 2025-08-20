import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 定义请求体类型
interface UpdateSettingsRequestBody {
  type: 'nickname' | 'password';
  value: string;
  oldValue?: string; // 用于密码修改时的旧密码验证
}

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

    const { type, value, oldValue }: UpdateSettingsRequestBody = await request.json();

    // 验证必要参数
    if (!type || !value) {
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

    // 验证type参数
    if (type !== 'nickname' && type !== 'password') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "无效的type参数，仅支持 'nickname' 或 'password'" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 根据type执行不同的更新操作
    if (type === 'nickname') {
      // 更新昵称
      await prisma.user.update({
        where: {
          id: session.user.id as string
        },
        data: {
          nickname: value
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "昵称更新成功" 
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 更新密码
    if (type === 'password') {
      // 验证旧密码
      if (!oldValue) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "请提供当前密码" 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // 获取用户信息以验证旧密码
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id as string
        }
      });

      if (!user || !user.password) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "用户信息错误" 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // 验证旧密码
      const isOldPasswordValid = await bcrypt.compare(oldValue, user.password);
      if (!isOldPasswordValid) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "当前密码错误" 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // 验证新密码强度
      if (value.length < 6) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "新密码至少6个字符" 
          }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // 哈希新密码
      const hashedPassword = await bcrypt.hash(value, 10);

      // 更新密码
      await prisma.user.update({
        where: {
          id: session.user.id as string
        },
        data: {
          password: hashedPassword
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "密码更新成功" 
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 默认返回
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "无效的请求" 
      }),
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("更新用户设置错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "更新用户设置时发生错误" 
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