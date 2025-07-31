/**
 * 状态监控和通知系统
 * 监控Google Sheets中的状态变更并通知相关用户
 */

/**
 * 设置定时触发器来监控状态变更
 * 需要手动运行此函数来设置定时监控
 */
function setupStatusMonitor() {
  try {
    // 删除现有的触发器
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'checkStatusChanges') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // 创建新的定时触发器，每5分钟检查一次
    ScriptApp.newTrigger('checkStatusChanges')
      .timeBased()
      .everyMinutes(5)
      .create();
    
    console.log('状态监控触发器设置成功，每5分钟检查一次状态变更');
    
    // 初始化状态快照
    initializeStatusSnapshot();
    
  } catch (error) {
    console.error('设置状态监控时发生错误:', error);
  }
}

/**
 * 初始化状态快照
 * 用于记录当前所有请求的状态，以便后续检测变更
 */
function initializeStatusSnapshot() {
  try {
    const sheet = getSheet();
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    const snapshot = {};
    
    // 跳过表头，从第二行开始
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const tmdbId = row[getConfig().COLUMNS.TMDB_ID - 1];
      const status = row[getConfig().COLUMNS.STATUS - 1];
      
      if (tmdbId) {
        snapshot[tmdbId] = status;
      }
    }
    
    // 将快照保存到PropertiesService
    PropertiesService.getScriptProperties().setProperty('statusSnapshot', JSON.stringify(snapshot));
    console.log('状态快照初始化完成，记录了', Object.keys(snapshot).length, '个请求');
    
  } catch (error) {
    console.error('初始化状态快照时发生错误:', error);
  }
}

/**
 * 检查状态变更的主函数
 * 由定时触发器调用
 */
function checkStatusChanges() {
  try {
    console.log('开始检查状态变更...');
    
    const sheet = getSheet();
    if (!sheet) return;
    
    // 获取当前状态快照
    const snapshotJson = PropertiesService.getScriptProperties().getProperty('statusSnapshot');
    if (!snapshotJson) {
      console.log('未找到状态快照，正在初始化...');
      initializeStatusSnapshot();
      return;
    }
    
    const oldSnapshot = JSON.parse(snapshotJson);
    const newSnapshot = {};
    const changes = [];
    
    const data = sheet.getDataRange().getValues();
    
    // 跳过表头，从第二行开始
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const tmdbId = row[getConfig().COLUMNS.TMDB_ID - 1];
      const currentStatus = row[getConfig().COLUMNS.STATUS - 1];
      const title = row[getConfig().COLUMNS.TITLE - 1];
      
      if (tmdbId) {
        newSnapshot[tmdbId] = currentStatus;
        
        // 检查是否有状态变更
        const oldStatus = oldSnapshot[tmdbId];
        if (oldStatus && oldStatus !== currentStatus) {
          changes.push({
            tmdbId: tmdbId,
            title: title,
            oldStatus: oldStatus,
            newStatus: currentStatus,
            rowIndex: i + 1
          });
        }
      }
    }
    
    // 处理状态变更
    if (changes.length > 0) {
      console.log(`发现 ${changes.length} 个状态变更`);
      
      for (const change of changes) {
        await handleStatusChange(change);
      }
      
      // 更新状态快照
      PropertiesService.getScriptProperties().setProperty('statusSnapshot', JSON.stringify(newSnapshot));
    } else {
      console.log('未发现状态变更');
    }
    
  } catch (error) {
    console.error('检查状态变更时发生错误:', error);
  }
}

/**
 * 处理单个状态变更
 * @param {Object} change - 状态变更信息
 */
async function handleStatusChange(change) {
  try {
    console.log(`处理状态变更: ${change.title} (${change.tmdbId}) ${change.oldStatus} -> ${change.newStatus}`);
    
    // 获取该电影的所有相关用户
    const users = getUsersByTmdbId(change.tmdbId);
    
    if (users.length === 0) {
      console.log('未找到相关用户');
      return;
    }
    
    // 构建通知消息
    const message = getConfig().MESSAGES.STATUS_UPDATE
      .replace('{title}', change.title)
      .replace('{status}', change.newStatus)
      .replace('{time}', new Date().toLocaleString('zh-CN'));
    
    // 向所有相关用户发送通知
    for (const user of users) {
      const success = sendMessage(user.userId, message);
      if (success) {
        console.log(`通知发送成功: ${user.userName} (${user.userId})`);
      } else {
        console.log(`通知发送失败: ${user.userName} (${user.userId})`);
      }
      
      // 添加短暂延迟，避免发送过快
      Utilities.sleep(100);
    }
    
    // 记录通知日志
    logStatusChangeNotification(change, users);
    
  } catch (error) {
    console.error('处理状态变更时发生错误:', error);
  }
}

