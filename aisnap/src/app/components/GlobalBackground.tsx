'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function GlobalBackground() {
  const { data: session } = useSession();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBackground = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user');
          const result = await response.json();
          
          if (result.success && result.data?.background) {
            setBackgroundImage(result.data.background);
          }
        } catch (error) {
          console.error('获取用户背景失败:', error);
        }
      } else {
        // 用户未登录时清除背景
        setBackgroundImage(null);
      }
    };

    fetchUserBackground();
  }, [session]);

  // 如果没有背景图片，不渲染任何内容
  if (!backgroundImage) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.3, // 设置透明度，不影响正常功能
        zIndex: -1, // 确保在最底层
        pointerEvents: 'none', // 不响应鼠标事件
      }}
    />
  );
}
