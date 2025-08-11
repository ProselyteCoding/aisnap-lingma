# AISnap 项目开发提示词指南

## 项目背景

**项目名称**：AISnap  
**灵感来源**：VSCode 的 CodeSnap 插件  

### 核心问题解决
1. **格式问题**：AI 生成的 Markdown 内容粘贴到 Word/TXT 时格式错乱或出现乱码
2. **截图问题**：AI 生成内容过长/过短时截图不便，样式不美观
3. **效率问题**：手动框选复制 AI 内容到其他软件操作繁琐

### 功能特性
- 🎯 **核心功能**：将 AI 生成的 Markdown 文本转换为美观的图片或标准格式文本
- 📱 **多端适配**：移动端和 PC 端均适配
- 🖼️ **导入方式**：支持 Markdown 文本导入和屏幕截图导入
- 📋 **输出格式**：生成标准格式图片或可直接复制到 Word 的文本
- ⚡ **效率工具**：悬浮球快捷操作，自动获取页面 AI 对话内容
- 🔄 **一键转换**：快速转换为文本/图片格式

### 目标用户
- AI 工具重度使用者
- 需要整理 AI 对话内容的用户
- 追求高效工作流的专业人士

---

## 开发提示词框架

### 阶段一：项目初始化（使用 create-next-app）

```
使用 create-next-app 创建 AISnap 项目，并配置完整的技术栈，具体要求：

项目创建步骤：
1. 使用 create-next-app 创建基础项目：
   npx create-next-app@latest aisnap --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

2. 移除 Tailwind CSS，配置 SCSS：
   npm uninstall tailwindcss postcss autoprefixer
   npm install sass

技术栈配置：
- 前端：Next.js 14 + TypeScript + SCSS
- 组件库：Ant Design (antd)
- 状态管理：
  - 客户端状态：Zustand（用户设置、UI 状态、模板配置）
  - 服务端状态：SWR（API 数据缓存、模板列表、转换历史）
  - 本地存储：localStorage + Zustand persist
- 后端：Next.js API Routes
- 数据库：MySQL + Prisma ORM
- 文档转换：node-pandoc（Pandoc 的 Node.js 包装器）
- 图像处理：html2canvas
- AI 服务：通义千问 API（用于截图文字识别和转换）
- 部署：Vercel

依赖包安装：
```bash
# 核心依赖
npm install antd @ant-design/icons
npm install prisma @prisma/client mysql2
npm install html2canvas @types/html2canvas
npm install axios
npm install node-pandoc @types/node-pandoc

# 状态管理依赖
npm install zustand
npm install swr

# 开发依赖
npm install -D @types/node
npx prisma init
```

环境要求：
1. 必须先安装系统级 Pandoc：
   - Windows: 从 https://pandoc.org/installing.html 下载安装包
   - macOS: brew install pandoc
   - Linux: apt-get install pandoc 或 yum install pandoc
2. node-pandoc 作为 Node.js 包装器调用系统 Pandoc
3. 确保 pandoc 命令在系统 PATH 中可用
4. 配置 node-pandoc 找到 Pandoc 可执行文件路径

项目结构调整：
1. 删除 Tailwind CSS 相关配置
2. 配置 SCSS 支持
3. 集成 Ant Design 组件库和主题
4. 配置 Prisma + MySQL 数据库连接
5. 配置 Pandoc 服务端转换功能
6. 设置基础的页面路由：app/page.tsx（首页）、app/convert/page.tsx（转换页面）、app/about/page.tsx（关于页面）
7. 创建 src/components 文件夹，包含通用组件
8. 创建 src/lib 文件夹存放工具函数和 API 配置
9. 配置 html2canvas 图像生成功能
10. 配置通义千问 API 接口
11. 配置响应式布局，支持移动端和桌面端

必要的配置文件：
- next.config.js（SCSS 和 Ant Design 配置）
- src/styles/globals.scss（全局样式）
- src/lib/antd-registry.tsx（Ant Design SSR 配置）
- prisma/schema.prisma（数据库模型）
- .env.local（环境变量）

环境要求：
- Node.js 18+ 
- 安装 Pandoc 命令行工具
- MySQL 数据库服务
- 配置 Pandoc 可执行文件路径
- 支持多种文档格式转换（markdown, docx, html, pdf 等）

请提供完整的项目创建步骤、配置文件更新、数据库 schema 设计和环境变量配置，包括如何正确移除 Tailwind CSS 并集成 SCSS + Ant Design。
```

