/**
 * 调试工具函数
 * 用于排查Bot问题和测试各个组件
 */

/**
 * 调试Webhook接收情况
 * 在doPost函数中添加详细日志
 */
function debugDoPost(testData) {
  console.log('=== 开始调试doPost函数 ===');
  
  // 模拟测试数据
  const mockUpdate = testData || {
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
      text: "/request https://www.themoviedb.org/movie/550"
    }
  };
  
  console.log('模拟接收到的更新:', JSON.stringify(mockUpdate, null, 2));
  
  try {
    // 测试消息处理
    if (mockUpdate.message) {
      console.log('开始处理消息...');
      handleMessage(mockUpdate.message);
    }
  } catch (error) {
    console.error('处理消息时发生错误:', error);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== doPost调试完成 ===');
}

/**
 * 调试handleMessage函数
 */
function debugHandleMessage() {
  console.log('=== 开始调试handleMessage函数 ===');
  
  const testMessage = {
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
    text: "/request https://www.themoviedb.org/movie/550"
  };
  
  console.log('测试消息:', JSON.stringify(testMessage, null, 2));
  
  try {
    handleMessage(testMessage);
  } catch (error) {
    console.error('handleMessage错误:', error);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== handleMessage调试完成 ===');
}

/**
 * 调试handleRequestCommand函数
 */
function debugHandleRequestCommand() {
  console.log('=== 开始调试handleRequestCommand函数 ===');
  
  const chatId = 123456789;
  const userId = 123456789;
  const userName = "测试用户";
  const text = "/request https://www.themoviedb.org/movie/550";
  
  console.log('测试参数:');
  console.log('chatId:', chatId);
  console.log('userId:', userId);
  console.log('userName:', userName);
  console.log('text:', text);
  
  try {
    handleRequestCommand(chatId, userId, userName, text);
  } catch (error) {
    console.error('handleRequestCommand错误:', error);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== handleRequestCommand调试完成 ===');
}

/**
 * 测试TMDB链接解析
 */
function debugTmdbParsing() {
  console.log('=== 开始调试TMDB链接解析 ===');
  
  const testUrls = [
    'https://www.themoviedb.org/movie/550',
    'https://www.themoviedb.org/movie/550-fight-club',
    'https://themoviedb.org/movie/550',
    'www.themoviedb.org/movie/550',
    'themoviedb.org/movie/550'
  ];
  
  testUrls.forEach(url => {
    console.log(`测试URL: ${url}`);
    const movieId = parseTmdbUrl(url);
    console.log(`解析结果: ${movieId}`);
    console.log('---');
  });
  
  console.log('=== TMDB链接解析调试完成 ===');
}

/**
 * 测试TMDB API调用
 */
function debugTmdbApi() {
  console.log('=== 开始调试TMDB API ===');
  
  // 验证API密钥
  console.log('验证TMDB API密钥...');
  const apiValid = validateTmdbApiKey();
  console.log('API密钥有效:', apiValid);
  
  if (apiValid) {
    // 测试获取电影信息
    console.log('测试获取电影信息...');
    const movieInfo = getMovieInfo('550'); // Fight Club
    if (movieInfo) {
      console.log('电影信息获取成功:');
      console.log('标题:', movieInfo.title);
      console.log('年份:', movieInfo.year);
      console.log('简介:', movieInfo.overview ? movieInfo.overview.substring(0, 100) + '...' : '无');
    } else {
      console.log('电影信息获取失败');
    }
  }
  
  console.log('=== TMDB API调试完成 ===');
}

/**
 * 测试Google Sheets操作
 */
function debugSheetsOperations() {
  console.log('=== 开始调试Google Sheets操作 ===');
  
  try {
    // 测试获取工作表
    console.log('测试获取工作表...');
    const sheet = getSheet();
    if (sheet) {
      console.log('工作表获取成功:', sheet.getName());
      console.log('当前行数:', sheet.getLastRow());
      console.log('当前列数:', sheet.getLastColumn());
    } else {
      console.log('工作表获取失败');
      return;
    }
    
    // 测试查找现有请求
    console.log('测试查找现有请求...');
    const existingRequest = findExistingRequest('550');
    if (existingRequest) {
      console.log('找到现有请求:', existingRequest.title);
    } else {
      console.log('未找到现有请求');
    }
    
    // 测试保存请求（使用模拟数据）
    console.log('测试保存请求...');
    const mockMovieInfo = {
      title: '测试电影',
      year: '2023',
      overview: '这是一个测试电影'
    };
    
    try {
      const requestId = saveRequest('999999', mockMovieInfo, 'https://test.com', '123456789', '测试用户');
      console.log('请求保存成功，ID:', requestId);
    } catch (error) {
      console.error('保存请求失败:', error);
    }
    
  } catch (error) {
    console.error('Google Sheets操作错误:', error);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== Google Sheets操作调试完成 ===');
}

/**
 * 测试发送消息功能
 */
function debugSendMessage() {
  console.log('=== 开始调试发送消息功能 ===');
  
  // 注意：这里需要一个真实的chat ID来测试
  const testChatId = 'YOUR_CHAT_ID_HERE'; // 替换为您的Telegram chat ID
  
  if (testChatId === 'YOUR_CHAT_ID_HERE') {
    console.log('请先设置有效的chat ID进行测试');
    return;
  }
  
  const testMessage = '🧪 这是一条测试消息\n\n如果您收到这条消息，说明发送功能正常工作！';
  
  try {
    const success = sendMessage(testChatId, testMessage);
    console.log('消息发送结果:', success);
  } catch (error) {
    console.error('发送消息错误:', error);
  }
  
  console.log('=== 发送消息功能调试完成 ===');
}

/**
 * 检查配置是否正确
 */
function debugConfiguration() {
  console.log('=== 开始检查配置 ===');
  
  const config = getConfig();
  
  console.log('Bot Token配置:', config.BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' ? '✅ 已配置' : '❌ 未配置');
  console.log('Spreadsheet ID配置:', config.SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE' ? '✅ 已配置' : '❌ 未配置');
  console.log('TMDB API Key配置:', config.TMDB_API_KEY !== 'YOUR_TMDB_API_KEY_HERE' ? '✅ 已配置' : '❌ 未配置');
  
  // 检查各项服务连接
  console.log('\n检查服务连接:');
  
  // Bot连接
  try {
    const botInfo = testBot();
    console.log('Bot连接:', botInfo && botInfo.ok ? '✅ 正常' : '❌ 异常');
  } catch (error) {
    console.log('Bot连接: ❌ 错误 -', error.message);
  }
  
  // TMDB连接
  try {
    const tmdbValid = validateTmdbApiKey();
    console.log('TMDB连接:', tmdbValid ? '✅ 正常' : '❌ 异常');
  } catch (error) {
    console.log('TMDB连接: ❌ 错误 -', error.message);
  }
  
  // Sheets连接
  try {
    const sheetValid = testSheetConnection();
    console.log('Sheets连接:', sheetValid ? '✅ 正常' : '❌ 异常');
  } catch (error) {
    console.log('Sheets连接: ❌ 错误 -', error.message);
  }
  
  console.log('=== 配置检查完成 ===');
}

/**
 * 完整的系统诊断
 */
function fullSystemDiagnosis() {
  console.log('🔍 开始完整系统诊断...\n');
  
  debugConfiguration();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugTmdbParsing();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugTmdbApi();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugSheetsOperations();
  console.log('\n' + '='.repeat(50) + '\n');
  
  debugHandleRequestCommand();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ 系统诊断完成！请查看上述日志找出问题所在。');
}

/**
 * 检查Webhook状态
 */
function debugWebhook() {
  console.log('=== 开始检查Webhook状态 ===');
  
  try {
    const url = `${TELEGRAM_API_URL}/getWebhookInfo`;
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    console.log('Webhook信息:', JSON.stringify(result, null, 2));
    
    if (result.ok) {
      const info = result.result;
      console.log('Webhook URL:', info.url || '未设置');
      console.log('待处理更新数量:', info.pending_update_count || 0);
      console.log('最后错误日期:', info.last_error_date ? new Date(info.last_error_date * 1000) : '无');
      console.log('最后错误消息:', info.last_error_message || '无');
    }
    
  } catch (error) {
    console.error('检查Webhook状态时发生错误:', error);
  }
  
  console.log('=== Webhook状态检查完成 ===');
}