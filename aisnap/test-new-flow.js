// 使用TESTING.md中的markdown内容进行测试
const testMarkdownContent = `# 标题 1
## 标题 2
### 标题 3

这是一个段落，包含**粗体文本**和*斜体文本*。

- 无序列表项 1
- 无序列表项 2
  - 嵌套列表项

1. 有序列表项 1
2. 有序列表项 2

> 这是一个引用块

\`行内代码\`

\`\`\`javascript
// 代码块
function helloWorld() {
  console.log("Hello, World!");
}
\`\`\`

[链接文本](https://example.com)

![图片描述](image.jpg)

| 表格标题1 | 表格标题2 |
|----------|----------|
| 单元格1   | 单元格2   |
| 单元格3   | 单元格4   |`;

const testConversions = async () => {
  console.log('=== 测试新的转换流程 ===\n');
  
  const testCases = [
    { outputType: 'docx', description: '测试输出1: DOCX文件生成' },
    { outputType: 'html', description: '测试输出1: HTML文件生成' },
    { outputType: 'latex', description: '测试输出1: LaTeX文件生成' },
    { outputType: 'plain', description: '测试输出1: 纯文本提取（先生成DOCX再提取）' },
    { outputType: 'image', description: '测试输出1: 图片输出（返回markdown给前端）' }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.description} ---`);
    
    try {
      const response = await fetch('http://localhost:3000/api/convert/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: testMarkdownContent,
          inputType: 'markdown',
          outputType: testCase.outputType
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 成功: ${result.message}`);
        if (result.data?.outputFile) {
          console.log(`📁 文件: ${result.data.outputFile}`);
        }
        if (result.data?.result) {
          console.log(`📝 内容长度: ${result.data.result.length} 字符`);
          console.log(`📝 内容预览: ${result.data.result.substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ 失败: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ 请求失败:`, error.message);
    }
  }
  
  console.log('\n=== 测试完成 ===');
};

testConversions();