### 阶段二：核心组件开发

#### 2.1 主布局和导航组件
```
创建 AISnap 应用的主布局组件，要求：

功能要求：
1. 响应式导航栏，包含 Logo、菜单项（首页、转换工具、关于）
2. 移动端汉堡菜单，使用 Ant Design 的 Drawer 组件
3. 现代化设计风格，使用 SCSS 模块化样式
4. 支持 Ant Design 的主题切换（亮色/暗色）
5. 页脚包含版权信息和链接

设计风格：
- 简洁现代，符合 Ant Design 设计语言
- 主色调使用蓝色系（#1890ff）
- 卡片式设计，使用 Ant Design Card 组件
- 微妙的阴影和圆角，遵循 Ant Design 规范

技术实现：
- 使用 Ant Design 的 Layout、Menu、Button、Drawer 等组件
- SCSS 模块化样式管理
- TypeScript 类型定义
- 响应式设计适配

请提供完整的 Layout、Header、Footer 组件代码，包含 TypeScript 类型定义和 SCSS 样式文件。
```

#### 2.2 核心转换功能组件（集成 Pandoc）
```
创建 AISnap 的核心功能组件 - 基于 Pandoc 的文档转换器，要求：

核心功能：
1. Markdown 文本输入区域（使用 Ant Design Input.TextArea）
2. 截图上传功能（使用 Ant Design Upload 组件，支持拖拽）
3. 通义千问 API 集成，实现截图文字识别和转换
4. Pandoc 多格式转换支持：
   - Markdown → HTML
   - Markdown → Word (.docx)
   - Markdown → PDF
   - Markdown → LaTeX
   - HTML → Markdown
   - Word → Markdown
5. 输出格式选择（图片/文档/文本，使用 Radio.Group）
6. 样式模板选择（代码风格、文档风格、聊天风格等，使用 Select）
7. 自定义样式选项（字体、颜色、背景等，使用 Form 组件）
8. 一键复制功能（使用 Ant Design Message 反馈）
9. 多格式下载功能（Pandoc 生成 + html2canvas 图片）

技术实现：
- node-pandoc 库集成，支持多种文档格式转换
- react-markdown 渲染 Markdown 预览
- html2canvas 生成图片
- Ant Design Upload 组件处理文件上传
- 通义千问 API 调用（OCR 文字识别）
- 实时预览功能（支持多种格式预览）
- Prisma + MySQL 存储用户模板和历史记录

node-pandoc 集成：
- 使用 node-pandoc 库作为 Pandoc 的 Node.js 包装器
- 多种输入格式支持（md, html, docx, txt）
- 多种输出格式生成（html, docx, pdf, tex）
- 自定义转换选项和参数
- 文档转换质量控制
- 需要系统级 Pandoc 安装作为依赖

node-pandoc 使用示例：
```javascript
import nodePandoc from 'node-pandoc'

// 转换配置
const convertOptions = {
  from: 'markdown',
  to: 'docx',
  extra: ['--standalone'],
  // 指定 pandoc 可执行文件路径（如果需要）
  pandocPath: '/usr/local/bin/pandoc'
}

// 执行转换
nodePandoc(markdownContent, convertOptions, (err, result) => {
  if (err) console.error('转换失败:', err)
  else console.log('转换成功:', result)
})
```

UI/UX：
- 使用 Ant Design Row/Col 实现左右分栏布局
- 移动端响应式上下布局
- Loading 组件显示处理状态
- Message 和 Notification 组件提供操作反馈
- Form 组件管理样式配置
- Tabs 组件切换不同输出格式预览

API 接口：
- POST /api/ocr - 调用通义千问进行图片文字识别
- POST /api/pandoc/convert - node-pandoc 格式转换
- POST /api/convert/image - 转换为图片格式
- GET/POST /api/templates - 样式模板管理
- GET /api/pandoc/formats - 获取支持的转换格式

node-pandoc 服务配置：
- node-pandoc 库配置和初始化
- 系统 Pandoc 路径检测和配置
- 转换参数和选项设置
- 错误处理和重试机制
- 转换性能优化
- 支持的格式和扩展配置

请提供完整的转换器组件代码，包含 node-pandoc 集成、系统 Pandoc 检测、TypeScript 接口定义、API 调用逻辑和 SCSS 样式。
```

