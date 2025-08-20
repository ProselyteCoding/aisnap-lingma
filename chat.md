[提示词框架]基于我给出的提示词框架文档，首先全面理解开发思路及项目背景，之后使用我给出的关键技术栈，按照“开发阶段安排部分”的不同阶段逐步进行开发。要求每一阶段内部可自行划分若干小步骤，每完成一个大阶段需要向我确认，得到允许后再进行下一阶段开发，对于可能存在问题或者我描述不够清晰的地方先指出后生成

---

我理解了你的项目需求。AISnap 是一个基于 Web 的智能文档格式转换平台，主要解决 AI 生成内容在不同格式间转换的问题。项目使用 Next.js 14 + TypeScript + SCSS 作为前端技术栈，结合 Ant Design 组件库，后端使用 Next.js API Routes，数据库采用 MySQL + Prisma ORM，并集成通义千问 VL 和 node-pandoc 进行 AI 处理和格式转换。

根据你提供的开发阶段安排，我将按照四个阶段逐步进行开发：

项目初始化与基础架构
核心功能开发
用户系统与数据管理
性能优化与用户体验
现在我开始第一阶段的开发工作：项目初始化与基础架构。

首先，让我检查项目目录结构，然后创建 Next.js 项目。

我将按照您的要求，基于提供的提示词框架文档逐步开发AISnap项目。首先让我理解整个项目的开发思路和背景。

根据文档，AISnap是一个基于Web的智能文档格式转换平台，主要解决AI生成内容的格式转换痛点。项目使用Next.js 14 + TypeScript + SCSS作为前端技术栈，结合Ant Design组件库，后端使用Next.js API Routes，数据库采用MySQL + Prisma ORM，并集成通义千问VL和node-pandoc进行AI处理和格式转换。

让我开始第一阶段：项目初始化与基础架构的开发。

首先，我需要创建Next.js项目基础架构。让我检查当前目录结构，然后开始创建项目文件。

```cmd
npx create-next-app@latest aisnap --typescript --use-npm --eslint --tailwind --src-dir --app --import-alias "@/*"
```

看起来我已经成功创建了Next.js项目。让我检查一下项目结构并继续配置SCSS和Ant Design。

查看src目录结构

查看app目录结构

已查看目录
aisnap/src/app
现在我需要配置SCSS和Ant Design。首先，让我安装必要的依赖项：

终端已运行
cd aisnap && npm install sass antd @ant-design/icons
进入aisnap目录

终端已运行
cd aisnap
安装SCSS和Ant Design相关依赖

终端已运行
npm install sass antd @ant-design/icons
很好，现在我已经安装了SCSS和Ant Design依赖。接下来我需要配置Ant Design和SCSS模块化。让我先创建SCSS样式文件和配置Ant Design。

更新layout.tsx以使用SCSS样式

---