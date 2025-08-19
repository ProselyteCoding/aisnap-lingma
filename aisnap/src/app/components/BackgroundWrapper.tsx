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
          } else {
            setBackgroundImage(null);
          }
        } catch (error) {
          console.error('获取用户背景失败:', error);
          setBackgroundImage(null);
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
      {/* 背景层 - 使用img标签代替background样式 */}
      {backgroundImage && (
        <img 
          src={backgroundImage}
          alt="用户背景"
          className="background-layer-image"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.3,
            zIndex: -1,
            pointerEvents: 'none',
            userSelect: 'none',
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