#### 2.3 悬浮球快捷工具
```
创建 AISnap 的悬浮球快捷工具组件，要求：

功能特性：
1. 可拖拽的悬浮球，默认位置右下角（使用 Ant Design FloatButton）
2. 点击展开快捷操作菜单（使用 Ant Design Dropdown）
3. 支持的快捷操作：
   - 自动检测页面 AI 对话内容
   - 快速截图当前页面
   - 打开转换工具
   - 复制最新对话内容
4. 智能识别常见 AI 平台（ChatGPT、Claude、文心一言、通义千问等）
5. 键盘快捷键支持（使用 Ant Design message 提示）

技术实现：
- 使用 Ant Design FloatButton 和 Dropdown 组件
- Web API 进行页面内容检测
- DOM 解析获取对话内容
- html2canvas 截图功能集成
- 可配置的平台适配规则（存储在 MySQL 中）
- 通义千问 API 进行内容智能解析

交互设计：
- 使用 Ant Design 的动画效果
- 图标使用 @ant-design/icons
- Tooltip 组件提供悬停提示
- 半透明效果和主题适配

数据存储：
- 用户快捷操作历史
- 平台配置信息
- 检测规则缓存

请提供悬浮球组件的完整实现代码，包含 TypeScript 类型定义、数据库操作和 SCSS 样式。
```

### 阶段三：高级功能实现

#### 3.1 多平台 AI 内容检测与通义千问集成
```
实现 AISnap 的智能 AI 内容检测功能，结合通义千问 API，要求：

支持平台：
1. ChatGPT (chat.openai.com)
2. Claude (claude.ai)
3. 文心一言 (yiyan.baidu.com)
4. 通义千问 (tongyi.aliyun.com)
5. 其他常见 AI 平台

检测逻辑：
1. 自动识别当前页面的 AI 平台
2. 解析最新的 AI 回复内容
3. 使用通义千问 API 对内容进行智能解析和格式化
4. 提取纯文本和 Markdown 格式
5. 过滤无效内容（广告、导航等）
6. 支持多轮对话检测

通义千问 API 集成：
1. 文本内容智能解析和优化
2. 自动格式化和结构化处理
3. 内容质量评估和建议
4. 多语言内容处理支持

技术实现：
- DOM 选择器规则配置（存储在 MySQL 中）
- 内容清理和格式化
- 平台特定的解析策略
- 通义千问 API 调用封装
- 错误处理和降级方案
- Ant Design Message 组件提供状态反馈

数据库设计：
- 平台配置表（platform_configs）
- 检测规则表（detection_rules）
- 内容处理历史表（content_history）

API 接口：
- POST /api/detect - 页面内容检测
- POST /api/ai/parse - 通义千问内容解析
- GET/POST /api/platforms - 平台配置管理

用户体验：
- 使用 Ant Design Spin 组件显示检测状态
- Modal 组件进行内容预览确认
- 一键导入到转换工具
- Progress 组件显示处理进度

请提供完整的内容检测模块代码、通义千问 API 集成和数据库 Schema。
```

#### 3.2 样式模板系统与数据管理
```
创建 AISnap 的样式模板系统，结合 MySQL 数据存储，要求：

预设模板：
1. 代码风格模板（类似 CodeSnap，使用 Prism.js 语法高亮）
2. 文档风格模板（简洁文档样式，使用 Ant Design Typography）
3. 聊天对话模板（对话气泡样式，使用 Ant Design Card）
4. 学术论文模板（正式文档样式）
5. 社交媒体模板（适合分享的样式）

自定义选项：
1. 字体选择（系统字体 + Google Fonts）
2. 颜色主题（Ant Design 主题色 + 自定义）
3. 背景样式（纯色/渐变/图案）
4. 边距和间距调整（使用 Ant Design Space 组件）
5. 水印添加功能

技术实现：
- SCSS 模块化样式管理
- 动态 CSS 变量注入
- Ant Design ConfigProvider 主题定制
- 模板配置存储在 MySQL 中
- 实时预览更新（html2canvas 渲染）
- 样式导出和导入功能

数据库设计：
- 样式模板表（style_templates）
- 用户自定义模板表（user_templates）
- 模板分类表（template_categories）

用户界面：
- 使用 Ant Design Form 组件创建可视化样式编辑器
- Card 组件展示模板缩略图预览
- Button 组件提供一键应用功能
- Modal 组件进行模板管理
- Upload 组件支持模板导入导出

API 接口：
- GET /api/templates - 获取模板列表
- POST /api/templates - 创建新模板
- PUT /api/templates/[id] - 更新模板
- DELETE /api/templates/[id] - 删除模板

请提供完整的样式模板系统实现，包含数据库 Schema、API 接口和组件代码。
- 个人模板保存

请提供样式模板系统的完整实现。
```

