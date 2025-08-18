"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Card, 
  Space, 
  Typography, 
  Table, 
  Tag, 
  message,
  Empty,
  Spin
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ArrowLeftOutlined,
  DownloadOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import UserNavbar from '../components/UserNavbar';

const { Title, Text } = Typography;

// 定义转换记录类型
interface ConversionRecord {
  id: string;
  inputType: string;
  outputType: string;
  input?: string;        // 输入文本内容
  output?: string;       // 输出文本内容
  inputFile?: string;    // 输入文件路径
  outputFile?: string;   // 输出文件路径
  createdAt: string;
}

export default function HistoryPage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ConversionRecord[]>([]);

  // 加载转换历史记录
  useEffect(() => {
    if (status === 'authenticated') {
      loadConversionHistory();
    }
  }, [status]);

  const loadConversionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/history');
      const result = await response.json();
      
      if (response.ok) {
        setHistory(result.data || []);
      } else {
        message.error('获取转换历史失败: ' + result.message);
      }
    } catch {
      message.error('获取转换历史时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理输入内容查看
  const handleViewInput = async (record: ConversionRecord) => {
    if (record.inputFile) {
      // 如果是文件，下载
      await downloadFile(record.inputFile, `input-${record.id}`);
    } else if (record.input) {
      // 如果是文本，复制到剪贴板
      copyToClipboard(record.input, '输入内容');
    } else {
      message.warning('该记录没有可用的输入内容');
    }
  };

  // 处理输出内容查看
  const handleViewOutput = async (record: ConversionRecord) => {
    if (record.outputFile) {
      // 如果是文件，下载
      await downloadFile(record.outputFile, `output-${record.id}`);
    } else if (record.output) {
      // 如果是文本，复制到剪贴板
      copyToClipboard(record.output, '输出内容');
    } else {
      message.warning('该记录没有可用的输出内容');
    }
  };

  // 复制文本到剪贴板
  const copyToClipboard = async (text: string, contentType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${contentType}已复制到剪贴板`);
    } catch {
      // 如果剪贴板API不可用，尝试备用方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success(`${contentType}已复制到剪贴板`);
      } catch {
        message.error('复制失败，请手动选择复制');
      }
      document.body.removeChild(textArea);
    }
  };

  // 下载文件
  const downloadFile = async (filePath: string, defaultName: string) => {
    try {
      // 检查文件是否存在
      const checkResponse = await fetch(filePath, { method: 'HEAD' });
      
      if (!checkResponse.ok) {
        if (checkResponse.status === 404) {
          message.error('文件不存在或已被删除');
        } else {
          message.error('文件访问失败');
        }
        return;
      }
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = filePath;
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('文件下载已开始');
    } catch (error) {
      console.error('下载文件时出错:', error);
      message.error('文件下载失败');
    }
  };

  // 获取输入类型标签颜色
  const getInputTypeColor = (type: string) => {
    switch (type) {
      case 'markdown': return 'blue';
      case 'image': return 'green';
      default: return 'default';
    }
  };

  // 获取输出类型标签颜色
  const getOutputTypeColor = (type: string) => {
    switch (type) {
      case 'docx': return 'blue';
      case 'html': return 'orange';
      case 'latex': return 'purple';
      case 'pdf': return 'red';
      case 'plain': return 'green';
      case 'image': return 'cyan';
      default: return 'default';
    }
  };

  // 表格列定义
  const columns: ColumnsType<ConversionRecord> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
      sorter: (a: ConversionRecord, b: ConversionRecord) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '输入类型',
      dataIndex: 'inputType',
      key: 'inputType',
      render: (text: string) => (
        <Tag color={getInputTypeColor(text)}>{text}</Tag>
      ),
      filters: [
        { text: 'Markdown', value: 'markdown' },
        { text: '图片', value: 'image' },
      ],
      onFilter: (value, record) => record.inputType === String(value),
    },
    {
      title: '输出类型',
      dataIndex: 'outputType',
      key: 'outputType',
      render: (text: string) => (
        <Tag color={getOutputTypeColor(text)}>{text}</Tag>
      ),
      filters: [
        { text: 'DOCX', value: 'docx' },
        { text: 'HTML', value: 'html' },
        { text: 'LaTeX', value: 'latex' },
        { text: 'PDF', value: 'pdf' },
        { text: '纯文本', value: 'plain' },
        { text: '图片', value: 'image' },
      ],
      onFilter: (value, record) => record.outputType === String(value),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ConversionRecord) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={record.inputFile || record.inputType === 'image' ? <DownloadOutlined /> : <CopyOutlined />}
            onClick={() => handleViewInput(record)}
            disabled={!record.input && !record.inputFile}
          >
            查看输入
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.outputFile || record.outputType === 'image' ? <DownloadOutlined /> : <CopyOutlined />}
            onClick={() => handleViewOutput(record)}
            disabled={!record.output && !record.outputFile}
          >
            查看输出
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', marginTop: 64 }}>
      <UserNavbar />
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/convert">
            <Button icon={<ArrowLeftOutlined />}>返回转换</Button>
          </Link>
          <Title level={2} style={{ margin: 0, flex: 1, textAlign: 'center' }}>
            转换历史
          </Title>
          <div style={{ width: 100 }}></div>
        </div>

        {status === 'authenticated' ? (
          <Card>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : history.length > 0 ? (
              <Table 
                dataSource={history} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty 
                description="暂无转换历史" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        ) : (
          <Card>
            <Text>请先登录以查看转换历史</Text>
          </Card>
        )}
      </Space>
    </div>
  );
}