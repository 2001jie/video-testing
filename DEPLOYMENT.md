# Telegram TMDB Bot 部署指南

本指南将详细介绍如何部署和配置基于Google Apps Script和Google Sheets的Telegram TMDB电影请求机器人。

## 🚀 快速开始

### 前置要求

1. Google账户
2. Telegram账户  
3. TMDB API账户（免费）

### 预计部署时间
约 15-20 分钟

---

## 📋 步骤1：创建Telegram Bot

1. **打开Telegram，搜索 @BotFather**

2. **创建新Bot**
   ```
   发送：/newbot
   ```

3. **设置Bot名称**
   ```
   例如：TMDB Movie Request Bot
   ```

4. **设置Bot用户名**
   ```
   例如：tmdb_movie_request_bot
   注意：必须以 _bot 结尾
   ```

5. **保存Bot Token**
   ```
   BotFather会提供类似这样的Token：
   1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```

6. **可选：设置Bot头像和描述**
   ```
   /setuserpic - 设置头像
   /setdescription - 设置描述
   ```

---

## 📊 步骤2：创建Google Sheets

1. **访问 [Google Sheets](https://sheets.google.com)**

2. **创建新的电子表格**
   - 点击"空白"创建新表格
   - 将表格重命名为"TMDB Movie Requests"

3. **获取Spreadsheet ID**
   ```
   从URL中提取ID：
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   
   例如：1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```

4. **设置共享权限**
   - 点击右上角"共享"按钮
   - 设置为"知道链接的任何人都可以查看"
   - 或添加特定的Google账户

---

## 🎬 步骤3：获取TMDB API密钥

1. **访问 [TMDB官网](https://www.themoviedb.org)**

2. **注册账户**
   - 如果没有账户，请先注册

3. **申请API密钥**
   - 登录后访问：https://www.themoviedb.org/settings/api
   - 点击"Create"创建新的API密钥
   - 选择"Developer"
   - 填写应用信息（可以简单填写）

4. **获取API Key**
   ```
   格式类似：a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

---

## 💻 步骤4：部署Google Apps Script

### 4.1 创建项目

1. **访问 [Google Apps Script](https://script.google.com)**

2. **创建新项目**
   - 点击"新建项目"
   - 将项目重命名为"Telegram TMDB Bot"

### 4.2 添加代码文件

**按照以下顺序创建文件：**

1. **Config.gs**
   - 点击"文件" > "新建" > "脚本文件"
   - 命名为"Config"
   - 复制粘贴 `Config.gs` 的内容

2. **Code.gs**
   - 删除默认的"代码.gs"文件
   - 创建新文件"Code"
   - 复制粘贴 `Code.gs` 的内容

3. **SheetOperations.gs**
   - 创建新文件"SheetOperations"
   - 复制粘贴 `SheetOperations.gs` 的内容

4. **TmdbParser.gs**
   - 创建新文件"TmdbParser"
   - 复制粘贴 `TmdbParser.gs` 的内容

5. **StatusMonitor.gs**
   - 创建新文件"StatusMonitor"
   - 复制粘贴 `StatusMonitor.gs` 的内容

### 4.3 配置环境变量

**编辑 `Config.gs` 文件，替换以下值：**

```javascript
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // 替换为步骤1获取的Bot Token
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // 替换为步骤2获取的Spreadsheet ID  
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // 替换为步骤3获取的API Key
```

### 4.4 测试配置

1. **测试TMDB连接**
   ```javascript
   // 在Apps Script编辑器中运行
   testTmdbFunctions();
   ```

2. **测试Google Sheets连接**
   ```javascript
   // 在Apps Script编辑器中运行
   testSheetConnection();
   ```

3. **测试Bot连接**
   ```javascript
   // 在Apps Script编辑器中运行
   testBot();
   ```

### 4.5 部署Web应用

1. **点击"部署" > "新建部署"**

2. **配置部署设置**
   - 类型：选择"Web应用"
   - 描述：填写"Telegram TMDB Bot v1.0"
   - 执行身份：选择"我"
   - 具有访问权限的用户：选择"任何人"

3. **点击"部署"**

4. **授权应用**
   - 点击"授权访问"
   - 选择Google账户
   - 点击"高级"
   - 点击"转到 [项目名称]（不安全）"
   - 点击"允许"

5. **获取Web应用URL**
   ```
   格式类似：
   https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
   ```

---

## 🔗 步骤5：设置Webhook

### 5.1 配置Webhook URL

**编辑 `Code.gs` 文件中的 `setWebhook` 函数：**

```javascript
function setWebhook() {
  const webAppUrl = 'YOUR_WEB_APP_URL_HERE'; // 替换为步骤4.5获取的URL
  // ... 其余代码保持不变
}
```

### 5.2 执行Webhook设置

1. **在Apps Script编辑器中运行 `setWebhook` 函数**

2. **检查执行日志**
   ```
   应该看到类似：
   Webhook设置结果: {ok: true, result: true, description: "Webhook was set"}
   ```

---

## ⚡ 步骤6：启用状态监控

### 6.1 设置定时触发器

**在Apps Script编辑器中运行：**

```javascript
setupStatusMonitor();
```

### 6.2 验证触发器

1. **点击左侧"触发器"菜单**
2. **确认看到 `checkStatusChanges` 触发器**
3. **触发器应该设置为每5分钟运行一次**

---

## 🧪 步骤7：测试Bot功能

### 7.1 基本功能测试

1. **在Telegram中找到您的Bot**
   - 搜索Bot用户名
   - 点击"开始"或发送 `/start`

2. **测试帮助命令**
   ```
   发送：/start
   应该收到使用说明
   ```

3. **测试电影请求**
   ```
   发送：/request https://www.themoviedb.org/movie/550
   应该收到电影信息确认
   ```

### 7.2 重复请求测试

1. **再次请求相同电影**
   ```
   发送：/request https://www.themoviedb.org/movie/550
   应该收到重复请求提醒
   ```

### 7.3 状态更新测试

1. **打开Google Sheets**
2. **手动修改某个请求的状态为"已入库"**
3. **等待5分钟，检查是否收到状态更新通知**

---

## 📋 数据表结构说明

Google Sheets将自动创建以下列结构：

| 列 | 名称 | 说明 |
|---|---|---|
| A | 请求ID | 自动生成的唯一标识符 |
| B | TMDB ID | 电影在TMDB的ID |
| C | 电影标题 | 电影名称 |
| D | TMDB链接 | 用户提供的原始链接 |
| E | 用户ID | Telegram用户ID |
| F | 用户姓名 | Telegram用户的first name |
| G | 请求时间 | 请求提交时间 |
| H | 状态 | 未处理/已入库/查无资源 |
| I | 更新时间 | 状态最后更新时间 |

---

## 🔧 管理和维护

### 日常管理

1. **查看请求**
   - 打开Google Sheets查看所有请求
   - 按状态筛选和排序

2. **更新状态**
   - 直接在H列修改状态
   - 系统会自动通知相关用户

3. **监控日志**
   - 在Apps Script中查看执行日志
   - 监控错误和异常情况

### 常用管理命令

**在Apps Script编辑器中运行：**

```javascript
// 获取监控统计
getMonitoringStats();

// 获取待处理请求
getPendingRequests();

// 手动检查状态变更
manualStatusCheck();

// 重置监控系统
resetStatusMonitor();
```

### 故障排除

**常见问题及解决方案：**

1. **Bot无响应**
   - 检查Webhook是否设置正确
   - 验证Bot Token是否有效
   - 查看Apps Script执行日志

2. **无法获取电影信息**
   - 验证TMDB API密钥
   - 检查网络连接
   - 确认TMDB链接格式正确

3. **状态通知不工作**
   - 检查触发器是否正常运行
   - 验证状态监控设置
   - 查看PropertiesService中的快照数据

4. **Google Sheets权限错误**
   - 确认Spreadsheet ID正确
   - 检查表格共享权限
   - 重新授权Apps Script

---

## 🔒 安全建议

1. **保护敏感信息**
   - 不要在代码中硬编码密钥
   - 使用PropertiesService存储敏感配置
   - 定期更换API密钥

2. **访问控制**
   - 限制Google Sheets的编辑权限
   - 监控Bot的使用情况
   - 设置用户白名单（如需要）

3. **数据备份**
   - 定期备份Google Sheets数据
   - 导出重要的请求记录
   - 保存Apps Script代码副本

---

## 📈 扩展功能

### 可选增强功能

1. **用户认证**
   - 添加用户白名单功能
   - 实现管理员权限控制

2. **高级通知**
   - 添加邮件通知功能
   - 实现批量状态更新

3. **数据分析**
   - 生成请求统计报告
   - 分析用户行为模式

4. **多语言支持**
   - 添加英文界面
   - 支持其他语言的电影信息

---

## 🆘 获取帮助

如果在部署过程中遇到问题：

1. **检查日志**
   - Apps Script执行日志
   - Telegram Bot API响应

2. **验证配置**
   - 确认所有密钥和ID正确
   - 测试各个组件连接

3. **参考文档**
   - [Google Apps Script文档](https://developers.google.com/apps-script)
   - [Telegram Bot API文档](https://core.telegram.org/bots/api)
   - [TMDB API文档](https://developers.themoviedb.org/3)

---

## 🎉 部署完成

恭喜！您的Telegram TMDB电影请求机器人现在应该已经正常运行了。

**最终检查清单：**
- ✅ Bot响应 `/start` 命令
- ✅ 可以处理 `/request` 命令
- ✅ 重复请求检测正常
- ✅ 状态更新通知工作
- ✅ Google Sheets正确记录数据
- ✅ 定时监控正常运行

享受您的新机器人吧！🤖