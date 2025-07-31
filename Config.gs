/**
 * 配置文件 - 请替换为您的实际值
 * 重要：请确保所有配置项都正确填写
 */

// ========== 必须配置的项目 ==========
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';        // 从 @BotFather 获取
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';  // Google Sheets ID
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';   // TMDB API 密钥

// ========== 基础配置 ==========
const SHEET_NAME = 'MovieRequests';              // 工作表名称
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// ========== 状态定义 ==========
const STATUS_PENDING = '未处理';
const STATUS_COMPLETED = '已入库';
const STATUS_NOT_FOUND = '查无资源';

// ========== 消息模板 ==========
const MSG_HELP = `🎬 *TMDB电影请求机器人*

使用方法：
/request [TMDB链接] - 申请电影资源

示例：
\`/request https://www.themoviedb.org/movie/550\`

支持的链接格式：
• https://www.themoviedb.org/movie/123456
• https://themoviedb.org/movie/123456`;

const MSG_INVALID_URL = `❌ *链接格式错误*

请提供有效的TMDB电影链接
格式：https://www.themoviedb.org/movie/[ID]

示例：
\`/request https://www.themoviedb.org/movie/550\``;

const MSG_SUCCESS = `✅ *电影申请已提交*

🎬 **{title}**
📅 年份：{year}
⏰ 申请时间：{time}
📊 状态：${STATUS_PENDING}

我们会尽快处理您的请求！`;

const MSG_DUPLICATE = `⚠️ *该电影已有人申请*

🎬 **{title}**
👤 申请者：{user}
📅 申请时间：{time}
📊 当前状态：{status}

请耐心等待处理 😊`;

const MSG_STATUS_UPDATE = `📢 *状态更新通知*

🎬 **{title}**
📊 新状态：{status}
⏰ 更新时间：{time}`;

const MSG_ERROR = `❌ *处理失败*

请稍后重试，或联系管理员`;

const MSG_MOVIE_NOT_FOUND = `❌ *无法获取电影信息*

请检查TMDB链接是否正确`;

// ========== 验证配置函数 ==========
function validateConfig() {
  const errors = [];
  
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || !BOT_TOKEN) {
    errors.push('Bot Token 未配置');
  }
  
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || !SPREADSHEET_ID) {
    errors.push('Spreadsheet ID 未配置');
  }
  
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE' || !TMDB_API_KEY) {
    errors.push('TMDB API Key 未配置');
  }
  
  if (errors.length > 0) {
    console.error('配置错误:', errors.join(', '));
    return false;
  }
  
  console.log('✅ 配置验证通过');
  return true;
}

// ========== 获取配置函数 ==========
function getConfig() {
  return {
    BOT_TOKEN,
    SPREADSHEET_ID,
    SHEET_NAME,
    TMDB_API_KEY,
    TELEGRAM_API_URL,
    TMDB_API_URL,
    STATUS_PENDING,
    STATUS_COMPLETED,
    STATUS_NOT_FOUND,
    MSG_HELP,
    MSG_INVALID_URL,
    MSG_SUCCESS,
    MSG_DUPLICATE,
    MSG_STATUS_UPDATE,
    MSG_ERROR,
    MSG_MOVIE_NOT_FOUND
  };
}