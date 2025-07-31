/**
 * 简化版 Google Sheets 操作
 * 专注于核心功能，减少复杂性
 */

/**
 * 获取或创建工作表
 */
function getOrCreateSheet() {
  console.log('📊 获取工作表');
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('📋 创建新工作表');
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      setupSheetHeaders(sheet);
    }
    
    console.log('✅ 工作表获取成功:', sheet.getName());
    return sheet;
    
  } catch (error) {
    console.error('💥 获取工作表错误:', error);
    return null;
  }
}

/**
 * 设置表格标题行
 */
function setupSheetHeaders(sheet) {
  console.log('📝 设置表格标题');
  
  const headers = [
    '请求ID',      // A
    'TMDB ID',     // B  
    '电影标题',     // C
    'TMDB链接',    // D
    '用户ID',      // E
    '用户姓名',     // F
    '请求时间',     // G
    '状态',        // H
    '更新时间'     // I
  ];
  
  // 设置标题行
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 设置样式
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  // 自动调整列宽
  sheet.autoResizeColumns(1, headers.length);
  
  console.log('✅ 表格标题设置完成');
}

/**
 * 检查重复请求
 */
function checkDuplicateRequest(movieId) {
  console.log('🔍 检查重复请求:', movieId);
  
  try {
    const sheet = getOrCreateSheet();
    if (!sheet) return null;
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('📋 表格为空，无重复');
      return null;
    }
    
    // 获取所有数据（从第2行开始）
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const tmdbId = row[1]; // B列：TMDB ID
      
      if (tmdbId == movieId) {
        console.log('⚠️ 发现重复请求');
        return {
          requestId: row[0],     // A列：请求ID
          tmdbId: row[1],        // B列：TMDB ID
          title: row[2],         // C列：电影标题
          tmdbUrl: row[3],       // D列：TMDB链接
          userId: row[4],        // E列：用户ID
          userName: row[5],      // F列：用户姓名
          requestTime: row[6],   // G列：请求时间
          status: row[7],        // H列：状态
          updateTime: row[8]     // I列：更新时间
        };
      }
    }
    
    console.log('✅ 无重复请求');
    return null;
    
  } catch (error) {
    console.error('💥 检查重复请求错误:', error);
    return null;
  }
}

/**
 * 保存电影请求
 */
function saveMovieRequest(movieId, movieInfo, tmdbUrl, userId, userName) {
  console.log('💾 保存电影请求');
  
  try {
    const sheet = getOrCreateSheet();
    if (!sheet) {
      console.error('❌ 无法获取工作表');
      return false;
    }
    
    const requestId = generateRequestId();
    const currentTime = new Date().toLocaleString('zh-CN');
    
    const newRow = [
      requestId,              // A列：请求ID
      movieId,               // B列：TMDB ID
      movieInfo.title,       // C列：电影标题
      tmdbUrl,               // D列：TMDB链接
      userId,                // E列：用户ID
      userName,              // F列：用户姓名
      currentTime,           // G列：请求时间
      STATUS_PENDING,        // H列：状态
      currentTime            // I列：更新时间
    ];
    
    sheet.appendRow(newRow);
    
    console.log('✅ 请求保存成功:', requestId);
    return true;
    
  } catch (error) {
    console.error('💥 保存请求错误:', error);
    return false;
  }
}

/**
 * 生成请求ID
 */
function generateRequestId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `REQ_${timestamp}_${random}`;
}

/**
 * 获取特定电影的所有请求用户
 */
function getUsersForMovie(movieId) {
  console.log('👥 获取电影相关用户:', movieId);
  
  try {
    const sheet = getOrCreateSheet();
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const users = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const tmdbId = row[1]; // B列：TMDB ID
      
      if (tmdbId == movieId) {
        users.push({
          userId: row[4],      // E列：用户ID
          userName: row[5]     // F列：用户姓名
        });
      }
    }
    
    console.log(`📊 找到 ${users.length} 个相关用户`);
    return users;
    
  } catch (error) {
    console.error('💥 获取用户列表错误:', error);
    return [];
  }
}

/**
 * 更新电影状态
 */
function updateMovieStatus(movieId, newStatus) {
  console.log('🔄 更新电影状态:', movieId, '->', newStatus);
  
  try {
    const sheet = getOrCreateSheet();
    if (!sheet) return false;
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return false;
    
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const currentTime = new Date().toLocaleString('zh-CN');
    let updated = false;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const tmdbId = row[1]; // B列：TMDB ID
      
      if (tmdbId == movieId) {
        const rowNum = i + 2; // 实际行号（+1表头 +1索引）
        
        // 更新状态（H列）和更新时间（I列）
        sheet.getRange(rowNum, 8).setValue(newStatus);
        sheet.getRange(rowNum, 9).setValue(currentTime);
        
        updated = true;
        console.log(`✅ 更新第 ${rowNum} 行状态`);
      }
    }
    
    if (updated) {
      console.log('✅ 状态更新完成');
    } else {
      console.log('⚠️ 未找到要更新的记录');
    }
    
    return updated;
    
  } catch (error) {
    console.error('💥 更新状态错误:', error);
    return false;
  }
}

/**
 * 获取所有待处理请求
 */
function getPendingRequests() {
  console.log('📋 获取待处理请求');
  
  try {
    const sheet = getOrCreateSheet();
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    const pending = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const status = row[7]; // H列：状态
      
      if (status === STATUS_PENDING) {
        pending.push({
          requestId: row[0],     // A列：请求ID
          tmdbId: row[1],        // B列：TMDB ID
          title: row[2],         // C列：电影标题
          tmdbUrl: row[3],       // D列：TMDB链接
          userId: row[4],        // E列：用户ID
          userName: row[5],      // F列：用户姓名
          requestTime: row[6]    // G列：请求时间
        });
      }
    }
    
    console.log(`📊 找到 ${pending.length} 个待处理请求`);
    return pending;
    
  } catch (error) {
    console.error('💥 获取待处理请求错误:', error);
    return [];
  }
}

/**
 * 测试工作表连接
 */
function testSheetConnection() {
  console.log('🧪 测试工作表连接');
  
  try {
    const sheet = getOrCreateSheet();
    if (sheet) {
      console.log('✅ 工作表连接正常');
      console.log('📊 工作表名称:', sheet.getName());
      console.log('📊 当前行数:', sheet.getLastRow());
      console.log('📊 当前列数:', sheet.getLastColumn());
      return true;
    } else {
      console.log('❌ 工作表连接失败');
      return false;
    }
  } catch (error) {
    console.error('💥 测试工作表连接错误:', error);
    return false;
  }
}