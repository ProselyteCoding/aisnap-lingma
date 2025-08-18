import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// 定义请求体类型
interface RegisterRequestBody {
  nickname: string;
  username: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { nickname, username, email, password }: RegisterRequestBody = await request.json();

    // 验证输入参数
    if (!nickname || !username || !email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "请填写所有必填字段" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证昵称长度
    if (nickname.length < 2 || nickname.length > 20) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "昵称长度应在2-20个字符之间" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "用户名长度应在3-20个字符之间" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "用户名只能包含字母、数字、下划线和中文" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "请输入有效的邮箱地址" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "密码至少6个字符" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "密码需包含大小写字母和数字" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "该邮箱已被注册，请直接登录或使用其他邮箱" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUserByUsername) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "该用户名已被注册，请选择其他用户名" 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    await prisma.user.create({
      data: {
        username,
        email,
        nickname, // 添加昵称字段
        password: hashedPassword
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "注册成功，欢迎加入AISnap！" 
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("注册错误:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "注册过程中发生错误，请稍后重试" 
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