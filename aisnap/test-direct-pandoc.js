import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

async function testDirectPandoc() {
  console.log('Testing direct pandoc command...');
  
  try {
    // 测试pandoc是否可用
    const { stdout: version } = await execAsync('pandoc --version');
    console.log('Pandoc version:', version.split('\n')[0]);
    
    // 创建测试输入
    const testContent = '# Test\n\nThis is a test document.';
    const tempDir = 'public/downloads';
    const inputFile = path.resolve(tempDir, 'test-input.md');
    const outputFile = path.resolve(tempDir, 'test-output.docx');
    
    // 确保目录存在
    await fs.mkdir(tempDir, { recursive: true });
    
    // 写入测试文件
    await fs.writeFile(inputFile, testContent, 'utf-8');
    console.log('Created input file:', inputFile);
    
    // 尝试转换
    const command = `pandoc "${inputFile}" --from=markdown --to=docx --output="${outputFile}"`;
    console.log('Executing command:', command);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.log('Stderr:', stderr);
    }
    
    if (stdout) {
      console.log('Stdout:', stdout);
    }
    
    // 检查输出文件
    try {
      const stats = await fs.stat(outputFile);
      console.log('Success! Output file created with size:', stats.size, 'bytes');
      
      // 清理文件
      await fs.unlink(inputFile);
      await fs.unlink(outputFile);
      
      return true;
    } catch (error) {
      console.error('Output file not found:', error);
      return false;
    }
    
  } catch (error) {
    console.error('Direct pandoc test failed:', error);
    return false;
  }
}

// 运行测试
testDirectPandoc().then(result => {
  console.log('Test result:', result ? 'SUCCESS' : 'FAILED');
}).catch(error => {
  console.error('Test error:', error);
});