/**
 * 记录状态变更通知日志
 * @param {Object} change - 状态变更信息
 * @param {Array} users - 通知的用户列表
 */
function logStatusChangeNotification(change, users) {
  try {
    const logMessage = `状态变更通知 - 电影: ${change.title} | 状态: ${change.oldStatus} -> ${change.newStatus} | 通知用户: ${users.length}人 | 时间: ${new Date().toLocaleString('zh-CN')}`;
    console.log(logMessage);
    
    // 可选：将日志写入单独的工作表
    // logToSheet(logMessage);
    
  } catch (error) {
    console.error('记录通知日志时发生错误:', error);
  }
}

/**
 * 手动触发状态检查（用于测试）
 */
function manualStatusCheck() {
  console.log('手动触发状态检查...');
  checkStatusChanges();
}

/**
 * 获取状态监控统计信息
 */
function getMonitoringStats() {
  try {
    const sheet = getSheet();
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const stats = {
      totalRequests: data.length - 1, // 减去表头
      pendingCount: 0,
      completedCount: 0,
      notFoundCount: 0,
      uniqueUsers: new Set(),
      uniqueMovies: new Set()
    };
    
    // 跳过表头，从第二行开始
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const status = row[getConfig().COLUMNS.STATUS - 1];
      const userId = row[getConfig().COLUMNS.USER_ID - 1];
      const tmdbId = row[getConfig().COLUMNS.TMDB_ID - 1];
      
      // 统计状态
      switch (status) {
        case getConfig().STATUS.PENDING:
          stats.pendingCount++;
          break;
        case getConfig().STATUS.COMPLETED:
          stats.completedCount++;
          break;
        case getConfig().STATUS.NOT_FOUND:
          stats.notFoundCount++;
          break;
      }
      
      // 统计唯一用户和电影
      if (userId) stats.uniqueUsers.add(userId);
      if (tmdbId) stats.uniqueMovies.add(tmdbId);
    }
    
    stats.uniqueUsersCount = stats.uniqueUsers.size;
    stats.uniqueMoviesCount = stats.uniqueMovies.size;
    
    // 清理Set对象（不需要返回）
    delete stats.uniqueUsers;
    delete stats.uniqueMovies;
    
    console.log('监控统计信息:', stats);
    return stats;
    
  } catch (error) {
    console.error('获取监控统计信息时发生错误:', error);
    return null;
  }
}

/**
 * 清理过期的触发器
 */
function cleanupTriggers() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let deletedCount = 0;
    
    triggers.forEach(trigger => {
      // 删除所有与状态监控相关的触发器
      if (trigger.getHandlerFunction() === 'checkStatusChanges') {
        ScriptApp.deleteTrigger(trigger);
        deletedCount++;
      }
    });
    
    console.log(`清理了 ${deletedCount} 个触发器`);
    return deletedCount;
    
  } catch (error) {
    console.error('清理触发器时发生错误:', error);
    return 0;
  }
}

/**
 * 重置状态监控系统
 */
function resetStatusMonitor() {
  try {
    // 清理触发器
    cleanupTriggers();
    
    // 清理状态快照
    PropertiesService.getScriptProperties().deleteProperty('statusSnapshot');
    
    console.log('状态监控系统已重置');
    
    // 重新设置监控
    setupStatusMonitor();
    
  } catch (error) {
    console.error('重置状态监控时发生错误:', error);
  }
}

/**
 * 测试状态变更通知功能
 * @param {string} testUserId - 测试用户ID
 */
function testStatusNotification(testUserId) {
  if (!testUserId) {
    console.log('请提供测试用户ID');
    return;
  }
  
  try {
    const testMessage = getConfig().MESSAGES.STATUS_UPDATE
      .replace('{title}', '测试电影')
      .replace('{status}', '已入库')
      .replace('{time}', new Date().toLocaleString('zh-CN'));
    
    const success = sendMessage(testUserId, `🧪 **测试通知**\n\n${testMessage}`);
    
    if (success) {
      console.log('测试通知发送成功');
    } else {
      console.log('测试通知发送失败');
    }
    
  } catch (error) {
    console.error('测试状态通知时发生错误:', error);
  }
}