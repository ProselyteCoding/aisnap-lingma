"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Card, 
  App
} from 'antd';
import { 
  FileTextOutlined, 
  ArrowLeftOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useStore } from '@/stores/useStore';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function TextConversion() {
  const { message } = App.useApp();
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'markdown' | 'html' | 'latex'>('markdown');
  const [outputType, setOutputType] = useState<'docx' | 'html' | 'latex' | 'pdf' | 'plain'>('docx');
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [convertedText, setConvertedText] = useState<string | null>(null);
  const { templateConfig } = useStore();

  // 当模板配置变化时，更新输入文本
  useEffect(() => {
    // 这里可以根据模板配置生成预设内容
    // 在实际应用中，你可能需要根据templateConfig的值来生成不同的预设内容
    if (inputText === '') {
      // 只有在输入文本为空时才设置默认模板内容
      setInputText('# 示例文档\n\n这是使用模板生成的示例内容。\n\n## 章节一\n\n内容...\n\n## 章节二\n\n内容...');
    }
  }, [templateConfig, inputText]);

  const handleConvert = async () => {
    if (!inputText.trim()) {
      message.warning('请输入要转换的内容');
      return;
    }

    setConverting(true);
    setConvertedFile(null);
    setConvertedText(null);

    try {
      // 调用API路由进行转换
      const response = await fetch('/api/convert/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputText,
          inputType,
          outputType,
          template: templateConfig
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.outputFile) {
          setConvertedFile(result.data.outputFile);
          message.success('转换成功！');
        } else if (result.data.result) {
          setConvertedText(result.data.result);
          message.success('转换成功！');
        }
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

  const handleDownload = () => {
    if (convertedFile) {
      const link = document.createElement('a');
      link.href = convertedFile;
      const fileName = convertedFile.split('/').pop() || 'converted-file';
      link.download = fileName;
      link.click();
    }
  };

  const handleCopyText = () => {
    if (convertedText) {
      navigator.clipboard.writeText(convertedText);
      message.success('已复制到剪贴板');
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <Button 
              icon={<ArrowLeftOutlined />}
              className="back-button"
            >
              返回主页
            </Button>
          </Link>
          <Title level={2} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            文本格式转换
          </Title>
          <div style={{ width: 100 }}></div>
        </div>
        
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>输入格式:</Text>
              <Select
                value={inputType}
                onChange={setInputType}
                style={{ width: 120, marginLeft: 10 }}
              >
                <Option value="markdown">Markdown</Option>
                <Option value="html">HTML</Option>
                <Option value="latex">LaTeX</Option>
              </Select>
            </div>
            
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要转换的内容..."
              autoSize={{ minRows: 10, maxRows: 15 }}
            />
            
            <div style={{ textAlign: 'right' }}>
              <Link href="/template">
                <Button type="link">管理模板</Button>
              </Link>
            </div>
          </Space>
        </Card>
        
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>输出格式:</Text>
              <Select
                value={outputType}
                onChange={setOutputType}
                style={{ width: 120, marginLeft: 10 }}
              >
                <Option value="docx">DOCX</Option>
                <Option value="html">HTML</Option>
                <Option value="latex">LaTeX</Option>
                <Option value="pdf">PDF</Option>
                <Option value="plain">纯文本</Option>
              </Select>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                icon={<FileTextOutlined />} 
                onClick={handleConvert}
                loading={converting}
                size="large"
              >
                {converting ? '转换中...' : '开始转换'}
              </Button>
            </div>
            
            {convertedFile && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Button type="primary" onClick={handleDownload}>
                  下载转换文件
                </Button>
                <Text type="success" style={{ display: 'block', marginTop: 10 }}>
                  文件已准备就绪，点击按钮下载
                </Text>
              </div>
            )}
            
            {convertedText && (
              <div style={{ marginTop: 20 }}>
                <Text strong>转换结果:</Text>
                <TextArea
                  value={convertedText}
                  autoSize={{ minRows: 5, maxRows: 10 }}
                  readOnly
                  style={{ marginTop: 10 }}
                />
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyText}
                    style={{ marginRight: 10 }}
                  >
                    复制到剪贴板
                  </Button>
                </div>
              </div>
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
}