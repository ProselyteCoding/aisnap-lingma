"use client";

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  message, 
  Card, 
  Space, 
  Typography,
  Modal,
  Upload,
  Avatar
} from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  LockOutlined,
  EditOutlined,
  BgColorsOutlined
} from '@ant-design/icons';
import UserNavbar from '../components/UserNavbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 定义修改昵称表单类型
interface UpdateNicknameFormValues {
  nickname: string;
}

// 定义修改密码表单类型
interface UpdatePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [form] = Form.useForm();
  const [updateNicknameForm] = Form.useForm();
  const [updatePasswordForm] = Form.useForm();
  const [isUpdateNicknameModalVisible, setIsUpdateNicknameModalVisible] = useState(false);
  const [isUpdatePasswordModalVisible, setIsUpdatePasswordModalVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 获取用户信息
  useEffect(() => {
    if (session?.user) {
      setAvatarUrl(session.user.image || null);
    }
  }, [session]);

  // 修改昵称功能
  const handleUpdateNickname = () => {
    // 设置表单默认值
    updateNicknameForm.setFieldsValue({
      nickname: session?.user?.name || ''
    });
    setIsUpdateNicknameModalVisible(true);
  };

  // 修改密码功能
  const handleUpdatePassword = () => {
    setIsUpdatePasswordModalVisible(true);
  };

  // 处理头像上传
  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/settings/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success('头像上传成功');
        // 更新会话中的头像信息
        await update({
          ...session,
          user: {
            ...session?.user,
            image: result.avatarUrl
          }
        });
        setAvatarUrl(result.avatarUrl);
      } else {
        message.error(result.message || '头像上传失败');
      }
    } catch (error) {
      message.error('头像上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理昵称更新
  const handleNicknameUpdate = async (values: UpdateNicknameFormValues) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: values.nickname
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success('昵称更新成功');
        setIsUpdateNicknameModalVisible(false);
        // 更新会话中的昵称信息
        await update({
          ...session,
          user: {
            ...session?.user,
            name: values.nickname
          }
        });
      } else {
        message.error(result.message || '昵称更新失败');
      }
    } catch (error) {
      message.error('昵称更新过程中发生错误');
    }
  };

  // 处理密码更新
  const handlePasswordUpdate = async (values: UpdatePasswordFormValues) => {
    if (values.newPassword !== values.confirmNewPassword) {
      message.error('新密码与确认密码不一致');
      return;
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success('密码更新成功');
        setIsUpdatePasswordModalVisible(false);
        updatePasswordForm.resetFields();
      } else {
        message.error(result.message || '密码更新失败');
      }
    } catch (error) {
      message.error('密码更新过程中发生错误');
    }
  };

  const beforeAvatarUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  return (
    <div>
      <UserNavbar />
      <div style={{ 
        padding: "40px 20px", 
        maxWidth: "800px", 
        margin: "0 auto", 
        marginTop: 64 
      }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
            用户设置
          </Title>
          
          <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* 头像设置 */}
              <div>
                <Title level={4}>头像设置</Title>
                <Space align="start">
                  <Avatar 
                    size={64} 
                    src={avatarUrl || undefined} 
                    icon={!avatarUrl ? <UserOutlined /> : undefined} 
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <Upload
                      name="avatar"
                      showUploadList={false}
                      beforeUpload={beforeAvatarUpload}
                      customRequest={({ file, onSuccess }) => {
                        handleAvatarUpload(file as File);
                        onSuccess?.({}, file as File);
                      }}
                      disabled={isUploading}
                    >
                      <Button icon={<UploadOutlined />} loading={isUploading}>
                        {isUploading ? '上传中...' : '更换头像'}
                      </Button>
                    </Upload>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                      支持 JPG/PNG 格式，大小不超过 2MB
                    </Text>
                  </div>
                </Space>
              </div>
              
              {/* 昵称设置 */}
              <div>
                <Title level={4}>昵称设置</Title>
                <Space>
                  <Text strong>当前昵称: </Text>
                  <Text>{session?.user?.name || '未设置'}</Text>
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={handleUpdateNickname}
                  >
                    修改昵称
                  </Button>
                </Space>
              </div>
              
              {/* 密码设置 */}
              <div>
                <Title level={4}>密码设置</Title>
                <Button 
                  icon={<LockOutlined />} 
                  onClick={handleUpdatePassword}
                >
                  修改密码
                </Button>
              </div>

              {/* 背景设置 */}
              <div>
                <Title level={4}>背景设置</Title>
                <Space direction="vertical">
                  <Text type="secondary">
                    自定义个人背景图片，让应用更具个性化
                  </Text>
                  <Button 
                    icon={<BgColorsOutlined />} 
                    onClick={() => router.push('/settings/background')}
                  >
                    背景设置
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </Space>
      </div>

      {/* 修改昵称模态框 */}
      <Modal
        title="修改昵称"
        open={isUpdateNicknameModalVisible}
        onCancel={() => setIsUpdateNicknameModalVisible(false)}
        footer={null}
      >
        <Form
          form={updateNicknameForm}
          onFinish={handleNicknameUpdate}
          layout="vertical"
        >
          <Form.Item
            name="nickname"
            label="新昵称"
            rules={[
              { required: true, message: '请输入新昵称' },
              { min: 2, message: '昵称至少2个字符' },
              { max: 20, message: '昵称最多20个字符' }
            ]}
          >
            <Input placeholder="请输入新昵称" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认修改
              </Button>
              <Button onClick={() => setIsUpdateNicknameModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={isUpdatePasswordModalVisible}
        onCancel={() => setIsUpdatePasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={updatePasswordForm}
          onFinish={handlePasswordUpdate}
          layout="vertical"
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6个字符' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码需包含大小写字母和数字' }
            ]}
          >
            <Input.Password placeholder="请输入新密码（至少6位，包含大小写字母和数字）" />
          </Form.Item>
          
          <Form.Item
            name="confirmNewPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确认修改
              </Button>
              <Button onClick={() => setIsUpdatePasswordModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}