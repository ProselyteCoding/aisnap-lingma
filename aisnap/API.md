# AISnap API 文档

## 概述

本文档描述了 AISnap 应用程序提供的所有 API 接口。AISnap 是一个智能文档格式转换平台，支持将 Markdown 文本和图像内容转换为多种标准格式文档或文本。

## 基础 URL

所有 API 请求的基础 URL 为: `/api`

## 认证

大部分用户相关 API 需要身份验证。认证通过 NextAuth.js 实现，使用基于凭据的认证方式（邮箱/密码）。

## API 接口列表

### 1. 认证相关接口

#### 1.1 用户登录
- **URL**: `/api/auth/[...nextauth]`
- **方法**: POST
- **描述**: 用户登录认证
- **参数**:
  - `authenticator` (string, 必填): 用户邮箱或用户
  - `password` (string, 必填): 用户密码
- **响应**:
  - 成功: 返回认证 session 信息
  - 失败: 返回错误信息

#### 1.2 用户注册
- **URL**: `/api/auth/register`
- **方法**: POST
- **描述**: 新用户注册
- **参数**:
  - `username` (string, 必填): 用户名
  - `email` (string, 必填): 用户邮箱
  - `password` (string, 必填): 用户密码
- **响应**:
  - `success` (boolean): 操作是否成功
  - `message` (string): 操作结果消息

### 2. 文档转换接口

#### 2.1 文本转换
- **URL**: `/api/convert/text`
- **方法**: POST
- **描述**: 将文本内容转换为指定格式
- **参数**:
  - `input` (string, 必填): 输入的文本内容
  - `inputType` (string, 必填): 输入格式 ('markdown', 'html', 'latex')
  - `outputType` (string, 必填): 输出格式 ('docx', 'html', 'latex', 'pdf', 'plain', 'image')
  - `outputFormat` (string, 可选): 图片输出的中间格式
  - `imageSettings` (object, 可选): 图片输出的设置
- **响应**:
  - `success` (boolean): 转换是否成功
  - `message` (string): 转换结果消息
  - `data` (object): 转换结果数据
    - `result` (string): 转换后的文本内容（适用于纯文本输出）
    - `outputFile` (string): 输出文件路径（适用于文件输出）

#### 2.2 图像转换
- **URL**: `/api/convert/image`
- **方法**: POST
- **描述**: 将图像文件转换为 Markdown 文本
- **参数**:
  - `imageUrl` (string, 必填): 图像文件的 URL
- **响应**:
  - `success` (boolean): 转换是否成功
  - `message` (string): 转换结果消息
  - `data` (object): 转换结果数据
    - `result` (string): 转换后的 Markdown 文本

#### 2.3 文件上传
- **URL**: `/api/upload`
- **方法**: POST
- **描述**: 上传文件
- **参数**:
  - `file` (file, 必填): 要上传的文件
- **响应**:
  - `success` (boolean): 上传是否成功
  - `message` (string): 上传结果消息
  - `data` (object): 上传结果数据
    - `url` (string): 文件访问 URL

### 3. 用户相关接口

#### 3.1 获取用户信息
- **URL**: `/api/user`
- **方法**: GET
- **描述**: 获取当前用户信息（部分信息，仅用于显示）
- **响应**:
  - `success` (boolean): 操作是否成功
  - `data` (object): 用户信息数据
    - `nickname` (string): 用户昵称
    - `avatar` (string): 用户头像 URL
    - `background` (string): 用户背景 URL

#### 3.2 修改用户设置
- **URL**: `/api/user/settings`
- **方法**: PUT
- **描述**: 修改当前用户设置（只可修改昵称和密码，其余属性不可修改）
- **参数**:
  - `type` (string, 必填, 可选择nickname/password): 修改的属性名
  - `value` (string, 必填): 修改的值
- **响应**:
  - `success` (boolean): 操作是否成功

#### 3.3 修改用户头像
- **URL**: `/api/user/settings/avatar`
- **方法**: PUT
- **描述**: 修改当前用户头像
- **参数**:
  - `avatar` (file, 必填): 上传的头像文件
- **响应**:
  - `success` (boolean): 操作是否成功

#### 3.4 获取转换历史
- **URL**: `/api/user/history`
- **方法**: GET
- **描述**: 获取当前用户的转换历史记录
- **响应**:
  - `success` (boolean): 操作是否成功
  - `data` (array): 转换历史记录列表
    - `id` (string): 记录 ID
    - `inputType` (string): 输入类型
    - `outputType` (string): 输出类型

#### 3.5 删除转换记录
- **URL**: `/api/user/history/[id]`
- **方法**: DELETE
- **描述**: 删除指定的转换记录
- **参数**:
  - `id` (string, 路径参数): 要删除的记录 ID
- **响应**:
  - `success` (boolean): 操作是否成功
  - `message` (string): 操作结果消息

#### 3.6 添加历史记录

- **URL**: `/api/user/history`
- **方法**: POST
- **描述**: 添加一条新的转换记录
- **参数**:
  - inputType (string, 必填): 输入类型
  - outputType (string, 必填): 输出类型
  - input (string, 可选): 输入内容
  - output (string, 可选): 输出内容
  - inputFile (string, 可选): 输入文件路径
  - outputFile (string, 可选): 输出文件路径
- **响应**:
  - `success` (boolean): 操作是否成功

#### 3.7 修改用户背景

- **URL**: `/api/user/settings/background`
- **方法**: PUT
- **描述**: 修改当前用户背景设置
- **参数**:
  - `background` (file, 必填): 背景图片文件
- **响应**:
  - `success` (boolean): 操作是否成功

## 错误响应格式

所有 API 在出错时都会返回以下格式的 JSON 响应:

```json
{
  "success": false,
  "message": "错误描述信息"
}
```

## 状态码

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 禁止访问
- `404`: 资源未找到
- `500`: 服务器内部错误
- `503`: 服务不可用
