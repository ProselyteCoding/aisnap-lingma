'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
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

  return (
    <div className="app-container">
      {/* 背景层 */}
      {backgroundImage && (
        <div 
          className="background-layer"
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
      )}
      
      {/* 内容层 */}
      <div className="content-layer" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
