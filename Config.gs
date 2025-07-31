// 配置文件 - 请根据实际情况修改这些值

// Telegram Bot配置
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // 从BotFather获取的Bot Token
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Google Sheets配置
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Google Sheets的ID
const SHEET_NAME = 'MovieRequests'; // 工作表名称

// TMDB API配置
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // TMDB API密钥
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// 状态常量
const STATUS = {
  PENDING: '未处理',
  COMPLETED: '已入库', 
  NOT_FOUND: '查无资源'
};

// 表格列映射
const COLUMNS = {
  REQUEST_ID: 1,    // A列
  TMDB_ID: 2,       // B列
  TITLE: 3,         // C列
  TMDB_URL: 4,      // D列
  USER_ID: 5,       // E列
  USER_NAME: 6,     // F列
  REQUEST_TIME: 7,  // G列
  STATUS: 8,        // H列
  UPDATE_TIME: 9    // I列
};

// 消息模板
const MESSAGES = {
  HELP: '使用方法：\n/request [TMDB链接] - 申请电影资源',
  INVALID_URL: '❌ 请提供有效的TMDB电影链接\n格式：https://www.themoviedb.org/movie/[ID]',
  REQUEST_SUCCESS: '✅ 电影申请已提交！\n\n🎬 **{title}**\n📅 发布年份：{year}\n⏰ 申请时间：{time}\n📊 状态：{status}',
  DUPLICATE_REQUEST: '⚠️ 该电影已有人申请过了！\n\n🎬 **{title}**\n👤 最初申请者：{originalUser}\n📅 申请时间：{originalTime}\n📊 当前状态：{status}\n\n请耐心等待入库 😊',
  STATUS_UPDATE: '📢 **状态更新通知**\n\n🎬 **{title}**\n📊 新状态：{status}\n⏰ 更新时间：{time}',
  MOVIE_NOT_FOUND: '❌ 无法获取电影信息，请检查TMDB链接是否正确',
  ERROR: '❌ 处理请求时发生错误，请稍后重试'
};

// 获取配置函数
function getConfig() {
  return {
    BOT_TOKEN,
    SPREADSHEET_ID,
    SHEET_NAME,
    TMDB_API_KEY,
    STATUS,
    COLUMNS,
    MESSAGES
  };
}