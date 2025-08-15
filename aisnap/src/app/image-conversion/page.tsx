"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Upload, 
  Select, 
  Space, 
  Typography, 
  Card, 
  message, 
  Spin, 
  Divider,
  Alert,
  Input
} from 'antd';
import { 
  UploadOutlined, 
  ArrowLeftOutlined, 
  FileImageOutlined,
  CopyOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useStore } from '@/stores/useStore';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function ImageConversion() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'markdown' | 'docx'>('markdown');
  const [converting, setConverting] = useState(false);
  const [convertedText, setConvertedText] = useState<string | null>(null);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const { templateConfig } = useStore();

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    if (info.fileList.length > 0) {
      setFile(info.fileList[0].originFileObj as File);
    } else {
      setFile(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      message.warning('请先选择要转换的图片文件');
      return;
    }

    setConverting(true);
    setConvertedText(null);
    setConvertedFile(null);
    setNote(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('format', outputFormat);

      const response = await fetch('/api/convert/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.content) {
          setConvertedText(result.data.content);
        }
        if (result.data.outputFile) {
          setConvertedFile(result.data.outputFile);
        }
        if (result.data.note) {
          setNote(result.data.note);
        }
        // 使用message.success会导致警告，改为直接显示在UI上
      } else {
        message.error(result.message || '转换失败');
      }
    } catch (error) {
      message.error('转换过程中发生错误');
      console.error('转换错误:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleCopyText = () => {
    if (convertedText) {
      navigator.clipboard.writeText(convertedText);
      message.success('已复制到剪贴板');
    }
  };

  const handleDownload = () => {
    if (convertedFile) {
      const link = document.createElement('a');
      link.href = convertedFile;
      const fileName = convertedFile.split('/').pop() || 'converted-file';
      link.download = fileName;
      link.click();
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const uploadProps: UploadProps = {
    beforeUpload,
    onChange: handleUploadChange,
    maxCount: 1,
    fileList: file ? [{
      uid: '-1',
      name: file.name,
      status: 'done',
      originFileObj: file
    } as UploadFile] : [],
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>返回主页</Button>
          </Link>
          <Title level={2} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            图片格式转换
          </Title>
          <div style={{ width: 100 }}></div>
        </div>
        
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>选择图片文件:</Text>
              <Upload {...uploadProps} style={{ marginTop: 10 }}>
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </Upload>
            </div>
            
            <div>
              <Text strong>输出格式:</Text>
              <Select
                value={outputFormat}
                onChange={setOutputFormat}
                style={{ width: 120, marginLeft: 10 }}
              >
                <Option value="markdown">Markdown</Option>
                <Option value="docx">DOCX</Option>
              </Select>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                icon={<FileImageOutlined />} 
                onClick={handleConvert}
                loading={converting}
                size="large"
                disabled={!file}
              >
                {converting ? '转换中...' : '开始转换'}
              </Button>
            </div>
            
            {/* 显示转换成功消息 */}
            {convertedText && !converting && (
              <Alert 
                message="转换成功" 
                type="success" 
                showIcon 
              />
            )}
          </Space>
        </Card>
        
        {note && (
          <Alert 
            message="提示" 
            description={note} 
            type="info" 
            showIcon 
          />
        )}
        
        {convertedText && (
          <Card title="转换结果">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <TextArea
                value={convertedText}
                autoSize={{ minRows: 10, maxRows: 20 }}
                readOnly
              />
              <div style={{ textAlign: 'center' }}>
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={handleCopyText}
                  style={{ marginRight: 10 }}
                >
                  复制到剪贴板
                </Button>
                {convertedFile && (
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownload}
                  >
                    下载文件
                  </Button>
                )}
              </div>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}