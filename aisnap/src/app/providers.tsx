'use client';

import { ConfigProvider, App as AntApp } from "antd";
import '@ant-design/v5-patch-for-react-19';
import theme from "./theme";
import React from "react";

export default function AntDesignProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        {children}
      </AntApp>
    </ConfigProvider>
  );
}