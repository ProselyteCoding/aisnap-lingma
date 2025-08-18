# AISnap 数据库设计文档

## 概述

本文档描述了 AISnap 应用程序的数据库结构设计。AISnap 使用 MySQL 数据库和 Prisma ORM 进行数据持久化。

## 技术栈

- **数据库**: MySQL
- **ORM**: Prisma
- **连接方式**: Prisma Client

## 数据库表结构

### 1. 用户表 (User)

存储用户基本信息和认证数据。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | String (UUID) | Primary Key, Unique | 用户唯一标识符 |
| email | String | Unique | 用户邮箱，用于登录 |
| username | String | Required | 用户名，用于登录 |
| nickname | String | Required | 用户昵称，显示 |
| avatar | String | Nullable | 用户头像 URL |
| background | String | Nullable | 用户背景图片 URL |
| password | String | Required | 加密后的用户密码 |
| createdAt | DateTime | Default: now() | 用户创建时间 |

### 2. 转换记录表 (History)

存储用户的文档转换历史记录。

| 字段名 | 类型 | 约束 | 描述 |
|--------|------|------|------|
| id | String (UUID) | Primary Key, Unique | 转换记录唯一标识符 |
| userId | String | Foreign Key, Required | 关联的用户 ID |
| inputType | String | Required | 输入类型 ('markdown', 'image') |
| outputType | String | Required | 输出类型 ('docx', 'html', 'pdf', 'latex', 'image', 'plain') |
| input | String | Nullable | 输入内容（如果是文本） |
| output | String | Nullable | 输出内容（如果是文本） |
| inputFile | String | Nullable | 输入文件路径 |
| outputFile | String | Nullable | 输出文件路径 |
| createdAt | DateTime | Default: now() | 转换记录创建时间 |

**关系**:
- 一个转换记录属于一个用户 (Conversion -> User?)

## ER 图

```er
User ||--o{ History
```

说明:
- 一个用户可以有多条转换记录（一对多关系）

## 安全考虑

1. **密码存储**: 用户密码使用 bcryptjs 进行加密存储
2. **数据访问**: 通过 Prisma ORM 访问数据库，防止 SQL 注入
3. **用户隔离**: 用户只能访问自己的数据记录
4. **敏感信息**: 避免在数据库中存储敏感信息，如 API 密钥等

## 备份策略

建议定期备份数据库，特别是以下数据:
1. User 表: 用户基本信息
2. History 表: 转换历史记录

## 性能优化

1. 为常用查询字段添加索引
2. 定期清理过期的转换记录
3. 对大文本字段考虑使用文件存储而非数据库存储