### 阶段四：用户体验优化

#### 4.1 响应式设计和动画优化
```
优化 AISnap 应用的响应式设计和用户体验，基于 Ant Design 设计系统，要求：

响应式优化：
1. 移动端适配（使用 Ant Design Grid 系统）
2. 平板端适配（断点：768px-1024px）
3. 桌面端优化（断点：1024px+）
4. 触摸友好的交互设计（Ant Design Button 大小适配）
5. 横竖屏切换适配

动画和交互：
1. 页面加载动画（Ant Design Spin 组件）
2. 路由过渡效果（SCSS 动画）
3. 悬浮球拖拽动画（CSS Transform）
4. 转换进度指示器（Ant Design Progress）
5. 微交互反馈（Ant Design Message/Notification）

性能优化：
1. 图片懒加载（next/image 优化）
2. 组件代码分割（Next.js 动态导入）
3. 缓存策略（SWR 或 React Query）
4. 防抖和节流处理（lodash.debounce）

用户体验：
- Ant Design Tour 组件提供操作引导
- Result 组件显示错误状态
- 全局 Loading 状态管理
- PWA 离线功能支持

技术实现：
- 使用 Ant Design 响应式工具类
- SCSS 媒体查询定制
- CSS Grid 和 Flexbox 布局
- 动画库集成（Framer Motion 可选）

请提供完整的响应式优化和动画实现代码，包含 SCSS 样式和 TypeScript 组件。
```

#### 4.2 MySQL 数据管理和缓存优化
```
实现 AISnap 的完整数据管理系统，基于 MySQL + Prisma，要求：

数据库表设计：
1. 用户表（users）- 存储用户基本信息
2. 样式模板表（style_templates）- 存储模板配置
3. 转换历史表（conversion_history）- 存储转换记录
4. 用户设置表（user_settings）- 存储个人偏好
5. 平台配置表（platform_configs）- 存储 AI 平台检测规则

数据模型（Prisma Schema）：
- User 模型（包含关联关系）
- Template 模型（JSON 字段存储样式配置）
- ConversionRecord 模型（存储输入输出内容）
- UserSetting 模型（键值对存储）
- PlatformConfig 模型（检测规则配置）

缓存策略：
1. Redis 缓存常用模板和配置
2. Next.js 静态生成缓存
3. 客户端缓存（localStorage + sessionStorage）
4. API 响应缓存（SWR 或 React Query）

数据同步：
1. 实时数据同步（WebSocket 可选）
2. 离线数据缓存
3. 数据冲突解决
4. 增量同步策略

技术实现：
- Prisma ORM 数据库操作
- Next.js API Routes 接口
- 数据验证（Zod 或 Yup）
- 事务处理和错误回滚
- 数据库连接池管理

API 设计：
- RESTful API 设计规范
- 统一错误处理
- 请求参数验证
- 响应数据格式化

请提供完整的数据管理系统实现，包含 Prisma Schema、API 路由和数据操作封装。
- LocalStorage/IndexedDB 使用
- 数据加密和安全
- 跨浏览器兼容性
- 数据同步策略

用户功能：
- 历史记录查看
- 模板管理界面
- 设置页面
- 数据备份恢复

请提供完整的数据管理系统实现。
```

### 阶段五：最终优化和部署（阿里云服务器 + 宝塔面板）

```
完成 AISnap 项目的阿里云服务器部署，使用宝塔面板管理，要求：

服务器环境配置：
1. 阿里云轻量应用服务器（Ubuntu 20.04 或 CentOS 8）
2. 安装宝塔 Linux 面板：
   ```bash
   wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
   ```
3. 通过宝塔面板安装软件：
   - Node.js 项目管理器
   - PM2 管理器 2.7
   - Nginx 1.20+
   - MySQL 8.0
   - phpMyAdmin (数据库管理)

系统级依赖安装：
1. 通过 SSH 或宝塔终端安装 Pandoc：
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt install pandoc
   
   # CentOS/RHEL  
   sudo yum install pandoc
   
   # 验证安装
   pandoc --version
   node --version
   npm --version
   ```

