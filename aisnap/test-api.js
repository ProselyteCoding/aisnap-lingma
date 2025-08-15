// Simple test for pandoc conversion
const testPandocConversion = async () => {
  console.log('Testing pandoc text conversion...');
  
  try {
    const response = await fetch('http://localhost:3000/api/convert/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: '# Test Document\n\nThis is a test.',
        inputType: 'markdown',
        outputType: 'docx'
      }),
    });
    
    const result = await response.json();
    console.log('Conversion result:', result);
    
    if (result.success) {
      console.log('SUCCESS: File created at', result.data?.outputFile);
    } else {
      console.log('FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testPandocConversion();
