/**
 * Telegram Bot 主处理函数
 * 处理来自Telegram的Webhook请求
 */
function doPost(e) {
  try {
    const update = JSON.parse(e.postData.contents);
    
    // 处理消息
    if (update.message) {
      handleMessage(update.message);
    }
    
    return ContentService.createTextOutput('OK');
  } catch (error) {
    console.error('处理Webhook时发生错误:', error);
    return ContentService.createTextOutput('Error');
  }
}

/**
 * 处理Telegram消息
 */
function handleMessage(message) {
  const chatId = message.chat.id;
  const userId = message.from.id;
  const userName = message.from.first_name || '未知用户';
  const text = message.text || '';
  
  console.log(`收到消息: ${text} 来自用户: ${userName} (${userId})`);
  
  // 处理命令
  if (text.startsWith('/start')) {
    sendMessage(chatId, getConfig().MESSAGES.HELP);
  } else if (text.startsWith('/request ')) {
    handleRequestCommand(chatId, userId, userName, text);
  } else if (text === '/request') {
    sendMessage(chatId, getConfig().MESSAGES.INVALID_URL);
  } else {
    sendMessage(chatId, getConfig().MESSAGES.HELP);
  }
}

/**
 * 处理/request命令
 */
function handleRequestCommand(chatId, userId, userName, text) {
  try {
    // 提取TMDB链接
    const tmdbUrl = text.replace('/request ', '').trim();
    
    // 验证和解析TMDB链接
    const tmdbId = parseTmdbUrl(tmdbUrl);
    if (!tmdbId) {
      sendMessage(chatId, getConfig().MESSAGES.INVALID_URL);
      return;
    }
    
    // 获取电影信息
    const movieInfo = getMovieInfo(tmdbId);
    if (!movieInfo) {
      sendMessage(chatId, getConfig().MESSAGES.MOVIE_NOT_FOUND);
      return;
    }
    
    // 检查是否已存在相同的请求
    const existingRequest = findExistingRequest(tmdbId);
    if (existingRequest) {
      // 发送重复请求提醒
      const message = getConfig().MESSAGES.DUPLICATE_REQUEST
        .replace('{title}', movieInfo.title)
        .replace('{originalUser}', existingRequest.userName)
        .replace('{originalTime}', existingRequest.requestTime)
        .replace('{status}', existingRequest.status);
      
      sendMessage(chatId, message);
      return;
    }
    
    // 保存新请求
    const requestId = saveRequest(tmdbId, movieInfo, tmdbUrl, userId, userName);
    
    // 发送成功消息
    const message = getConfig().MESSAGES.REQUEST_SUCCESS
      .replace('{title}', movieInfo.title)
      .replace('{year}', movieInfo.year)
      .replace('{time}', new Date().toLocaleString('zh-CN'))
      .replace('{status}', getConfig().STATUS.PENDING);
    
    sendMessage(chatId, message);
    
    console.log(`新请求已保存: ${movieInfo.title} 由用户 ${userName} 申请`);
    
  } catch (error) {
    console.error('处理请求命令时发生错误:', error);
    sendMessage(chatId, getConfig().MESSAGES.ERROR);
  }
}

/**
 * 发送Telegram消息
 */
function sendMessage(chatId, text) {
  try {
    const url = `${TELEGRAM_API_URL}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (!result.ok) {
      console.error('发送消息失败:', result);
    }
    
    return result.ok;
  } catch (error) {
    console.error('发送消息时发生错误:', error);
    return false;
  }
}

/**
 * 设置Webhook (手动运行此函数来设置Webhook)
 */
function setWebhook() {
  const webAppUrl = 'YOUR_WEB_APP_URL_HERE'; // 替换为您的Web应用URL
  const url = `${TELEGRAM_API_URL}/setWebhook`;
  
  const payload = {
    url: webAppUrl
  };
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    console.log('Webhook设置结果:', result);
    return result;
  } catch (error) {
    console.error('设置Webhook时发生错误:', error);
    return null;
  }
}

/**
 * 测试函数 - 检查Bot状态
 */
function testBot() {
  const url = `${TELEGRAM_API_URL}/getMe`;
  
  try {
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    console.log('Bot信息:', result);
    return result;
  } catch (error) {
    console.error('测试Bot时发生错误:', error);
    return null;
  }
}