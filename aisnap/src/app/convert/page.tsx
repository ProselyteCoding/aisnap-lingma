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
  Collapse,
  Row,
  Col
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
  PictureOutlined,
  SettingOutlined,
  UserOutlined,
  RobotOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import type { UploadProps, UploadFile, TabsProps } from 'antd';
import UserNavbar from '../components/UserNavbar';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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
  const [filePreviewContent, setFilePreviewContent] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(''); // 用户输入的提示词
  const previewRef = useRef<HTMLDivElement>(null);
  
  // 图片模板设置状态
  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    fontSize: 14,
    fontFamily: 'Arial',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    aiTheme: 'tongyi',
    width: 450,
    padding: 20,
    contentFormat: 'markdown' // 默认为markdown（输出2）
  });

  // 生成并上传图片到服务器
  const generateAndUploadImage = async (expectedPath: string) => {
    if (!previewRef.current) {
      console.error('预览元素不存在');
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
      
      // 将canvas转换为blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // 上传图片到服务器
      const formData = new FormData();
      formData.append('image', blob, expectedPath.split('/').pop() || 'output.png');
      formData.append('expectedPath', expectedPath);

      const response = await fetch('/api/upload-generated-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        console.log('图片已成功上传到服务器:', expectedPath);
      } else {
        console.error('图片上传失败');
      }
    } catch (error) {
      console.error('生成或上传图片时出错:', error);
    }
  };

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
    setFilePreviewContent(null);

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
          // 对于文件输出（除了图片），获取文件内容用于预览
          if (outputTypeValue !== 'image' && outputTypeValue !== 'plain') {
            const content = await getFileContentForPreview(result.data.outputFile, outputTypeValue);
            if (content) {
              setFilePreviewContent(content);
            }
          }
        }
        if (result.data.result) {
          setConvertedText(result.data.result);
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
    setFilePreviewContent(null);

    try {
      const formData = new FormData();
      formData.append('image', fileValue);
      formData.append('outputType', outputTypeValue); // 使用用户选择的输出1格式
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
          // 对于文件输出（除了图片），获取文件内容用于预览
          if (outputTypeValue !== 'image' && outputTypeValue !== 'plain') {
            const content = await getFileContentForPreview(result.data.outputFile, outputTypeValue);
            if (content) {
              setFilePreviewContent(content);
            }
          }
        }
        if (result.data.result) {
          setConvertedText(result.data.result);
          
          // 如果输出类型是图片，需要生成并上传图片
          if (outputTypeValue === 'image' && result.data.outputFile) {
            setTimeout(async () => {
              await generateAndUploadImage(result.data.outputFile);
            }, 1000); // 等待DOM更新后生成图片
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

  // 处理输出类型变化
  const handleOutputTypeChange = (value: 'docx' | 'html' | 'latex' | 'pdf' | 'plain' | 'image') => {
    setOutputTypeValue(value);
    // 切换输出类型时清空预览内容
    setConvertedFile(null);
    setConvertedText(null);
    setFilePreviewContent(null);
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

  // 获取文件类型的预览提示信息
  const getPreviewHint = (fileType: string): string => {
    switch (fileType) {
      case 'latex':
        return 'LaTeX代码预览（实际样式以编译后的文件为准）';
      case 'html':
        return 'HTML代码预览（实际样式可能与此不同）';
      case 'docx':
        return 'DOCX文档内容预览（实际格式以下载的文件为准）';
      case 'pdf':
        return 'PDF文件内容预览';
      default:
        return '文件内容预览（实际样式可能与此不同）';
    }
  };

  // 获取文件内容用于预览
  const getFileContentForPreview = async (filePath: string, fileType: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/file/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: filePath,
          fileType: fileType
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.content;
        }
      }
      return null;
    } catch (error) {
      console.error('获取文件内容失败:', error);
      return null;
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
    if (!convertedText) return null;

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
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap' // 支持换行符显示
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
              {convertedText}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染图片样式设置面板
  const renderImageSettings = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* 分享提示词 - 独立一行占满宽度 */}
      <div>
        <Text>分享提示词:</Text>
        <Input.TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：请解释前端开发&#13;&#10;支持换行输入多行提示词"
          style={{ marginTop: 8, width: '100%' }}
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </div>
      
      {/* 其他设置项 - 左右两栏布局 */}
      <Row gutter={[16, 16]}>
        {/* 左栏 */}
        <Col span={12}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>输出内容格式:</Text>
              <Select
                value={imageSettings.contentFormat}
                onChange={(value) => updateImageSettings('contentFormat', value as 'markdown' | 'latex' | 'docx')}
                style={{ width: '100%', marginTop: 4 }}
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
                style={{ width: '100%', marginTop: 4 }}
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
              <div style={{ marginTop: 8 }}>
                <Slider
                  min={10}
                  max={24}
                  value={imageSettings.fontSize}
                  onChange={(value) => updateImageSettings('fontSize', value)}
                  style={{ width: 'calc(100% - 50px)', marginRight: 8 }}
                />
                <Text code>{imageSettings.fontSize}px</Text>
              </div>
            </div>
            
            <div>
              <Text>背景颜色:</Text>
              <div style={{ marginTop: 4 }}>
                <ColorPicker
                  value={imageSettings.backgroundColor}
                  onChange={(value) => updateImageSettings('backgroundColor', value.toHexString())}
                  showText
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </Space>
        </Col>
        
        {/* 右栏 */}
        <Col span={12}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>文字颜色:</Text>
              <div style={{ marginTop: 4 }}>
                <ColorPicker
                  value={imageSettings.textColor}
                  onChange={(value) => updateImageSettings('textColor', value.toHexString())}
                  showText
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div>
              <Text>AI主题:</Text>
              <Select
                value={imageSettings.aiTheme}
                onChange={(value) => {
                  applyAITheme(value);
                }}
                style={{ width: '100%', marginTop: 4 }}
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
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
                选择AI主题将自动应用配色方案
              </Text>
            </div>
            
            <div>
              <Text>宽度:</Text>
              <div style={{ marginTop: 8 }}>
                <Slider
                  min={400}
                  max={1000}
                  value={imageSettings.width}
                  onChange={(value) => updateImageSettings('width', value)}
                  style={{ width: 'calc(100% - 60px)', marginRight: 8 }}
                />
                <Text code>{imageSettings.width}px</Text>
              </div>
            </div>
          </Space>
        </Col>
      </Row>
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
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      <UserNavbar pageName="格式转换" />
      <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Link href="/">
            <Button 
              icon={<ArrowLeftOutlined />}
              className="back-button"
            >
              返回主页
            </Button>
          </Link>
        </div>

        {/* 响应式布局：移动端上下，PC端左右 */}
        <Row gutter={[24, 24]}>
          {/* 输入区域 */}
          <Col xs={24} lg={10}>
            <Card 
              title="输入内容" 
              className="transparent-card"
              style={{ 
                height: '100%'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Tabs activeKey={activeTab} items={items} onChange={setActiveTab} />

                <div>
                  <Text strong>输出格式:</Text>
                  <Select
                    value={outputTypeValue}
                    onChange={handleOutputTypeChange}
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
                    items={[
                      {
                        key: '1',
                        label: <span><SettingOutlined /> 图片样式设置</span>,
                        children: renderImageSettings()
                      }
                    ]}
                  />
                )}
                
                <div style={{ textAlign: 'center' }}>
                  <Space size="middle" wrap>
                    <Button 
                      type="primary" 
                      icon={<FileTextOutlined />} 
                      onClick={handleConvert}
                      loading={converting}
                      style={{ 
                        height: '40px',
                        lineHeight: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {converting ? '转换中...' : '开始转换'}
                    </Button>
                    
                    {/* 下载和复制按钮 */}
                    {outputTypeValue === 'image' && convertedText ? (
                      <>
                        <Button 
                          type="primary" 
                          icon={<DownloadOutlined />}
                          onClick={handleSaveAsImage}
                          style={{ 
                            height: '40px',
                            lineHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          下载图片
                        </Button>
                        <Button 
                          icon={<CopyOutlined />}
                          onClick={handleCopyImageToClipboard}
                          style={{ 
                            height: '40px',
                            lineHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          复制到剪贴板
                        </Button>
                      </>
                    ) : (
                      <>
                        {convertedFile && (
                          <Button 
                            type="primary" 
                            icon={<DownloadOutlined />} 
                            onClick={handleDownload}
                            style={{ 
                              height: '40px',
                              lineHeight: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            下载文件
                          </Button>
                        )}
                        {convertedText && (
                          <Button 
                            icon={<CopyOutlined />} 
                            onClick={handleCopyText}
                            style={{ 
                              height: '40px',
                              lineHeight: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            复制文本
                          </Button>
                        )}
                      </>
                    )}
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>

          {/* 预览区域 */}
          <Col xs={24} lg={14}>
            <Card 
              title="预览结果" 
              className="transparent-card"
              style={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column'
              }}
              styles={{ 
                body: {
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '24px'
                }
              }}
            >
              <div style={{ flex: 1 }}>
                {!convertedFile && !convertedText ? (
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      minHeight: '300px',
                      textAlign: 'center',
                      padding: '40px 20px'
                    }}>
                      <FileImageOutlined style={{ 
                        fontSize: '48px', 
                        color: '#d9d9d9',
                        marginBottom: '16px'
                      }} />
                      <p style={{
                        color: '#8c8c8c',
                        fontSize: '16px',
                        margin: '0 0 8px 0'
                      }}>
                        预览区域
                      </p>
                      <p style={{
                        color: '#bfbfbf',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        转换完成后预览内容将在此显示
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 图片输出预览 */}
                      {outputTypeValue === 'image' && convertedText ? (
                        <div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666', 
                            marginBottom: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px'
                          }}>
                            💡 图片模板预览（可下载或复制到剪贴板）
                          </div>
                          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
                            <div style={{
                              border: '2px dashed #d9d9d9',
                              borderRadius: '8px',
                              padding: '20px',
                              margin: '0 auto',
                              display: 'inline-block'
                            }}>
                              {renderDialogPreview()}
                            </div>
                          </div>
                        </div>
                      ) : 
                    /* HTML输出预览 */
                    outputTypeValue === 'html' ? (
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px'
                        }}>
                          💡 {getPreviewHint('html')}
                        </div>
                        <div 
                          ref={previewRef}
                          style={{ 
                            minHeight: '200px', 
                            padding: '20px', 
                            border: '1px solid #f0f0f0',
                            backgroundColor: '#fff'
                          }}
                          dangerouslySetInnerHTML={{ 
                            __html: filePreviewContent || convertedText || ''
                          }}
                        />
                      </div>
                    ) : 
                    /* LaTeX和纯文本输出预览 */
                    (outputTypeValue === 'latex' || outputTypeValue === 'plain') ? (
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px'
                        }}>
                          💡 {getPreviewHint(outputTypeValue)}
                        </div>
                        <div 
                          ref={previewRef}
                          style={{ 
                            minHeight: '200px', 
                            padding: '20px', 
                            border: '1px solid #f0f0f0',
                            backgroundColor: '#fff',
                            fontFamily: outputTypeValue === 'latex' ? 'monospace' : 'inherit',
                            fontSize: outputTypeValue === 'latex' ? '14px' : 'inherit'
                          }}
                        >
                          <pre style={{ 
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: '1.6',
                            margin: 0,
                            fontFamily: 'inherit'
                          }}>
                            {filePreviewContent || convertedText || ''}
                          </pre>
                        </div>
                      </div>
                    ) : 
                    /* DOCX输出预览 */
                    outputTypeValue === 'docx' ? (
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px'
                        }}>
                          💡 {getPreviewHint('docx')}
                        </div>
                        {filePreviewContent ? (
                          <div 
                            ref={previewRef}
                            style={{ 
                              minHeight: '200px', 
                              padding: '20px', 
                              border: '1px solid #f0f0f0',
                              backgroundColor: '#fff'
                            }}
                          >
                            <pre style={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: '1.6',
                              margin: 0,
                              fontFamily: 'inherit'
                            }}>
                              {filePreviewContent}
                            </pre>
                          </div>
                        ) : (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            color: '#666'
                          }}>
                            <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', display: 'block', color: '#1890ff' }} />
                            <p>文件已生成完成</p>
                            <p style={{ fontSize: '14px', color: '#999' }}>
                              正在获取文件内容预览...
                            </p>
                          </div>
                        )}
                      </div>
                    ) : 
                    /* PDF输出预览 */
                    outputTypeValue === 'pdf' ? (
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#666', 
                          marginBottom: '8px',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '4px'
                        }}>
                          💡 {getPreviewHint('pdf')}
                        </div>
                        {filePreviewContent ? (
                          <div 
                            ref={previewRef}
                            style={{ 
                              minHeight: '200px', 
                              padding: '20px', 
                              border: '1px solid #f0f0f0',
                              backgroundColor: '#fff'
                            }}
                          >
                            <pre style={{ 
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: '1.6',
                              margin: 0,
                              fontFamily: 'inherit'
                            }}>
                              {filePreviewContent}
                            </pre>
                          </div>
                        ) : (
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            color: '#666'
                          }}>
                            <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', display: 'block', color: '#1890ff' }} />
                            <p>文件已生成完成</p>
                            <p style={{ fontSize: '14px', color: '#999' }}>
                              PDF文件无法在线预览，请下载查看
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '40px 20px',
                        color: '#666'
                      }}>
                        <p>转换完成</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* 图片输出时在预览框底部显示提示 */}
              {outputTypeValue === 'image' && convertedText && (
                <div style={{
                  marginTop: 'auto',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#595959',
                  fontWeight: 500,
                  textAlign: 'center',
                  backgroundColor: '#f0f2f5',
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9'
                }}>
                  📸 虚线区域内容将生成为图片
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}