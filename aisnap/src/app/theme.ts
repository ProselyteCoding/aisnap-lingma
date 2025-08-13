import type { ThemeConfig } from 'antd';

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