'use client';

import { ConfigProvider, App as AntApp } from "antd";
import { SessionProvider } from "next-auth/react";
import '@ant-design/v5-patch-for-react-19';
import theme from "./theme";
import React from "react";
import GlobalBackground from "./components/GlobalBackground";

export default function AntDesignProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <SessionProvider>
      <ConfigProvider theme={theme}>
        <AntApp>
          <GlobalBackground />
          {children}
        </AntApp>
      </ConfigProvider>
    </SessionProvider>
  );
}