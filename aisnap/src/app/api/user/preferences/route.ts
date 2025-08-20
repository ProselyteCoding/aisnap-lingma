import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    // 偏好设置功能已弃用，返回默认值
    const defaultPreferences = {
      font: "Microsoft YaHei",
      fontSize: "medium",
      style: "simple",
      watermark: "none",
      aiLogo: "tongyi"
    };

    return NextResponse.json({
      success: true,
      data: defaultPreferences
    });

  } catch (error) {
    console.error('获取偏好设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取偏好设置失败' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      );
    }

    // 偏好设置功能已弃用，直接返回成功
    return NextResponse.json({
      success: true,
      message: '偏好设置功能已弃用，但操作成功'
    });

  } catch (error) {
    console.error('更新偏好设置失败:', error);
    return NextResponse.json(
      { success: false, message: '更新偏好设置失败' },
      { status: 500 }
    );
  }
}