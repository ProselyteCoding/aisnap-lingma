import type { ThemeConfig } from 'antd';

// 静态主题配置 - 主题切换主要通过CSS变量实现
const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#1890ff',
  },
  components: {
    Button: {
      algorithm: true,
    },
  },
};

export default theme;