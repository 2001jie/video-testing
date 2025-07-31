/**
 * 重写版本 - Telegram Bot 主处理代码
 * 简化逻辑，增加详细日志，确保可靠性
 */

/**
 * 处理 Telegram Webhook 请求
 */
function doPost(e) {
  console.log('🚀 收到 Webhook 请求，时间:', new Date().toLocaleString('zh-CN'));
  
  try {
    // 验证配置
    if (!validateConfig()) {
      console.error('❌ 配置验证失败');
      return ContentService.createTextOutput('Config Error');
    }
    
    // 检查请求数据
    if (!e || !e.postData || !e.postData.contents) {
      console.error('❌ 无效的请求数据');
      return ContentService.createTextOutput('No Data');
    }
    
    console.log('📥 原始请求数据:', e.postData.contents);
    
    // 解析 JSON
    let update;
    try {
      update = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('❌ JSON 解析失败:', parseError);
      return ContentService.createTextOutput('Parse Error');
    }
    
    console.log('📋 解析后的更新:', JSON.stringify(update, null, 2));
    
    // 处理消息
    if (update.message && update.message.text) {
      console.log('💬 开始处理消息');
      processMessage(update.message);
    } else {
      console.log('ℹ️ 非文本消息，忽略');
    }
    
    return ContentService.createTextOutput('OK');
    
  } catch (error) {
    console.error('💥 doPost 处理错误:', error);
    console.error('📍 错误堆栈:', error.stack);
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}

/**
 * 处理单条消息
 */
function processMessage(message) {
  console.log('🔄 处理消息开始');
  
  const chatId = message.chat.id;
  const userId = message.from.id;
  const userName = message.from.first_name || '未知用户';
  const text = message.text.trim();
  
  console.log(`👤 用户信息: ${userName} (${userId})`);
  console.log(`💬 消息内容: "${text}"`);
  console.log(`🗨️ 聊天ID: ${chatId}`);
  
  try {
    if (text === '/start' || text === '/help') {
      console.log('📖 处理帮助命令');
      sendTelegramMessage(chatId, MSG_HELP);
      
    } else if (text.startsWith('/request ')) {
      console.log('🎬 处理电影请求命令');
      handleMovieRequest(chatId, userId, userName, text);
      
    } else if (text === '/request') {
      console.log('❌ 空的请求命令');
      sendTelegramMessage(chatId, MSG_INVALID_URL);
      
    } else {
      console.log('❓ 未知命令，显示帮助');
      sendTelegramMessage(chatId, MSG_HELP);
    }
    
  } catch (error) {
    console.error('💥 处理消息错误:', error);
    sendTelegramMessage(chatId, MSG_ERROR);
  }
  
  console.log('✅ 消息处理完成');
}

/**
 * 处理电影请求
 */
function handleMovieRequest(chatId, userId, userName, text) {
  console.log('🎯 开始处理电影请求');
  
  try {
    // 提取链接
    const url = text.replace('/request ', '').trim();
    console.log('🔗 提取的链接:', url);
    
    // 解析 TMDB ID
    const movieId = extractTmdbId(url);
    if (!movieId) {
      console.log('❌ 链接解析失败');
      sendTelegramMessage(chatId, MSG_INVALID_URL);
      return;
    }
    console.log('🆔 解析的电影ID:', movieId);
    
    // 获取电影信息
    const movieInfo = fetchMovieInfo(movieId);
    if (!movieInfo) {
      console.log('❌ 电影信息获取失败');
      sendTelegramMessage(chatId, MSG_MOVIE_NOT_FOUND);
      return;
    }
    console.log('🎬 电影信息:', movieInfo.title, '(' + movieInfo.year + ')');
    
    // 检查重复
    const existingRequest = checkDuplicateRequest(movieId);
    if (existingRequest) {
      console.log('⚠️ 发现重复请求');
      const message = MSG_DUPLICATE
        .replace('{title}', movieInfo.title)
        .replace('{user}', existingRequest.userName)
        .replace('{time}', existingRequest.requestTime)
        .replace('{status}', existingRequest.status);
      
      sendTelegramMessage(chatId, message);
      return;
    }
    
    // 保存请求
    const saved = saveMovieRequest(movieId, movieInfo, url, userId, userName);
    if (!saved) {
      console.log('❌ 保存请求失败');
      sendTelegramMessage(chatId, MSG_ERROR);
      return;
    }
    
    // 发送成功消息
    const successMessage = MSG_SUCCESS
      .replace('{title}', movieInfo.title)
      .replace('{year}', movieInfo.year)
      .replace('{time}', new Date().toLocaleString('zh-CN'));
    
    sendTelegramMessage(chatId, successMessage);
    console.log('✅ 电影请求处理完成');
    
  } catch (error) {
    console.error('💥 处理电影请求错误:', error);
    sendTelegramMessage(chatId, MSG_ERROR);
  }
}

/**
 * 发送 Telegram 消息
 */
function sendTelegramMessage(chatId, text) {
  console.log('📤 发送消息到:', chatId);
  console.log('📝 消息内容:', text.substring(0, 100) + '...');
  
  try {
    const url = `${TELEGRAM_API_URL}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    };
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      console.log('✅ 消息发送成功');
      return true;
    } else {
      console.error('❌ 消息发送失败:', result);
      return false;
    }
    
  } catch (error) {
    console.error('💥 发送消息错误:', error);
    return false;
  }
}

/**
 * 提取 TMDB 电影 ID
 */
function extractTmdbId(url) {
  console.log('🔍 解析 TMDB 链接:', url);
  
  if (!url) return null;
  
  // 支持的格式
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?themoviedb\.org\/movie\/(\d+)/i,
    /tmdb\.org\/movie\/(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('✅ 成功解析 ID:', match[1]);
      return match[1];
    }
  }
  
  console.log('❌ 无法解析链接');
  return null;
}

/**
 * 获取电影信息
 */
function fetchMovieInfo(movieId) {
  console.log('🎬 获取电影信息:', movieId);
  
  try {
    const url = `${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=zh-CN`;
    console.log('🌐 请求 URL:', url.replace(TMDB_API_KEY, '***'));
    
    const response = UrlFetchApp.fetch(url);
    
    if (response.getResponseCode() !== 200) {
      console.error('❌ TMDB API 请求失败:', response.getResponseCode());
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    
    const movieInfo = {
      id: data.id,
      title: data.title || data.original_title,
      year: data.release_date ? new Date(data.release_date).getFullYear() : '未知',
      overview: data.overview || ''
    };
    
    console.log('✅ 电影信息获取成功:', movieInfo.title);
    return movieInfo;
    
  } catch (error) {
    console.error('💥 获取电影信息错误:', error);
    return null;
  }
}

/**
 * 设置 Webhook
 */
function setWebhook() {
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbwGYTlUETIJrPFKBUTAnnIY_OXh6hhlsVQUWSoq4PphxuQkoOQgihdSoImVrZXdmChC/exec';
  
  if (!webAppUrl || webAppUrl === 'YOUR_WEB_APP_URL_HERE') {
    console.error('❌ 请先设置 Web 应用 URL');
    console.log('📝 步骤：');
    console.log('1. 部署为Web应用');
    console.log('2. 复制Web应用URL');
    console.log('3. 替换此函数中的webAppUrl值');
    console.log('4. 重新运行此函数');
    return;
  }
  
  console.log('🔗 设置 Webhook:', webAppUrl);
  
  try {
    const url = `${TELEGRAM_API_URL}/setWebhook`;
    const payload = { url: webAppUrl };
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    console.log('📋 Webhook 设置结果:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      console.log('✅ Webhook 设置成功！');
      console.log('🔗 URL:', webAppUrl);
      
      // 立即验证Webhook状态
      console.log('\n🔍 验证Webhook状态...');
      Utilities.sleep(2000);
      testWebhookStatus();
      
    } else {
      console.log('❌ Webhook 设置失败');
      console.log('错误信息:', result.description);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 设置 Webhook 错误:', error);
    return null;
  }
}

/**
 * 删除现有Webhook（用于重置）
 */
function deleteWebhook() {
  console.log('🗑️ 删除现有Webhook');
  
  try {
    const url = `${TELEGRAM_API_URL}/deleteWebhook`;
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    console.log('📋 删除结果:', result);
    
    if (result.ok) {
      console.log('✅ Webhook 删除成功');
    } else {
      console.log('❌ Webhook 删除失败:', result.description);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 删除 Webhook 错误:', error);
    return null;
  }
}

/**
 * 修复Webhook问题的完整流程
 */
function fixWebhookIssue() {
  console.log('🔧 开始修复Webhook问题');
  
  // 步骤1：删除现有Webhook
  console.log('\n1️⃣ 删除现有Webhook');
  deleteWebhook();
  
  // 步骤2：等待几秒
  console.log('\n2️⃣ 等待清理完成...');
  Utilities.sleep(3000);
  
  // 步骤3：检查当前状态
  console.log('\n3️⃣ 检查当前状态');
  testWebhookStatus();
  
  console.log('\n✅ 清理完成！');
  console.log('📝 接下来请：');
  console.log('1. 重新部署Web应用');
  console.log('2. 复制新的Web应用URL');
  console.log('3. 更新setWebhook函数中的URL');
  console.log('4. 运行setWebhook()');
}

/**
 * 测试 Bot 连接
 */
function testBot() {
  console.log('🧪 测试 Bot 连接');
  
  try {
    const url = `${TELEGRAM_API_URL}/getMe`;
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      console.log('✅ Bot 连接正常:', result.result.username);
    } else {
      console.log('❌ Bot 连接失败:', result);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 测试 Bot 错误:', error);
    return null;
  }
}

/**
 * 测试Web应用是否可以正常访问
 */
function testWebAppAccess() {
  console.log('🌐 测试Web应用访问');
  
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbwGYTlUETIJrPFKBUTAnnIY_OXh6hhlsVQUWSoq4PphxuQkoOQgihdSoImVrZXdmChC/exec';
  
  if (!webAppUrl || webAppUrl === 'YOUR_WEB_APP_URL_HERE') {
    console.error('❌ 请先设置Web应用URL');
    return false;
  }
  
  try {
    console.log('🔗 测试URL:', webAppUrl);
    
    // 模拟一个简单的GET请求
    const response = UrlFetchApp.fetch(webAppUrl, {
      method: 'GET',
      muteHttpExceptions: true
    });
    
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    console.log('📊 响应代码:', responseCode);
    console.log('📝 响应内容:', responseText.substring(0, 200));
    
    if (responseCode === 200) {
      console.log('✅ Web应用访问正常');
      return true;
    } else if (responseCode === 302) {
      console.log('❌ 发现302重定向问题');
      console.log('🔧 请检查以下设置：');
      console.log('1. Web应用权限是否设置为"任何人"');
      console.log('2. 是否使用了最新的部署URL');
      console.log('3. 是否正确部署为Web应用');
      return false;
    } else {
      console.log('⚠️ 意外的响应代码:', responseCode);
      return false;
    }
    
  } catch (error) {
    console.error('💥 测试Web应用访问错误:', error);
    return false;
  }
}

/**
 * 获取正确的doPost测试函数
 */
function testDoPostFunction() {
  console.log('🧪 测试doPost函数');
  
  // 模拟Telegram发送的数据
  const mockPostData = {
    postData: {
      contents: JSON.stringify({
        message: {
          message_id: 123,
          from: {
            id: 123456789,
            first_name: "测试用户",
            username: "testuser"
          },
          chat: {
            id: 123456789,
            type: "private"
          },
          date: Math.floor(Date.now() / 1000),
          text: "/start"
        }
      })
    }
  };
  
  try {
    console.log('📥 模拟POST请求');
    const result = doPost(mockPostData);
    console.log('📤 doPost响应:', result.getContent());
    
    if (result.getContent() === 'OK') {
      console.log('✅ doPost函数工作正常');
      return true;
    } else {
      console.log('⚠️ doPost响应异常');
      return false;
    }
    
  } catch (error) {
    console.error('💥 测试doPost错误:', error);
    return false;
  }
}

/**
 * 完整的Webhook问题诊断
 */
function diagnoseWebhookIssue() {
  console.log('🔍 开始Webhook问题诊断');
  console.log('='.repeat(50));
  
  // 1. 测试doPost函数
  console.log('\n1️⃣ 测试doPost函数');
  const doPostOk = testDoPostFunction();
  
  // 2. 测试Web应用访问
  console.log('\n2️⃣ 测试Web应用访问');
  const webAppOk = testWebAppAccess();
  
  // 3. 检查Webhook状态
  console.log('\n3️⃣ 检查Webhook状态');
  const webhookInfo = testWebhookStatus();
  
  // 4. 总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 诊断结果:');
  console.log('doPost函数:', doPostOk ? '✅ 正常' : '❌ 异常');
  console.log('Web应用访问:', webAppOk ? '✅ 正常' : '❌ 异常');
  console.log('Webhook状态:', webhookInfo ? '✅ 设置' : '❌ 未设置');
  
  if (!webAppOk) {
    console.log('\n🎯 建议操作:');
    console.log('1. 重新部署Web应用');
    console.log('2. 确保权限设置为"任何人"');
    console.log('3. 使用新的部署URL');
    console.log('4. 重新设置Webhook');
  }
  
  return doPostOk && webAppOk;
}

/**
 * 清理所有待处理的更新
 */
function clearPendingUpdates() {
  console.log('🧹 清理待处理更新');
  
  try {
    // 方法1：删除Webhook，这会清理所有待处理的更新
    console.log('1️⃣ 删除Webhook以清理待处理更新');
    const deleteResult = deleteWebhook();
    
    if (deleteResult && deleteResult.ok) {
      console.log('✅ Webhook删除成功，待处理更新已清理');
      
      // 等待几秒让清理生效
      Utilities.sleep(3000);
      
      // 重新设置Webhook
      console.log('2️⃣ 重新设置Webhook');
      const setResult = setWebhook();
      
      if (setResult && setResult.ok) {
        console.log('✅ Webhook重新设置成功');
        
        // 验证清理效果
        Utilities.sleep(2000);
        console.log('3️⃣ 验证清理效果');
        testWebhookStatus();
        
      } else {
        console.log('❌ Webhook重新设置失败');
      }
      
    } else {
      console.log('❌ Webhook删除失败');
    }
    
  } catch (error) {
    console.error('💥 清理待处理更新错误:', error);
  }
}

/**
 * 获取待处理更新（仅查看，不处理）
 */
function getUpdates() {
  console.log('📥 获取待处理更新');
  
  try {
    const url = `${TELEGRAM_API_URL}/getUpdates`;
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      console.log('📊 待处理更新数量:', result.result.length);
      
      if (result.result.length > 0) {
        console.log('📋 最新更新:');
        result.result.slice(-3).forEach((update, index) => {
          console.log(`${index + 1}. Update ID: ${update.update_id}`);
          if (update.message) {
            console.log(`   消息: ${update.message.text || '(非文本)'}`);
            console.log(`   用户: ${update.message.from.first_name}`);
          }
        });
      }
      
      return result.result;
    } else {
      console.log('❌ 获取更新失败:', result);
      return [];
    }
    
  } catch (error) {
    console.error('💥 获取更新错误:', error);
    return [];
  }
}