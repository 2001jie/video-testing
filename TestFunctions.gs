/**
 * 测试函数集合
 * 用于逐步验证每个组件是否正常工作
 */

/**
 * 🧪 完整系统测试
 * 运行所有测试，输出详细报告
 */
function runAllTests() {
  console.log('🚀 开始完整系统测试');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(50));
  
  const results = {
    config: false,
    bot: false,
    tmdb: false,
    sheets: false,
    webhook: false
  };
  
  // 1. 配置测试
  console.log('\n📋 1. 配置测试');
  results.config = testConfiguration();
  
  // 2. Bot连接测试
  console.log('\n🤖 2. Bot连接测试');
  results.bot = testBotConnection();
  
  // 3. TMDB API测试
  console.log('\n🎬 3. TMDB API测试');
  results.tmdb = testTmdbConnection();
  
  // 4. Google Sheets测试
  console.log('\n📊 4. Google Sheets测试');
  results.sheets = testSheetsConnection();
  
  // 5. Webhook状态测试
  console.log('\n🔗 5. Webhook状态测试');
  results.webhook = testWebhookStatus();
  
  // 输出测试报告
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试报告:');
  console.log('配置验证:', results.config ? '✅ 通过' : '❌ 失败');
  console.log('Bot连接:', results.bot ? '✅ 通过' : '❌ 失败');
  console.log('TMDB API:', results.tmdb ? '✅ 通过' : '❌ 失败');
  console.log('Google Sheets:', results.sheets ? '✅ 通过' : '❌ 失败');
  console.log('Webhook状态:', results.webhook ? '✅ 通过' : '❌ 失败');
  
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！系统应该可以正常工作');
  } else {
    console.log('⚠️ 部分测试失败，请检查失败项目的配置');
  }
  
  return results;
}

/**
 * 📋 测试配置
 */
function testConfiguration() {
  console.log('检查配置项...');
  
  try {
    const isValid = validateConfig();
    
    if (isValid) {
      console.log('✅ 配置验证通过');
      
      // 显示配置摘要（隐藏敏感信息）
      console.log('Bot Token:', BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : '未配置');
      console.log('Spreadsheet ID:', SPREADSHEET_ID ? `${SPREADSHEET_ID.substring(0, 10)}...` : '未配置');
      console.log('TMDB API Key:', TMDB_API_KEY ? `${TMDB_API_KEY.substring(0, 10)}...` : '未配置');
      
      return true;
    } else {
      console.log('❌ 配置验证失败');
      return false;
    }
    
  } catch (error) {
    console.error('💥 配置测试错误:', error);
    return false;
  }
}

/**
 * 🤖 测试Bot连接
 */
function testBotConnection() {
  console.log('测试Bot连接...');
  
  try {
    const result = testBot();
    
    if (result && result.ok) {
      console.log('✅ Bot连接正常');
      console.log('Bot用户名:', result.result.username);
      console.log('Bot ID:', result.result.id);
      return true;
    } else {
      console.log('❌ Bot连接失败');
      if (result) {
        console.log('错误信息:', result.description);
      }
      return false;
    }
    
  } catch (error) {
    console.error('💥 Bot连接测试错误:', error);
    return false;
  }
}

/**
 * 🎬 测试TMDB连接
 */
function testTmdbConnection() {
  console.log('测试TMDB API连接...');
  
  try {
    // 测试获取电影信息（使用知名电影：搏击俱乐部）
    const movieInfo = fetchMovieInfo('550');
    
    if (movieInfo && movieInfo.title) {
      console.log('✅ TMDB API连接正常');
      console.log('测试电影:', movieInfo.title, '(' + movieInfo.year + ')');
      return true;
    } else {
      console.log('❌ TMDB API连接失败');
      console.log('请检查API密钥是否正确');
      return false;
    }
    
  } catch (error) {
    console.error('💥 TMDB连接测试错误:', error);
    return false;
  }
}

/**
 * 📊 测试Google Sheets连接
 */
function testSheetsConnection() {
  console.log('测试Google Sheets连接...');
  
  try {
    const result = testSheetConnection();
    return result;
    
  } catch (error) {
    console.error('💥 Sheets连接测试错误:', error);
    return false;
  }
}

/**
 * 🔗 测试Webhook状态
 */
function testWebhookStatus() {
  console.log('检查Webhook状态...');
  
  try {
    const url = `${TELEGRAM_API_URL}/getWebhookInfo`;
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      const info = result.result;
      console.log('Webhook URL:', info.url || '未设置');
      console.log('待处理更新:', info.pending_update_count || 0);
      
      if (info.last_error_date) {
        console.log('最后错误:', new Date(info.last_error_date * 1000));
        console.log('错误消息:', info.last_error_message);
      }
      
      // 如果有URL设置，认为测试通过
      return !!info.url;
    } else {
      console.log('❌ 获取Webhook信息失败');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Webhook状态测试错误:', error);
    return false;
  }
}

