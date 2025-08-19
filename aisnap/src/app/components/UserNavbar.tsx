"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Avatar, 
  Button, 
  Form, 
  Input, 
  Space,
  Typography,
  Modal,
  Menu,
  Upload,
  App
} from 'antd';
import { 
  UserOutlined, 
  LoginOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HistoryOutlined,
  UploadOutlined,
  LockOutlined,
  EditOutlined,
  BgColorsOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

const { Text, Title } = Typography;

// 定义登录表单类型
interface LoginFormValues {
  authenticator: string;
  password: string;
}

// 定义注册表单类型
interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  nickname: string;
}

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

// 定义用户信息类型
interface UserInfo {
  nickname: string;
  avatar?: string;
  background?: string;
}

// 定义UserNavbar组件的props类型
interface UserNavbarProps {
  pageName?: string;
}

const UserNavbar: React.FC<UserNavbarProps> = ({ pageName }) => {
  const { data: session, status, update } = useSession();
  const { message } = App.useApp();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isUpdateAvatarModalVisible, setIsUpdateAvatarModalVisible] = useState(false);
  const [isUpdateNicknameModalVisible, setIsUpdateNicknameModalVisible] = useState(false);
  const [isUpdatePasswordModalVisible, setIsUpdatePasswordModalVisible] = useState(false);
  const [isUpdateBackgroundModalVisible, setIsUpdateBackgroundModalVisible] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [updateNicknameForm] = Form.useForm();
  const [updatePasswordForm] = Form.useForm();
  
  // 添加用户信息状态
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nickname: '',
    avatar: undefined,
    background: undefined
  });
  
  // 添加预览图片状态
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  // 添加背景相关状态
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [previewBackground, setPreviewBackground] = useState<string | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 获取用户信息的函数
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.success) {
        setUserInfo({
          nickname: data.data.nickname || '',
          avatar: (data.data.avatar && data.data.avatar.trim()) ? data.data.avatar : undefined,
          background: (data.data.background && data.data.background.trim()) ? data.data.background : undefined
        });
        setCurrentBackground(data.data.background || null);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }, []);

  // 处理文件预览
  const handlePreview = (file: { url?: string; preview?: string; originFileObj?: File }) => {
    if (!file.url && !file.preview && file.originFileObj) {
      try {
        const previewUrl = URL.createObjectURL(file.originFileObj);
        setPreviewImage(previewUrl);
      } catch (error) {
        console.error('创建预览URL失败:', error);
      }
    } else {
      setPreviewImage(file.url || file.preview || null);
    }
    // 不在选择文件时自动打开预览模态框
  };

  // 调试previewImage状态变化
  useEffect(() => {
    console.log('previewImage状态变化:', previewImage);
  }, [previewImage]);

  // 在会话状态改变时获取用户信息
  useEffect(() => {
    if (session?.user) {
      // 设置初始昵称
      setUserInfo(prev => ({
        ...prev,
        nickname: session.user?.name || ''
      }));
      // 获取完整的用户信息（包括正确的头像路径）
      fetchUserInfo();
    } else {
      // 清空用户信息
      setUserInfo({
        nickname: '',
        avatar: undefined,
        background: undefined
      });
    }
  }, [session, fetchUserInfo]);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const result = await signIn('credentials', {
        authenticator: values.authenticator,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error(result.error);
      } else {
        message.success('登录成功');
        setIsLoginModalVisible(false);
        loginForm.resetFields();
      }
    } catch (_error) {
      message.error('登录过程中发生错误');
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      // 调用注册API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: values.nickname.trim(),  // 添加昵称字段
          username: values.username.trim(),  // 去除首尾空格
          email: values.email.trim().toLowerCase(),  // 标准化邮箱格式
          password: values.password,
          // 可以添加额外字段如 confirmPassword 等
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        setIsRegisterModalVisible(false);
        registerForm.resetFields();
      } else {
        message.error(result.message);
      }
    } catch (_error) {
      message.error('注册过程中发生错误，请稍后重试');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      message.success('已退出登录');
    } catch (_error) {
      message.error('退出登录时发生错误');
    }
  };

  // 修改头像功能
  const handleUpdateAvatar = () => {
    setIsSettingsModalVisible(false);
    setIsUpdateAvatarModalVisible(true);
  };

  // 修改昵称功能
  const handleUpdateNickname = () => {
    setIsSettingsModalVisible(false);
    // 设置表单默认值
    updateNicknameForm.setFieldsValue({
      nickname: session?.user?.name || ''
    });
    setIsUpdateNicknameModalVisible(true);
  };

  // 修改密码功能
  const handleUpdatePassword = () => {
    setIsSettingsModalVisible(false);
    setIsUpdatePasswordModalVisible(true);
  };

  // 处理头像上传
  const handleAvatarUpload = async (values: { avatar?: { originFileObj: File }[] }) => {
    try {
      const formData = new FormData();
      // 修复访问文件对象的方式
      let file = null;
      
      if (values.avatar && values.avatar.length > 0) {
        // 尝试多种方式获取文件对象
        const avatarItem = values.avatar[0];
        if (avatarItem.originFileObj) {
          file = avatarItem.originFileObj;
        } else if (avatarItem instanceof File) {
          file = avatarItem;
        }
      }
      
      if (!file) {
        message.error('请选择要上传的头像文件');
        return;
      }
      
      formData.append('avatar', file);

      // 调用更新头像API
      const response = await fetch('/api/user/settings/avatar', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        setIsUpdateAvatarModalVisible(false);
        setPreviewImage(null); // 清除预览图片
        // 更新session和获取最新用户信息
        await update();
        await fetchUserInfo(); // 获取最新的用户信息
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('头像更新失败:', error);
      message.error('头像更新失败');
    }
  };

  // 处理昵称更新
  const handleNicknameUpdate = async (values: UpdateNicknameFormValues) => {
    try {
      // 调用更新昵称API
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nickname',
          value: values.nickname
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        setIsUpdateNicknameModalVisible(false);
        // 更新session和获取最新用户信息
        await update();
        await fetchUserInfo(); // 获取最新的用户信息
      } else {
        message.error(result.message);
      }
    } catch (_error) {
      message.error('昵称更新失败');
    }
  };

  // 处理密码更新
  const handlePasswordUpdate = async (values: UpdatePasswordFormValues) => {
    try {
      // 调用更新密码API
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'password',
          value: values.newPassword,
          oldValue: values.oldPassword
        }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message);
        setIsUpdatePasswordModalVisible(false);
      } else {
        message.error(result.message);
      }
    } catch (_error) {
      message.error('密码更新失败');
    }
  };

  // 处理背景设置跳转
  const handleBackgroundSettings = () => {
    setIsUpdateBackgroundModalVisible(true);
  };

  // 处理背景上传
  const handleBackgroundUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('background', file);

    try {
      setUploadingBackground(true);
      const response = await fetch('/api/user/settings/background', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('背景上传成功！');
        setCurrentBackground(result.data?.background || null);
        setPreviewBackground(null);
        setSelectedFile(null);
        setIsUpdateBackgroundModalVisible(false);
        // 重新获取用户信息以更新背景
        await fetchUserInfo();
        // 刷新页面以更新背景显示
        window.location.reload();
      } else {
        message.error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('上传失败，请重试');
    } finally {
      setUploadingBackground(false);
    }
  };

  // 处理背景重置
  const handleBackgroundReset = async () => {
    try {
      setUploadingBackground(true);
      const response = await fetch('/api/user/settings/background', {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        message.success('背景已重置！');
        setCurrentBackground(null);
        setPreviewBackground(null);
        setSelectedFile(null);
        setIsUpdateBackgroundModalVisible(false);
        // 重新获取用户信息
        await fetchUserInfo();
        // 刷新页面以更新背景显示
        window.location.reload();
      } else {
        message.error(result.message || '重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      message.error('重置失败，请重试');
    } finally {
      setUploadingBackground(false);
    }
  };

  // 处理背景预览
  const handleBackgroundPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewBackground(e.target?.result as string);
      setSelectedFile(file); // 存储文件引用
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      height: 64, 
      backgroundColor: 'rgba(242, 244, 247, 0.95)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(200, 205, 212, 0.6)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px'
    }}>
      {/* 左侧项目名 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Image 
            src="/logo.svg" 
            alt="AISnap Logo" 
            width={32} 
            height={32} 
            style={{ marginRight: '12px' }}
          />
          <Text style={{ 
            fontSize: '26px', 
            fontWeight: 700, 
            color: '#1890ff', 
            margin: 0,
            fontFamily: '"Helvetica Neue", "Arial", "Segoe UI", "Roboto", sans-serif',
            letterSpacing: '1px',
            textShadow: '0 2px 4px rgba(24, 144, 255, 0.3)'
          }}>
            AISnap
          </Text>
        </Link>
        {pageName && (
          <>
            <div style={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: '#d9d9d9', 
              margin: '0 42px 0 42px' 
            }} />
            <Text style={{ 
              color: '#595959', 
              fontSize: '16px', 
              fontWeight: 500,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}>
              {pageName}
            </Text>
          </>
        )}
      </div>

      {/* 右侧用户信息 */}
      <div>
        {status === 'loading' ? (
          <Avatar icon={<UserOutlined />} />
        ) : session?.user ? (
          <Space size="middle">
            <Avatar 
              src={userInfo.avatar?.trim() ? userInfo.avatar : undefined} 
              icon={!userInfo.avatar?.trim() ? <UserOutlined /> : undefined} 
              onError={() => {
                // 头像加载失败时，清除错误的头像路径
                setUserInfo(prev => ({ ...prev, avatar: undefined }));
                return false;
              }}
              style={{ 
                width: 40, 
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <Text strong>{userInfo.nickname || '用户'}</Text>
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              onClick={() => setIsSettingsModalVisible(true)}
            />
          </Space>
        ) : (
          <Space>
            <Text type="secondary">立即注册/登录</Text>
            <Button 
              type="primary" 
              icon={<LoginOutlined />} 
              onClick={() => setIsLoginModalVisible(true)}
            >
              登录
            </Button>
          </Space>
        )}
      </div>

      {/* 登录模态框 */}
      <Modal
        title="用户登录"
        open={isLoginModalVisible}
        onCancel={() => setIsLoginModalVisible(false)}
        footer={null}
      >
        <Form
          form={loginForm}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="authenticator"
            label="邮箱或用户名"
            rules={[{ required: true, message: '请输入邮箱或用户名' }]}
            tooltip="可以使用注册时填写的邮箱或用户名进行登录"
          >
            <Input placeholder="请输入邮箱或用户名" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
            tooltip="请输入您的登录密码"
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                登录
              </Button>
              <Button onClick={() => {
                setIsLoginModalVisible(false);
                setIsRegisterModalVisible(true);
              }}>
                注册账号
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 注册模态框 */}
      <Modal
        title="用户注册"
        open={isRegisterModalVisible}
        onCancel={() => setIsRegisterModalVisible(false)}
        footer={null}
      >
        <Form
          form={registerForm}
          onFinish={handleRegister}
          layout="vertical"
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, message: '昵称至少2个字符' },
              { max: 20, message: '昵称最多20个字符' }
            ]}
            tooltip="将在网站上显示的昵称，2-20个字符"
          >
            <Input placeholder="请输入昵称（2-20个字符）" />
          </Form.Item>
          
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名最多20个字符' },
              { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
            ]}
            tooltip="用户名将作为登录凭证之一，3-20个字符，支持字母、数字、下划线和中文"
          >
            <Input placeholder="请输入用户名（3-20个字符）" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
            tooltip="用于接收系统通知和找回密码"
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码需包含大小写字母和数字' }
            ]}
            tooltip="密码需至少6位，包含大小写字母和数字，以确保账户安全"
          >
            <Input.Password placeholder="请输入密码（至少6位，包含大小写字母和数字）" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                注册
              </Button>
              <Button onClick={() => {
                setIsRegisterModalVisible(false);
                setIsLoginModalVisible(true);
              }}>
                已有账号？登录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 设置模态框 */}
      <Modal
        title="用户设置"
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
      >
        <Menu 
          mode="inline" 
          style={{ border: 'none' }}
          items={[
            {
              key: 'avatar',
              icon: <UserOutlined />,
              label: '修改头像',
              onClick: handleUpdateAvatar
            },
            {
              key: 'nickname',
              icon: <EditOutlined />,
              label: '修改昵称',
              onClick: handleUpdateNickname
            },
            {
              key: 'password',
              icon: <LockOutlined />,
              label: '修改密码',
              onClick: handleUpdatePassword
            },
            {
              key: 'background',
              icon: <BgColorsOutlined />,
              label: '背景设置',
              onClick: handleBackgroundSettings
            },
            {
              type: 'divider'
            },
            {
              key: 'history',
              icon: <HistoryOutlined />,
              label: <Link href="/history" onClick={() => setIsSettingsModalVisible(false)}>转换历史</Link>
            },
            {
              type: 'divider'
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录',
              onClick: handleLogout
            }
          ]}
        />
      </Modal>

      {/* 修改头像模态框 */}
      <Modal
        title="修改头像"
        open={isUpdateAvatarModalVisible}
        onCancel={() => {
          setIsUpdateAvatarModalVisible(false);
          setPreviewImage(null);
        }}
        footer={null}
      >
        <Form
          onFinish={handleAvatarUpload}
          layout="vertical"
        >
          <Form.Item
            name="avatar"
            label="选择头像"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                // 处理文件选择并生成预览
                if (e.length > 0) {
                  handlePreview(e[0]);
                } else {
                  setPreviewImage(null);
                }
                return e;
              }
              // 处理单个文件对象的情况
              if (e && e.fileList && Array.isArray(e.fileList)) {
                if (e.fileList.length > 0) {
                  handlePreview(e.fileList[0]);
                } else {
                  setPreviewImage(null);
                }
                return e.fileList;
              }
              return [];
            }}
            rules={[{ required: true, message: '请选择头像文件' }]}
          >
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={() => false}
              maxCount={1}
              style={{ 
                width: 120,
                height: 120,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              accept="image/*"
              disabled={!!previewImage} // 有预览图片时禁用上传功能
            >
              {previewImage ? (
                <div 
                  style={{ 
                    width: '120px', 
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    cursor: 'zoom-in',
                    position: 'relative'
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止触发上传
                    setPreviewVisible(true);
                  }}
                >
                  <Image 
                    src={previewImage} 
                    alt="预览" 
                    width={200}
                    height={200}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }} 
                  />
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <UploadOutlined style={{ fontSize: '24px' }} />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新头像
              </Button>
              <Button 
                htmlType="button" 
                onClick={() => {
                  setPreviewImage(null);
                }}
              >
                重新选择
              </Button>
              <Button onClick={() => setIsUpdateAvatarModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

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
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入新的昵称" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新昵称
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
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
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
                更新密码
              </Button>
              <Button onClick={() => setIsUpdatePasswordModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 背景设置模态框 */}
      <Modal
        title="背景设置"
        open={isUpdateBackgroundModalVisible}
        onCancel={() => {
          setIsUpdateBackgroundModalVisible(false);
          setPreviewBackground(null);
          setSelectedFile(null);
        }}
        footer={null}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          {/* 当前背景 */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>当前背景</Title>
            {currentBackground ? (
              <div style={{ marginBottom: 16 }}>
                <div 
                  style={{
                    width: '100%',
                    height: 200,
                    backgroundImage: `url(${currentBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }}
                />
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleBackgroundReset}
                  loading={uploadingBackground}
                  style={{ marginTop: 8 }}
                >
                  重置背景
                </Button>
              </div>
            ) : (
              <div style={{ 
                height: 200, 
                border: '1px dashed #d9d9d9', 
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                marginBottom: 16
              }}>
                当前未设置背景
              </div>
            )}
          </div>

          {/* 上传新背景或预览 */}
          <div>
            <Title level={5}>
              {previewBackground ? '预览新背景' : '上传新背景'}
            </Title>
            
            {!previewBackground ? (
              /* 上传区域 */
              <Upload.Dragger
                name="background"
                multiple={false}
                accept=".jpg,.jpeg,.png,.gif"
                beforeUpload={(file: File) => {
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

                  // 预览并存储文件引用
                  handleBackgroundPreview(file);
                  return false; // 阻止自动上传
                }}
                fileList={[]} // 清空文件列表
                style={{ marginBottom: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                <p className="ant-upload-hint">
                  支持 JPG、PNG、GIF 格式，文件大小不超过 5MB
                  <br />
                  建议尺寸：1920x1080 或更高
                </p>
              </Upload.Dragger>
            ) : (
              /* 预览区域 */
              <div>
                <div 
                  style={{
                    width: '100%',
                    height: 250,
                    backgroundImage: `url(${previewBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: 8,
                    border: '2px solid #1890ff',
                    marginBottom: 16,
                    position: 'relative'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    预览效果 (30% 透明度)
                  </div>
                </div>
                
                <Space style={{ width: '100%', justifyContent: 'center' }}>
                  <Button 
                    type="primary" 
                    loading={uploadingBackground}
                    onClick={() => {
                      // 使用存储的文件引用
                      if (selectedFile) {
                        handleBackgroundUpload(selectedFile);
                      }
                    }}
                    size="large"
                  >
                    {uploadingBackground ? '上传中...' : '确认设为背景'}
                  </Button>
                  <Button 
                    onClick={() => {
                      setPreviewBackground(null);
                      setSelectedFile(null);
                    }}
                    size="large"
                  >
                    重新选择
                  </Button>
                </Space>
              </div>
            )}

            {/* 使用说明 */}
            <div style={{ 
              marginTop: 24, 
              padding: 16, 
              background: '#f6f6f6', 
              borderRadius: 8,
              fontSize: 12,
              color: '#666'
            }}>
              <p style={{ margin: 0, marginBottom: 8 }}><strong>使用说明：</strong></p>
              <p style={{ margin: 0 }}>• 背景图片会以30%透明度显示在整个应用底层</p>
              <p style={{ margin: 0 }}>• 推荐上传高分辨率图片以获得最佳显示效果</p>
              <p style={{ margin: 0 }}>• 可以随时重置背景或重新选择图片</p>
            </div>
          </div>
        </div>
      </Modal>
      
      {/* 图片预览模态框 */}
      {previewVisible && previewImage && (
        <Modal
          open={previewVisible}
          title="头像预览"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          style={{ maxWidth: '80%' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 200,
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto'
            }}>
              <Image 
                alt="预览头像" 
                width={200}
                height={200}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }} 
                src={previewImage} 
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                onClick={() => setPreviewVisible(false)}
              >
                确认
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserNavbar;