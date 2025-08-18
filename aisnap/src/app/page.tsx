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
          <Title style={{ textAlign: "center", marginBottom: "10px" }}>
            AISnap - 智能文档格式转换平台
          </Title>
          
          <Paragraph style={{ textAlign: "center", fontSize: "16px" }}>
            解决AI生成内容的格式转换痛点：AI生成的Markdown内容粘贴到Word/PDF时格式错乱、截图不便、格式单一、操作繁琐等问题
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
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <Title level={3}>支持的输出格式</Title>
            <Paragraph>图片、DOCX、HTML、LaTeX、PDF文件，以及DOCX纯文本提取</Paragraph>
          </div>
        </Space>
      </div>
    </div>
  );
}