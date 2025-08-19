'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function GlobalBackground() {
  const { data: session } = useSession();
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const fetchUserBackground = useCallback(async () => {
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
  }, [session?.user]);

  useEffect(() => {
    fetchUserBackground();
  }, [fetchUserBackground]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    console.error('背景图片加载失败');
    setBackgroundImage(null);
    setIsImageLoaded(false);
  }, []);

  // 如果没有背景图片，不渲染任何内容
  if (!backgroundImage) {
    return null;
  }

  return (
    <img 
      src={backgroundImage}
      alt="用户背景"
      className="global-background-image"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
        opacity: isImageLoaded ? 0.3 : 0,
        zIndex: -1,
        pointerEvents: 'none',
        userSelect: 'none',
        transition: 'opacity 0.3s ease',
      }}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
