# AISnap API 文档

本文档详细描述了 AISnap 应用的前后端交互逻辑、API 接口规范以及数据库设计。

## 1. 系统架构概述

AISnap 是一个基于 Next.js 构建的全栈应用，采用 App Router 架构。前端使用 React 和 Ant Design 构建用户界面，后端通过 Next.js API 路由处理业务逻辑。

### 1.1 技术栈
- 前端: Next.js 15, React 19, TypeScript, Ant Design
- 后端: Next.js API Routes (Node.js Runtime)
- 数据处理: Pandoc, html2canvas
- AI服务: 阿里云 DashScope (Qwen 系列模型)
- 状态管理: Zustand

### 1.2 系统模块
1. 文本转换模块
2. 图片转换模块
3. 模板管理模块
4. 文件处理模块

## 2. API 接口规范

### 2.1 文本转换接口

#### 接口地址
```
POST /api/convert/text
```

#### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| input | string | 是 | 输入的文本内容 |
| inputType | string | 是 | 输入格式，可选值: markdown, html, latex |
| outputType | string | 是 | 输出格式，可选值: docx, html, latex, pdf, plain, image |
| template | object | 否 | 模板配置对象 |

#### 响应格式
```json
{
  "success": true,
  "message": "转换成功",
  "data": {
    "outputFile": "/downloads/filename.ext",
    "result": "转换后的文本内容"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误描述"
}
```

### 2.2 图片转换接口

#### 接口地址
```
POST /api/convert/image
```

#### 请求参数 (multipart/form-data)
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| image | file | 是 | 上传的图片文件 |
| format | string | 否 | 输出格式，可选值: markdown, docx，默认为 markdown |

#### 响应格式
```json
{
  "success": true,
  "message": "转换成功",
  "data": {
    "content": "识别出的文本内容",
    "outputFile": "/downloads/filename.ext",
    "format": "输出格式",
    "filename": "文件名",
    "note": "提示信息（可选）"
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误描述"
}
```

## 3. 前后端交互逻辑

### 3.1 文本转换流程

1. 用户在前端界面输入文本内容并选择输入/输出格式
2. 前端将文本内容和格式参数发送到 `/api/convert/text` 接口
3. 后端 API 接收请求参数
4. 根据输出格式类型进行处理：
   - 如果是 image 格式，直接返回输入内容用于预览
   - 如果是 docx/html/latex/pdf 格式，使用 Pandoc 进行转换并生成文件
   - 如果是 plain 格式，使用 Pandoc 进行文本转换
5. 返回转换结果给前端
6. 前端根据结果类型显示下载链接或文本内容

### 3.2 图片转换流程

1. 用户在前端界面上传图片文件并选择输出格式
2. 前端将图片文件和格式参数发送到 `/api/convert/image` 接口
3. 后端 API 接收请求参数并保存上传的文件
4. 读取图片文件并转换为 base64 格式
5. 调用阿里云 DashScope 的 Qwen 视觉模型识别图片内容
6. 如果视觉模型调用失败，使用文本模型提供降级方案
7. 如果输出格式为 docx，使用 Pandoc 将识别结果转换为 docx 文件
8. 清理临时文件
9. 返回识别结果和文件信息给前端
10. 前端根据结果类型显示内容或下载链接

### 3.3 预览与图片保存流程

1. 用户点击预览按钮
2. 前端将当前内容显示在预览区域
3. 用户点击"保存为图片"按钮
4. 前端使用 html2canvas 库将预览区域转换为图片
5. 将图片数据保存到本地

## 4. 数据库设计

目前项目使用 Prisma ORM 进行数据库操作，但尚未实现完整的数据库功能。以下是计划中的数据库表结构：

### 4.1 用户表 (User)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键 |
| email | string | 用户邮箱 |
| name | string | 用户名 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.2 模板表 (Template)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键 |
| name | string | 模板名称 |
| description | string | 模板描述 |
| content | text | 模板内容 |
| tags | string[] | 标签数组 |
| userId | string | 关联用户ID |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.3 转换记录表 (Conversion)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 主键 |
| input | text | 输入内容 |
| inputType | string | 输入类型 |
| outputType | string | 输出类型 |
| result | text | 转换结果 |
| userId | string | 关联用户ID |
| createdAt | datetime | 创建时间 |

## 5. 状态管理

使用 Zustand 进行全局状态管理，主要包括：

### 5.1 模板配置状态
```typescript
interface TemplateConfig {
  font: string;
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  style: 'simple' | 'classic' | 'modern' | 'academic';
  watermark: 'none' | 'text' | 'logo';
  aiLogo: 'none' | 'tongyi' | 'wenxin' | 'spark';
}
```

## 6. 错误处理

### 6.1 前端错误处理
- 网络请求错误提示
- 表单验证错误提示
- 文件上传错误处理
- 转换过程错误提示

### 6.2 后端错误处理
- 参数验证错误
- 文件处理错误
- AI服务调用错误
- Pandoc转换错误
- 数据库操作错误

## 7. 安全考虑

### 7.1 数据安全
- 文件上传类型验证
- 文件大小限制
- 敏感信息（如API密钥）通过环境变量管理

### 7.2 访问控制
- API接口访问频率限制（计划中）
- 用户身份验证（计划中）

## 8. 性能优化

### 8.1 前端优化
- 组件懒加载
- 图片懒加载
- 代码分割

### 8.2 后端优化
- 文件缓存机制
- 数据库查询优化
- Pandoc进程复用（计划中）

## 9. 部署考虑

### 9.1 环境要求
- Node.js >= 18
- Pandoc >= 2.0
- 支持 Node.js 运行时的服务器环境

### 9.2 环境变量
```env
API_KEY=阿里云DashScope API密钥
DATABASE_URL=数据库连接URL
NEXTAUTH_SECRET=认证密钥
NEXTAUTH_URL=应用URL
```