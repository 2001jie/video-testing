/**
 * Google Sheets 操作函数
 * 处理所有与Google Sheets相关的数据操作
 */

/**
 * 获取工作表对象
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(getConfig().SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(getConfig().SHEET_NAME);
    
    // 如果工作表不存在，创建新的工作表
    if (!sheet) {
      sheet = spreadsheet.insertSheet(getConfig().SHEET_NAME);
      initializeSheet(sheet);
    }
    
    return sheet;
  } catch (error) {
    console.error('获取工作表时发生错误:', error);
    return null;
  }
}

/**
 * 初始化工作表，设置表头
 */
function initializeSheet(sheet) {
  const headers = [
    '请求ID',
    'TMDB ID',
    '电影标题',
    'TMDB链接',
    '用户ID',
    '用户姓名',
    '请求时间',
    '状态',
    '更新时间'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 设置表头样式
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  // 自动调整列宽
  sheet.autoResizeColumns(1, headers.length);
  
  console.log('工作表初始化完成');
}

/**
 * 查找现有请求
 * @param {string} tmdbId - TMDB电影ID
 * @return {Object|null} 现有请求信息或null
 */
function findExistingRequest(tmdbId) {
  try {
    const sheet = getSheet();
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    
    // 跳过表头，从第二行开始查找
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[getConfig().COLUMNS.TMDB_ID - 1] == tmdbId) {
        return {
          rowIndex: i + 1,
          requestId: row[getConfig().COLUMNS.REQUEST_ID - 1],
          tmdbId: row[getConfig().COLUMNS.TMDB_ID - 1],
          title: row[getConfig().COLUMNS.TITLE - 1],
          tmdbUrl: row[getConfig().COLUMNS.TMDB_URL - 1],
          userId: row[getConfig().COLUMNS.USER_ID - 1],
          userName: row[getConfig().COLUMNS.USER_NAME - 1],
          requestTime: row[getConfig().COLUMNS.REQUEST_TIME - 1],
          status: row[getConfig().COLUMNS.STATUS - 1],
          updateTime: row[getConfig().COLUMNS.UPDATE_TIME - 1]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('查找现有请求时发生错误:', error);
    return null;
  }
}

/**
 * 保存新的电影请求
 * @param {string} tmdbId - TMDB电影ID
 * @param {Object} movieInfo - 电影信息
 * @param {string} tmdbUrl - TMDB链接
 * @param {string} userId - Telegram用户ID
 * @param {string} userName - Telegram用户姓名
 * @return {string} 请求ID
 */
function saveRequest(tmdbId, movieInfo, tmdbUrl, userId, userName) {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('无法获取工作表');
    
    const requestId = generateRequestId();
    const currentTime = new Date().toLocaleString('zh-CN');
    
    const newRow = [
      requestId,
      tmdbId,
      movieInfo.title,
      tmdbUrl,
      userId,
      userName,
      currentTime,
      getConfig().STATUS.PENDING,
      currentTime
    ];
    
    sheet.appendRow(newRow);
    
    console.log(`新请求已保存: ${requestId}`);
    return requestId;
    
  } catch (error) {
    console.error('保存请求时发生错误:', error);
    throw error;
  }
}

/**
 * 生成唯一的请求ID
 * @return {string} 请求ID
 */
function generateRequestId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `REQ_${timestamp}_${random}`;
}

/**
 * 获取所有请求的用户ID列表（按TMDB ID分组）
 * @param {string} tmdbId - TMDB电影ID
 * @return {Array} 用户ID列表
 */
function getUsersByTmdbId(tmdbId) {
  try {
    const sheet = getSheet();
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    // 跳过表头，从第二行开始查找
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[getConfig().COLUMNS.TMDB_ID - 1] == tmdbId) {
        users.push({
          userId: row[getConfig().COLUMNS.USER_ID - 1],
          userName: row[getConfig().COLUMNS.USER_NAME - 1]
        });
      }
    }
    
    return users;
  } catch (error) {
    console.error('获取用户列表时发生错误:', error);
    return [];
  }
}

/**
 * 更新请求状态
 * @param {string} tmdbId - TMDB电影ID
 * @param {string} newStatus - 新状态
 * @return {boolean} 更新是否成功
 */
function updateRequestStatus(tmdbId, newStatus) {
  try {
    const sheet = getSheet();
    if (!sheet) return false;
    
    const data = sheet.getDataRange().getValues();
    const currentTime = new Date().toLocaleString('zh-CN');
    let updated = false;
    
    // 跳过表头，从第二行开始查找
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[getConfig().COLUMNS.TMDB_ID - 1] == tmdbId) {
        // 更新状态和更新时间
        sheet.getRange(i + 1, getConfig().COLUMNS.STATUS).setValue(newStatus);
        sheet.getRange(i + 1, getConfig().COLUMNS.UPDATE_TIME).setValue(currentTime);
        updated = true;
      }
    }
    
    return updated;
  } catch (error) {
    console.error('更新请求状态时发生错误:', error);
    return false;
  }
}

/**
 * 获取所有待处理的请求
 * @return {Array} 待处理请求列表
 */
function getPendingRequests() {
  try {
    const sheet = getSheet();
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const pendingRequests = [];
    
    // 跳过表头，从第二行开始查找
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[getConfig().COLUMNS.STATUS - 1] === getConfig().STATUS.PENDING) {
        pendingRequests.push({
          rowIndex: i + 1,
          requestId: row[getConfig().COLUMNS.REQUEST_ID - 1],
          tmdbId: row[getConfig().COLUMNS.TMDB_ID - 1],
          title: row[getConfig().COLUMNS.TITLE - 1],
          tmdbUrl: row[getConfig().COLUMNS.TMDB_URL - 1],
          userId: row[getConfig().COLUMNS.USER_ID - 1],
          userName: row[getConfig().COLUMNS.USER_NAME - 1],
          requestTime: row[getConfig().COLUMNS.REQUEST_TIME - 1]
        });
      }
    }
    
    return pendingRequests;
  } catch (error) {
    console.error('获取待处理请求时发生错误:', error);
    return [];
  }
}

/**
 * 测试函数 - 检查工作表连接
 */
function testSheetConnection() {
  try {
    const sheet = getSheet();
    if (sheet) {
      console.log('工作表连接成功');
      console.log('工作表名称:', sheet.getName());
      console.log('行数:', sheet.getLastRow());
      console.log('列数:', sheet.getLastColumn());
      return true;
    } else {
      console.log('工作表连接失败');
      return false;
    }
  } catch (error) {
    console.error('测试工作表连接时发生错误:', error);
    return false;
  }
}