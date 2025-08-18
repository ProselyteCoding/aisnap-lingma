'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Button, Card, Divider, message, Spin, Image } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;

export default function BackgroundSettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 获取当前背景
  useEffect(() => {
    if (session?.user) {
      fetchCurrentBackground();
    }
  }, [session]);

  const fetchCurrentBackground = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      const result = await response.json();
      
      if (result.success && result.data?.background) {
        setCurrentBackground(result.data.background);
      }
    } catch (error) {
      console.error('获取背景失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 上传背景图片
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('background', file);

    try {
      setUploading(true);
      const response = await fetch('/api/user/settings/background', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('背景上传成功！');
        setCurrentBackground(result.data?.background || null);
        setPreviewBackground(null);
        // 刷新页面以更新背景显示
        window.location.reload();
      } else {
        message.error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 重置背景
  const handleReset = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/settings/background', {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('背景已重置！');
        setCurrentBackground(null);
        setPreviewBackground(null);
        // 刷新页面以更新背景显示
        window.location.reload();
      } else {
        message.error(result.message || '重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      message.error('重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 预览功能
  const handlePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewBackground(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadProps = {
    name: 'background',
    multiple: false,
    accept: '.jpg,.jpeg,.png,.gif',
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件！');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB！');
        return false;
      }

      // 先预览
      handlePreview(file);
      return false; // 阻止自动上传
    },
    fileList: [], // 清空文件列表
  };

  if (!session) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">背景设置</h1>
      
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 当前背景 */}
          <Card title="当前背景" className="h-fit">
            {currentBackground ? (
              <div className="space-y-4">
                <Image
                  src={currentBackground}
                  alt="当前背景"
                  className="w-full h-48 object-cover rounded"
                  preview={{
                    mask: <EyeOutlined className="text-white text-lg" />,
                  }}
                />
                <Button 
                  type="primary" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={handleReset}
                  block
                >
                  重置背景
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                当前未设置背景
              </div>
            )}
          </Card>

          {/* 上传新背景 */}
          <Card title="上传新背景">
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
              <p className="ant-upload-hint">
                支持 JPG、PNG、GIF 格式，文件大小不超过 5MB
                <br />
                建议尺寸：1920x1080 或更高
              </p>
            </Dragger>

            {/* 预览区域 */}
            {previewBackground && (
              <>
                <Divider>预览</Divider>
                <div className="space-y-4">
                  <Image
                    src={previewBackground}
                    alt="预览背景"
                    className="w-full h-48 object-cover rounded"
                    preview={{
                      mask: <EyeOutlined className="text-white text-lg" />,
                    }}
                  />
                  <div className="flex gap-2">
                    <Button 
                      type="primary" 
                      loading={uploading}
                      onClick={() => {
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput?.files?.[0]) {
                          handleUpload(fileInput.files[0]);
                        }
                      }}
                      className="flex-1"
                    >
                      确认上传
                    </Button>
                    <Button 
                      onClick={() => setPreviewBackground(null)}
                      className="flex-1"
                    >
                      取消
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* 使用说明 */}
        <Card title="使用说明" className="mt-6">
          <div className="space-y-2 text-gray-600">
            <p>• 背景图片会显示在整个应用的底层，透明度为30%，不会影响正常功能使用</p>
            <p>• 支持的图片格式：JPG、JPEG、PNG、GIF</p>
            <p>• 推荐上传高分辨率图片（1920x1080或更高）以获得最佳显示效果</p>
            <p>• 文件大小限制：最大5MB</p>
            <p>• 可以随时重置背景回到默认状态</p>
          </div>
        </Card>
      </Spin>
    </div>
  );
}
