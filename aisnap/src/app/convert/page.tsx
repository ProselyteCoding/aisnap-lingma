"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Button, 
  Card, 
  Space, 
  Typography, 
  Tabs, 
  Input, 
  Upload, 
  Select, 
  Alert,
  Collapse
} from 'antd';

// 从antd/es导入需要的组件以避免打包问题
import ColorPicker from 'antd/es/color-picker';
import Slider from 'antd/es/slider';

// 导入ColorPicker的样式
import 'antd/es/color-picker/style';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  ArrowLeftOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
  RobotOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile, TabsProps } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// 定义图片设置类型
interface ImageSettings {
  fontSize: number;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  aiTheme: 'tongyi' | 'openai' | 'wenxinyiyan' | 'deepseek' | 'doubao' | 'yuanbao' | 'kimi' | 'general';
  width: number;
  padding: number;
  contentFormat: 'markdown' | 'latex' | 'docx'; // 输出内容格式（输出2）
}

export default function ConvertPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [inputTextValue, setInputTextValue] = useState('');
  const [fileValue, setFileValue] = useState<File | null>(null);
  const [inputTypeValue, setInputTypeValue] = useState<'markdown' | 'html' | 'latex'>('markdown');
  const [outputTypeValue, setOutputTypeValue] = useState<'docx' | 'html' | 'latex' | 'pdf' | 'plain' | 'image'>('docx');
  const [converting, setConverting] = useState(false);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [convertedText, setConvertedText] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(''); // 用户输入的提示词
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 图片模板设置状态
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    fontSize: 14,
    fontFamily: 'Arial',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    aiTheme: 'tongyi',
    width: 600,
    padding: 20,
    contentFormat: 'markdown' // 默认为markdown（输出2）
  });

  // 更新图片设置
  const updateImageSettings = <K extends keyof ImageSettings>(field: K, value: ImageSettings[K]) => {
    setImageSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AI主题预设配置
  const getAIThemeConfig = (aiTheme: string) => {
    switch (aiTheme) {
      case 'tongyi':
        return {
          bubbleColor: '#f0f8ff', // AI回答气泡背景色
          textColor: '#1a1a1a',
          fontFamily: 'Microsoft YaHei',
          aiName: '通义千问',
          aiColor: '#1677ff',
          logoSrc: '/tongyi.svg'
        };
      case 'openai':
        return {
          bubbleColor: '#f7f7f8',
          textColor: '#1a1a1a',
          fontFamily: 'Arial',
          aiName: 'OpenAI',
          aiColor: '#10a37f',
          logoSrc: '/openai.svg'
        };
      case 'wenxinyiyan':
        return {
          bubbleColor: '#f5f8ff',
          textColor: '#1a1a1a',
          fontFamily: 'Microsoft YaHei',
          aiName: '文心一言',
          aiColor: '#337eff',
          logoSrc: '/wenxinyiyan.svg'
        };
      case 'deepseek':
        return {
          bubbleColor: '#fafafa',
          textColor: '#1a1a1a',
          fontFamily: 'Arial',
          aiName: 'DeepSeek',
          aiColor: '#6366f1',
          logoSrc: '/deepseek.svg'
        };
      case 'doubao':
        return {
          bubbleColor: '#fff5f5',
          textColor: '#1a1a1a',
          fontFamily: 'Microsoft YaHei',
          aiName: '豆包',
          aiColor: '#ff6b6b',
          logoSrc: '/doubao.svg'
        };
      case 'yuanbao':
        return {
          bubbleColor: '#fffbf0',
          textColor: '#1a1a1a',
          fontFamily: 'Microsoft YaHei',
          aiName: '元宝',
          aiColor: '#ffd700',
          logoSrc: '/yuanbao.svg'
        };
      case 'kimi':
        return {
          bubbleColor: '#f8f9ff',
          textColor: '#1a1a1a',
          fontFamily: 'Microsoft YaHei',
          aiName: 'Kimi',
          aiColor: '#7c3aed',
          logoSrc: '/kimi.svg'
        };
      default:
        return {
          bubbleColor: '#f0f0f0',
          textColor: imageSettings.textColor,
          fontFamily: imageSettings.fontFamily,
          aiName: 'AI助手',
          aiColor: '#1677ff',
          logoSrc: '/general.svg'
        };
    }
  };

  // 应用AI主题
  const applyAITheme = (theme: string) => {
    setImageSettings(prev => ({
      ...prev,
      aiTheme: theme as 'tongyi' | 'openai' | 'wenxinyiyan' | 'deepseek' | 'doubao' | 'yuanbao' | 'kimi' | 'general'
    }));
    
    if (theme === 'general') return;
    
    const config = getAIThemeConfig(theme);
    setImageSettings(prev => ({
      ...prev,
      textColor: config.textColor,
      fontFamily: config.fontFamily
    }));
  };

  const handleTextConvert = async () => {
    if (!inputTextValue.trim()) {
      // 使用Alert组件替代message来避免警告
      return;
    }

    setConverting(true);
    setConvertedFile(null);
    setConvertedText(null);
    setPreviewContent(null);

    try {
      // 调用API路由进行转换
      const response = await fetch('/api/convert/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: inputTextValue,
          inputType: inputTypeValue,
          outputType: outputTypeValue,
          outputFormat: outputTypeValue === 'image' ? imageSettings.contentFormat : undefined,
          imageSettings: outputTypeValue === 'image' ? imageSettings : undefined
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.outputFile) {
          setConvertedFile(result.data.outputFile);
        }
        if (result.data.result) {
          setConvertedText(result.data.result);
          // 对于图片输出，设置预览内容
          if (outputTypeValue === 'image') {
            setPreviewContent(result.data.result);
          }
        }
        // 使用Alert组件替代message来避免警告
      } else {
        // 使用Alert组件替代message来避免警告
      }
    } catch (error) {
      // 使用Alert组件替代message来避免警告
      console.error('转换错误:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleImageConvert = async () => {
    if (!fileValue) {
      // 使用Alert组件替代message来避免警告
      return;
    }

    setConverting(true);
    setConvertedFile(null);
    setConvertedText(null);
    setPreviewContent(null);

    try {
      const formData = new FormData();
      formData.append('image', fileValue);
      formData.append('format', outputTypeValue); // 使用用户选择的输出1格式
      formData.append('outputFormat', imageSettings.contentFormat); // 传递输出2格式
      formData.append('prompt', prompt); // 添加提示词
      formData.append('imageSettings', JSON.stringify(imageSettings)); // 传递图片设置

      const response = await fetch('/api/convert/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.outputFile) {
          setConvertedFile(result.data.outputFile);
        }
        if (result.data.result) {
          setConvertedText(result.data.result);
          // 对于图片输出，设置预览内容
          if (outputTypeValue === 'image') {
            setPreviewContent(result.data.result);
          }
        }
        // 使用Alert组件替代message来避免警告
      } else {
        // 使用Alert组件替代message来避免警告
      }
    } catch (error) {
      // 使用Alert组件替代message来避免警告
      console.error('转换错误:', error);
    } finally {
      setConverting(false);
    }
  };

  const handleConvert = () => {
    if (activeTab === 'text') {
      handleTextConvert();
    } else {
      handleImageConvert();
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
      // 检查剪贴板API是否可用
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(convertedText)
          .then(() => {
            alert('文本已复制到剪贴板');
          })
          .catch(() => {
            fallbackCopyText(convertedText);
          });
      } else {
        fallbackCopyText(convertedText);
      }
    }
  };

  // 降级复制方案（适用于HTTP环境）
  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('文本已复制到剪贴板');
      } else {
        alert('复制失败，请手动选择并复制文本');
      }
    } catch {
      alert('复制失败，请手动选择并复制文本');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handlePreview = () => {
    // 对于图片输出，使用转换后的内容作为预览
    if (outputTypeValue === 'image') {
      if (activeTab === 'text' && convertedText) {
        setPreviewContent(convertedText);
      } else if (activeTab === 'image' && convertedText) {
        setPreviewContent(convertedText);
      } else {
        // 如果还没有转换结果，提示用户先进行转换
        alert('请先进行转换以获取预览内容');
        return;
      }
    } else {
      // 对于非图片输出，显示原始输入内容
      if (activeTab === 'text' && inputTextValue) {
        setPreviewContent(inputTextValue);
      } else if (activeTab === 'image' && convertedText) {
        setPreviewContent(convertedText);
      }
    }
  };

  const handleSaveAsImage = async () => {
    if (!previewRef.current) {
      // 使用Alert组件替代message来避免警告
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: imageSettings.backgroundColor,
        scale: 2, // 提高图片质量
        useCORS: true,
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = 'preview.png';
      link.click();
      // 使用Alert组件替代message来避免警告
    } catch (error) {
      // 使用Alert组件替代message来避免警告
      console.error('保存图片错误:', error);
    }
  };

  const handleCopyImageToClipboard = async () => {
    if (!previewRef.current) {
      alert('没有可复制的内容');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: imageSettings.backgroundColor,
        scale: 2, // 提高图片质量
        useCORS: true,
        logging: false
      });
      
      // 检查剪贴板API是否可用
      if (navigator.clipboard && window.isSecureContext) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({
                  'image/png': blob
                })
              ]);
              alert('图片已复制到剪贴板');
            } catch (error) {
              console.error('复制到剪贴板失败:', error);
              fallbackCopyImage(canvas);
            }
          }
        }, 'image/png');
      } else {
        fallbackCopyImage(canvas);
      }
    } catch (error) {
      console.error('生成图片错误:', error);
      alert('生成图片失败');
    }
  };

  // 图片复制降级方案（HTTP环境）
  const fallbackCopyImage = (canvas: HTMLCanvasElement) => {
    alert('HTTP环境下无法直接复制图片到剪贴板，建议：\n1. 右键图片选择"复制图像"\n2. 或点击"下载图片"保存到本地');
    // 可以考虑显示图片让用户右键复制
    const imgWindow = window.open('', '_blank');
    if (imgWindow) {
      imgWindow.document.write(`<img src="${canvas.toDataURL()}" style="max-width:100%;" />`);
    }
  };

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    if (info.fileList.length > 0) {
      setFileValue(info.fileList[0].originFileObj as File);
    } else {
      setFileValue(null);
    }
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      // 使用Alert组件替代message来避免警告
    }
    return isImage || Upload.LIST_IGNORE;
  };

  const uploadPropsValue: UploadProps = {
    beforeUpload,
    onChange: handleUploadChange,
    maxCount: 1,
    fileList: fileValue ? [{
      uid: '-1',
      name: fileValue.name,
      status: 'done',
      originFileObj: fileValue
    } as UploadFile] : [],
  };

  // 渲染对话式预览
  const renderDialogPreview = () => {
    if (!previewContent) return null;

    const themeConfig = getAIThemeConfig(imageSettings.aiTheme);

    return (
      <div 
        ref={previewRef}
        style={{ 
          width: imageSettings.width,
          padding: imageSettings.padding,
          backgroundColor: imageSettings.backgroundColor,
          color: imageSettings.textColor,
          fontFamily: imageSettings.fontFamily,
          fontSize: imageSettings.fontSize,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative'
        }}
      >
        {/* 用户问题 */}
        {prompt && (
          <div style={{ 
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            gap: '10px',
            marginLeft: '60px' // 与左侧保持距离
          }}>
            <div style={{
              backgroundColor: '#e6f7ff',
              padding: '12px 16px',
              borderRadius: '18px 18px 4px 18px',
              maxWidth: '80%', // 最大宽度限制
              width: 'fit-content', // 根据内容调整宽度
              color: '#1a1a1a',
              textAlign: 'left',
              wordBreak: 'break-word',
              lineHeight: '1.6'
            }}>
              {prompt}
            </div>
            {/* 用户头像占位符 */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: '#f8f9ff',
              border: '0.5px solid #1677ff', // 更细的蓝色圆形边框
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserOutlined style={{ color: '#1677ff', fontSize: '18px' }} />
            </div>
          </div>
        )}
        
        {/* AI 回答 */}
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          marginRight: '60px' // 与右侧保持距离
        }}>
          {/* AI头像/Logo */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px', // 改为小圆角正方形
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {themeConfig.logoSrc ? (
              <Image 
                src={themeConfig.logoSrc} 
                alt={themeConfig.aiName} 
                width={32} 
                height={32} 
                style={{ objectFit: 'cover', borderRadius: '4px' }} // 图片也改为小圆角
              />
            ) : (
              <RobotOutlined style={{ color: themeConfig.aiColor, fontSize: '20px' }} />
            )}
          </div>
          
          <div style={{
            backgroundColor: themeConfig.bubbleColor,
            padding: '12px 16px',
            borderRadius: '4px 18px 18px 18px',
            maxWidth: '80%', // 最大宽度限制
            width: 'fit-content', // 根据内容调整宽度
            color: themeConfig.textColor
          }}>
            <div style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              wordBreak: 'break-word', // 自动换行
              textAlign: 'left' // 文字左对齐
            }}>
              {previewContent}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染图片样式设置面板
  const renderImageSettings = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text>分享提示词:</Text>
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：请解释前端开发"
          style={{ marginLeft: 10, width: 300 }}
        />
      </div>
      
      <div>
        <Text>输出内容格式:</Text>
        <Select
          value={imageSettings.contentFormat}
          onChange={(value) => updateImageSettings('contentFormat', value as 'markdown' | 'latex' | 'docx')}
          style={{ width: 150, marginLeft: 10 }}
        >
          <Option value="markdown">Markdown</Option>
          <Option value="latex">LaTeX</Option>
          <Option value="docx">DOCX</Option>
        </Select>
      </div>
      
      <div>
        <Text>字体:</Text>
        <Select
          value={imageSettings.fontFamily}
          onChange={(value) => updateImageSettings('fontFamily', value)}
          style={{ width: 150, marginLeft: 10 }}
        >
          <Option value="Arial">Arial</Option>
          <Option value="SimSun">宋体</Option>
          <Option value="SimHei">黑体</Option>
          <Option value="Times New Roman">Times New Roman</Option>
          <Option value="Microsoft YaHei">微软雅黑</Option>
          <Option value="KaiTi">楷体</Option>
          <Option value="FangSong">仿宋</Option>
        </Select>
      </div>
      
      <div>
        <Text>字体大小:</Text>
        <Slider
          min={10}
          max={24}
          value={imageSettings.fontSize}
          onChange={(value) => updateImageSettings('fontSize', value)}
          style={{ width: 200, marginLeft: 10, marginRight: 10 }}
        />
        <Text code>{imageSettings.fontSize}px</Text>
      </div>
      
      <div>
        <Text>背景颜色:</Text>
        <ColorPicker
          value={imageSettings.backgroundColor}
          onChange={(value) => updateImageSettings('backgroundColor', value.toHexString())}
          style={{ marginLeft: 10 }}
        />
      </div>
      
      <div>
        <Text>文字颜色:</Text>
        <ColorPicker
          value={imageSettings.textColor}
          onChange={(value) => updateImageSettings('textColor', value.toHexString())}
          style={{ marginLeft: 10 }}
        />
      </div>
      
      <div>
        <Text>AI主题:</Text>
        <Select
          value={imageSettings.aiTheme}
          onChange={(value) => {
            applyAITheme(value);
          }}
          style={{ width: 150, marginLeft: 10 }}
        >
          <Option value="tongyi">通义千问</Option>
          <Option value="openai">OpenAI</Option>
          <Option value="wenxinyiyan">文心一言</Option>
          <Option value="deepseek">DeepSeek</Option>
          <Option value="doubao">豆包</Option>
          <Option value="yuanbao">元宝</Option>
          <Option value="kimi">Kimi</Option>
          <Option value="general">通用</Option>
        </Select>
        <Text type="secondary" style={{ marginLeft: 10, fontSize: '12px' }}>
          选择AI主题将自动应用配色方案
        </Text>
      </div>
      
      <div>
        <Text>宽度:</Text>
        <Slider
          min={400}
          max={1000}
          value={imageSettings.width}
          onChange={(value) => updateImageSettings('width', value)}
          style={{ width: 200, marginLeft: 10, marginRight: 10 }}
        />
        <Text code>{imageSettings.width}px</Text>
      </div>
    </Space>
  );

  // 定义Tabs项
  const items: TabsProps['items'] = [
    {
      key: 'text',
      label: <span><FileTextOutlined />文本转换</span>,
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>输入格式:</Text>
            <Select
              value={inputTypeValue}
              onChange={setInputTypeValue}
              style={{ width: 120, marginLeft: 10 }}
            >
              <Option value="markdown">Markdown</Option>
              <Option value="html">HTML</Option>
              <Option value="latex">LaTeX</Option>
            </Select>
          </div>
          
          <TextArea
            value={inputTextValue}
            onChange={(e) => setInputTextValue(e.target.value)}
            placeholder="请输入要转换的内容..."
            autoSize={{ minRows: 10, maxRows: 15 }}
          />
        </Space>
      )
    },
    {
      key: 'image',
      label: <span><PictureOutlined />图片转换</span>,
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>选择图片文件:</Text>
            <Upload {...uploadPropsValue} style={{ marginTop: 10 }}>
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </div>
          
          <Alert 
            message="提示" 
            description="上传图片后，系统将自动识别图片中的内容并转换为文本格式" 
            type="info" 
            showIcon 
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <Button icon={<ArrowLeftOutlined />}>返回主页</Button>
          </Link>
          <Title level={2} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            文档格式转换
          </Title>
          <div style={{ width: 100 }}></div>
        </div>

        <Card>
          <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />
        </Card>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>输出格式:</Text>
              <Select
                value={outputTypeValue}
                onChange={setOutputTypeValue}
                style={{ width: 200, marginLeft: 10 }}
              >
                <Option value="docx">DOCX文档</Option>
                <Option value="html">HTML文档</Option>
                <Option value="latex">LaTeX文档</Option>
                <Option value="pdf">PDF文档</Option>
                <Option value="plain">纯文本</Option>
                <Option value="image">图片</Option>
              </Select>
            </div>
            
            {outputTypeValue === 'image' && (
              <Collapse 
                bordered={false} 
                defaultActiveKey={['1']}
                style={{ background: '#f5f5f5' }}
              >
                <Panel header={<span><SettingOutlined /> 图片样式设置</span>} key="1">
                  {renderImageSettings()}
                </Panel>
              </Collapse>
            )}
            
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
              
              <Button 
                icon={<EyeOutlined />} 
                onClick={handlePreview}
                size="large"
                style={{ marginLeft: 10 }}
              >
                预览
              </Button>
            </div>
            
            {(convertedFile || convertedText) && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                {convertedFile && (
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownload}
                    style={{ marginRight: 10 }}
                  >
                    下载文件
                  </Button>
                )}
                
                {convertedText && outputTypeValue !== 'image' && (
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyText}
                    style={{ marginRight: 10 }}
                  >
                    复制文本
                  </Button>
                )}
              </div>
            )}
          </Space>
        </Card>

        {(previewContent || convertedText) && (
          <Card title="预览">
            {outputTypeValue === 'image' ? (
              <>
                <div style={{ overflowX: 'auto', textAlign: 'center' }}>
                  {renderDialogPreview()}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
                      onClick={handleSaveAsImage}
                    >
                      下载图片
                    </Button>
                    <Button 
                      icon={<CopyOutlined />}
                      onClick={handleCopyImageToClipboard}
                    >
                      复制到剪贴板
                    </Button>
                  </Space>
                </div>
              </>
            ) : (
              <div 
                ref={previewRef}
                style={{ 
                  minHeight: '200px', 
                  padding: '20px', 
                  border: '1px solid #f0f0f0',
                  backgroundColor: '#fff'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {previewContent || convertedText}
                </div>
              </div>
            )}
          </Card>
        )}
      </Space>
    </div>
  );
}