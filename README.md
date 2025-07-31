# Telegram TMDB 电影请求机器人

这是一个基于Google Apps Script和Google Sheets的Telegram机器人，用于管理用户的TMDB电影请求。

## 功能特性

- **电影请求管理**: 用户通过`/request`命令发送TMDB链接申请电影
- **重复检测**: 自动检测重复请求，避免重复记录
- **用户通知**: 当资源状态更新时自动通知相关用户
- **状态跟踪**: 支持三种状态：未处理、已入库、查无资源
- **历史记录**: 完整的请求历史记录管理

## 系统架构

```
Telegram Bot API
       ↓
Google Apps Script (Webhook处理)
       ↓
Google Sheets (数据存储)
```

## 部署步骤

### 1. 创建Telegram Bot
1. 在Telegram中找到@BotFather
2. 发送`/newbot`创建新机器人
3. 记录Bot Token

### 2. 创建Google Sheets
1. 创建新的Google Sheets文档
2. 记录Spreadsheet ID

### 3. 部署Google Apps Script
1. 访问[Google Apps Script](https://script.google.com)
2. 创建新项目
3. 复制代码文件到项目中
4. 配置环境变量
5. 部署为Web应用

### 4. 配置Webhook
设置Telegram Bot的Webhook指向Google Apps Script的Web应用URL

## 文件结构

- `Code.gs` - 主要的Apps Script代码
- `SheetOperations.gs` - Google Sheets操作函数
- `TmdbParser.gs` - TMDB链接解析和API调用
- `Config.gs` - 配置文件
- `README.md` - 项目说明文档

## 使用方法

### 用户命令
- `/request [TMDB链接]` - 申请电影资源

### 管理员操作
在Google Sheets中手动修改资源状态：
- "未处理" - 新提交的请求
- "已入库" - 资源已添加到库中
- "查无资源" - 无法找到该资源

## 数据表结构

Google Sheets包含以下列：
- A: 请求ID
- B: TMDB电影ID
- C: 电影标题
- D: TMDB链接
- E: 用户ID
- F: 用户姓名
- G: 请求时间
- H: 状态
- I: 更新时间

## 注意事项

- 需要TMDB API密钥来获取电影信息
- Bot需要有发送消息的权限
- Google Sheets需要设置适当的共享权限