"use client";
import Image from "next/image";
import Link from "next/link";
import UserNavbar from "./components/UserNavbar";

import { Button, Space, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div>
      <UserNavbar />
      <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", marginTop: 64 }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <Image 
              src="/logo.svg" 
              alt="AISnap Logo" 
              width={64} 
              height={64} 
              style={{ marginBottom: "20px" }}
            />
            <Title style={{ margin: 0 }}>
              AISnap - AI快照, 智能格式转换平台、便捷分享工具
            </Title>
          </div>
          
          <Paragraph style={{ textAlign: "center", fontSize: "16px" }}>
            解决AI生成内容的格式转换与分享痛点：AI生成的Markdown内容粘贴格式错乱、截图不便、样式不美观、操作繁琐等问题
          </Paragraph>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "20px", 
            flexWrap: "wrap",
            marginTop: "40px"
          }}>
            <Link href="/convert">
              <Button type="primary" size="large" icon={<FileTextOutlined />}>
                开始转换
              </Button>
            </Link>
          </div>
          
          <div style={{ 
            marginTop: "60px", 
            padding: "30px", 
            backgroundColor: "#f0f2f5", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid #d9d9d9"
          }}>
            <Title level={3}>支持的输出格式</Title>
            <Paragraph>预设模板图片、DOCX/HTML/LaTeX/PDF文件、纯文本提取</Paragraph>
          </div>
        </Space>
      </div>
    </div>
  );
}