/**
 * 🧪 测试电影请求处理流程
 */
function testMovieRequestFlow() {
  console.log('🎬 测试电影请求处理流程');
  
  const testChatId = 'TEST_CHAT_ID';
  const testUserId = 'TEST_USER_ID'; 
  const testUserName = '测试用户';
  const testText = '/request https://www.themoviedb.org/movie/550';
  
  console.log('模拟处理请求:', testText);
  
  try {
    // 这里不会真正发送消息，只测试处理逻辑
    handleMovieRequest(testChatId, testUserId, testUserName, testText);
    console.log('✅ 请求处理流程测试完成');
    return true;
    
  } catch (error) {
    console.error('💥 请求处理流程测试错误:', error);
    return false;
  }
}

/**
 * 🧪 测试TMDB链接解析
 */
function testTmdbLinkParsing() {
  console.log('🔗 测试TMDB链接解析');
  
  const testUrls = [
    'https://www.themoviedb.org/movie/550',
    'https://www.themoviedb.org/movie/550-fight-club',
    'https://themoviedb.org/movie/550',
    'www.themoviedb.org/movie/550',
    'themoviedb.org/movie/550',
    'invalid-url',
    ''
  ];
  
  let passedTests = 0;
  
  testUrls.forEach((url, index) => {
    const movieId = extractTmdbId(url);
    const expected = (index < 5) ? '550' : null;
    const passed = movieId === expected;
    
    console.log(`测试 ${index + 1}: ${url || '(空)'}`);
    console.log(`结果: ${movieId || '(null)'} - ${passed ? '✅' : '❌'}`);
    
    if (passed) passedTests++;
  });
  
  console.log(`链接解析测试: ${passedTests}/${testUrls.length} 通过`);
  return passedTests === testUrls.length;
}

/**
 * 🧪 测试消息发送（需要真实的chat ID）
 */
function testMessageSending(testChatId) {
  if (!testChatId) {
    console.log('⚠️ 需要提供真实的chat ID来测试消息发送');
    console.log('使用方法: testMessageSending("您的chat ID")');
    return false;
  }
  
  console.log('📤 测试消息发送到:', testChatId);
  
  const testMessage = `🧪 **测试消息**

这是一条测试消息，用于验证Bot是否能正常发送消息。

时间: ${new Date().toLocaleString('zh-CN')}

如果您收到这条消息，说明消息发送功能正常！`;
  
  try {
    const success = sendTelegramMessage(testChatId, testMessage);
    
    if (success) {
      console.log('✅ 测试消息发送成功');
    } else {
      console.log('❌ 测试消息发送失败');
    }
    
    return success;
    
  } catch (error) {
    console.error('💥 消息发送测试错误:', error);
    return false;
  }
}

/**
 * 🧪 快速诊断（仅检查关键配置）
 */
function quickDiagnosis() {
  console.log('⚡ 快速诊断');
  
  const issues = [];
  
  // 检查关键配置
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || !BOT_TOKEN) {
    issues.push('❌ Bot Token 未配置');
  }
  
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || !SPREADSHEET_ID) {
    issues.push('❌ Spreadsheet ID 未配置');
  }
  
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE' || !TMDB_API_KEY) {
    issues.push('❌ TMDB API Key 未配置');
  }
  
  // 输出结果
  if (issues.length === 0) {
    console.log('✅ 关键配置检查通过');
    console.log('建议运行 runAllTests() 进行完整测试');
    return true;
  } else {
    console.log('发现配置问题:');
    issues.forEach(issue => console.log(issue));
    console.log('\n请先修复配置问题，然后重新测试');
    return false;
  }
}

/**
 * 🧪 测试Google Sheets读写
 */
function testSheetsReadWrite() {
  console.log('📊 测试Google Sheets读写功能');
  
  try {
    // 测试保存一个假的请求
    const testMovieInfo = {
      title: '测试电影 - 请删除',
      year: '2023'
    };
    
    const saved = saveMovieRequest('999999', testMovieInfo, 'https://test.com', 'TEST_USER', '测试用户');
    
    if (saved) {
      console.log('✅ 写入测试通过');
      
      // 测试读取
      const duplicate = checkDuplicateRequest('999999');
      if (duplicate) {
        console.log('✅ 读取测试通过');
        console.log('找到测试记录:', duplicate.title);
        return true;
      } else {
        console.log('❌ 读取测试失败');
        return false;
      }
    } else {
      console.log('❌ 写入测试失败');
      return false;
    }
    
  } catch (error) {
    console.error('💥 Sheets读写测试错误:', error);
    return false;
  }
}