# AISnap 测试文档

本文档提供了各种测试用例，方便您测试 AISnap 应用的各项功能。

## 1. 文本转换测试用例

### 1.1 Markdown 转换测试

```markdown
# 标题 1
## 标题 2
### 标题 3

这是一个段落，包含**粗体文本**和*斜体文本*。

- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2

> 这是一个引用块

`行内代码`

```javascript
// 代码块
function helloWorld() {
  console.log("Hello, World!");
}
```

[链接文本](https://example.com)

![图片描述](image.jpg)

| 表格标题1 | 表格标题2 |
|----------|----------|
| 单元格1   | 单元格2   |
| 单元格3   | 单元格4   |
```

### 1.2 HTML 转换测试

```html
<!DOCTYPE html>
<html>
<head>
    <title>测试页面</title>
</head>
<body>
    <h1>主标题</h1>
    <h2>副标题</h2>
    
    <p>这是一个段落，包含<strong>粗体文本</strong>和<em>斜体文本</em>。</p>
    
    <ul>
        <li>无序列表项 1</li>
        <li>无序列表项 2
            <ul>
                <li>嵌套列表项</li>
            </ul>
        </li>
    </ul>
    
    <ol>
        <li>有序列表项 1</li>
        <li>有序列表项 2</li>
    </ol>
    
    <blockquote>
        这是一个引用块
    </blockquote>
    
    <code>行内代码</code>
    
    <pre><code class="language-javascript">// 代码块
function helloWorld() {
  console.log("Hello, World!");
}
</code></pre>
    
    <a href="https://example.com">链接文本</a>
    
    <img src="image.jpg" alt="图片描述">
    
    <table>
        <thead>
            <tr>
                <th>表格标题1</th>
                <th>表格标题2</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>单元格1</td>
                <td>单元格2</td>
            </tr>
            <tr>
                <td>单元格3</td>
                <td>单元格4</td>
            </tr>
        </tbody>
    </table>
</body>
</html>
```

### 1.3 LaTeX 转换测试

```latex
\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}

\title{测试文档}
\author{作者姓名}
\date{\today}

\begin{document}

\maketitle

\section{引言}
这是一个段落，包含一些文本。

\subsection{子章节}
这是子章节的内容。

\section{数学公式}
行内公式: $E = mc^2$

独立公式:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

带编号的公式:
\begin{equation}
F = ma
\end{equation}

\section{列表}
无序列表:
\begin{itemize}
    \item 列表项 1
    \item 列表项 2
\end{itemize}

有序列表:
\begin{enumerate}
    \item 第一项
    \item 第二项
\end{enumerate}

\section{表格}
\begin{table}[h]
\centering
\begin{tabular}{|c|c|}
\hline
列1 & 列2 \\
\hline
数据1 & 数据2 \\
数据3 & 数据4 \\
\hline
\end{tabular}
\caption{示例表格}
\end{table}

\end{document}
```

## 2. 图片转换测试用例

### 2.1 AI 对话截图
准备一些包含 AI 对话的截图，例如：
- Qwen 与用户的对话截图
- 文心一言与用户的对话截图
- 讯飞星火与用户的对话截图

### 2.2 技术文档截图
- 包含代码的截图
- 包含表格的截图
- 包含数学公式的截图

## 3. 模板测试用例

### 3.1 技术文档模板
```markdown
# 项目名称

## 项目概述

## 技术架构

## 安装指南

## 使用说明

## API 文档

## 常见问题
```

### 3.2 会议纪要模板
```markdown
# 会议纪要

## 基本信息
- 会议时间：
- 会议地点：
- 参会人员：
- 会议主持人：

## 会议议题

## 讨论内容

## 决议事项

## 后续行动
```

## 4. 输出格式测试

### 4.1 DOCX 输出
测试所有输入格式转换为 DOCX 文档的功能。

### 4.2 HTML 输出
测试所有输入格式转换为 HTML 文档的功能。

### 4.3 LaTeX 输出
测试所有输入格式转换为 LaTeX 文档的功能。

### 4.4 PDF 输出
测试所有输入格式转换为 PDF 文档的功能。

### 4.5 纯文本输出
测试所有输入格式转换为纯文本的功能。

### 4.6 图片输出
测试预览功能和保存为图片的功能。

## 5. 错误处理测试

### 5.1 空输入测试
测试在不输入任何内容时的错误提示。

### 5.2 无效文件测试
测试上传非图片文件时的错误处理。

### 5.3 网络错误测试
测试在网络连接失败时的错误处理。

### 5.4 API 错误测试
测试在 API 调用失败时的错误处理。

## 6. 用户界面测试

### 6.1 响应式设计测试
- 在不同屏幕尺寸下测试界面布局
- 测试移动端和桌面端的显示效果

### 6.2 导航测试
- 测试主页到转换页面的导航
- 测试返回按钮功能

### 6.3 交互测试
- 测试选项卡切换功能
- 测试表单输入和选择功能
- 测试按钮点击响应

## 7. 性能测试

### 7.1 大文件转换测试
- 测试大文本文件的转换性能
- 测试大图片文件的转换性能

### 7.2 并发测试
- 测试多个转换请求同时处理的能力

## 8. 兼容性测试

### 8.1 浏览器兼容性
- 在不同浏览器中测试应用功能
- Chrome, Firefox, Safari, Edge

### 8.2 操作系统兼容性
- 在 Windows, macOS, Linux 等系统中测试

## 9. 安全测试

### 9.1 文件上传安全
- 测试恶意文件上传防护
- 测试文件类型验证

### 9.2 输入验证
- 测试特殊字符输入处理
- 测试超长输入处理

## 10. 回归测试

### 10.1 功能回归测试
- 在每次更新后测试核心功能
- 确保新功能不影响现有功能

### 10.2 界面回归测试
- 检查界面布局是否正常
- 检查组件显示是否正确