项目构建和部署：
1. 本地构建项目：
   ```bash
   npm run build
   npm run export  # 如果需要静态导出
   ```

2. 代码上传（三种方式任选）：
   - 宝塔面板文件管理器直接上传压缩包
   - Git 仓库克隆：`git clone your-repo-url`
   - 使用 FTP/SFTP 工具上传

3. 项目目录结构：
   ```
   /www/wwwroot/aisnap/
   ├── .next/           # Next.js 构建文件
   ├── public/          # 静态资源
   ├── node_modules/    # 依赖包
   ├── package.json
   └── ...其他文件
   ```

宝塔面板配置：
1. 添加网站（域名：your-domain.com，目录：/www/wwwroot/aisnap）
2. 配置 SSL 证书（Let's Encrypt 免费证书）
3. 设置 PHP 版本（选择"纯静态"）
4. 配置 Node.js 项目：
   - 项目路径：/www/wwwroot/aisnap
   - 启动文件：server.js 或使用 next start
   - 端口：3000
   - 运行用户：www

环境变量配置：
1. 在宝塔面板创建 .env.production 文件：
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/aisnap"
   TONGYI_API_KEY="your-tongyi-api-key"
   NEXTAUTH_SECRET="your-secret-key"
   PANDOC_PATH="/usr/bin/pandoc"
   NODE_ENV="production"
   ```

数据库配置：
1. 在宝塔面板创建 MySQL 数据库
2. 运行 Prisma 迁移：
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

PM2 进程管理：
1. 创建 ecosystem.config.js：
   ```javascript
   module.exports = {
     apps: [{
       name: 'aisnap',
       script: 'npm',
       args: 'start',
       cwd: '/www/wwwroot/aisnap',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G'
     }]
   }
   ```

2. 通过宝塔面板 PM2 管理器启动项目

Nginx 反向代理配置：
1. 在宝塔面板网站设置中配置反向代理
2. 目标 URL：http://localhost:3000
3. 或手动编辑 Nginx 配置文件（已在上方提供）

性能优化：
1. 启用 Gzip 压缩
2. 配置静态资源缓存
3. 设置 CDN（阿里云 CDN）
4. 数据库连接池优化
5. Pandoc 转换结果缓存

监控和维护：
1. 宝塔面板系统监控（CPU、内存、磁盘）
2. 网站访问日志分析
3. 定期数据库备份
4. SSL 证书自动续期
5. 系统安全加固

安全配置：
1. 修改 SSH 默认端口
2. 禁用 root 直接登录
3. 配置防火墙规则
4. 定期更新系统补丁
5. 设置访问频率限制

域名和 DNS 配置：
1. 域名解析到服务器 IP
2. 配置 A 记录和 CNAME
3. 设置 CDN 加速（可选）

备份策略：
1. 宝塔面板定时备份（文件 + 数据库）
2. 异地备份到阿里云 OSS
3. 版本控制备份（Git）

请提供完整的宝塔面板配置步骤、服务器环境设置和 Pandoc + node-pandoc 在生产环境的配置方案。
```

---

## 提示词使用建议

### 📋 使用流程
1. **按阶段顺序**：严格按照阶段顺序执行，确保依赖关系正确
2. **及时验证**：每个阶段完成后立即测试功能
3. **迭代优化**：根据实际情况调整提示词内容
4. **保存进度**：及时保存代码，避免丢失

### ⚡ 效率技巧
- 准备好**常用代码片段**和**样板文件**
- 利用 **v0.dev** 快速生成 UI 组件

### 🎯 质量保证
- 每个组件都要包含 **错误处理**
- 确保 **TypeScript 类型安全**
- 添加必要的 **加载状态**
- 实现 **响应式设计**

### 🚀 应急策略
- 如果某个功能实现困难，先实现**核心功能**
- 准备**降级方案**（如悬浮球功能可后置）
- 重点保证**主要用户流程**完整可用
- 最后阶段专注**视觉效果**和**用户体验**

---
