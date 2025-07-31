/**
 * TMDB API 相关函数
 * 处理TMDB链接解析和电影信息获取
 */

/**
 * 解析TMDB链接，提取电影ID
 * @param {string} url - TMDB链接
 * @return {string|null} 电影ID或null
 */
function parseTmdbUrl(url) {
  try {
    // 支持的TMDB链接格式：
    // https://www.themoviedb.org/movie/123456
    // https://www.themoviedb.org/movie/123456-movie-title
    // https://themoviedb.org/movie/123456
    
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?themoviedb\.org\/movie\/(\d+)/i,
      /tmdb\.org\/movie\/(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log(`解析TMDB链接成功: ${url} -> ID: ${match[1]}`);
        return match[1];
      }
    }
    
    console.log(`无法解析TMDB链接: ${url}`);
    return null;
    
  } catch (error) {
    console.error('解析TMDB链接时发生错误:', error);
    return null;
  }
}

/**
 * 从TMDB API获取电影信息
 * @param {string} movieId - TMDB电影ID
 * @return {Object|null} 电影信息或null
 */
function getMovieInfo(movieId) {
  try {
    const apiKey = getConfig().TMDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      console.error('TMDB API密钥未配置');
      return null;
    }
    
    const url = `${TMDB_API_URL}/movie/${movieId}?api_key=${apiKey}&language=zh-CN`;
    
    console.log(`正在获取电影信息: ${movieId}`);
    
    const response = UrlFetchApp.fetch(url);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      console.error(`TMDB API请求失败: ${statusCode}`);
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    
    // 提取需要的电影信息
    const movieInfo = {
      id: data.id,
      title: data.title || data.original_title,
      originalTitle: data.original_title,
      overview: data.overview,
      releaseDate: data.release_date,
      year: data.release_date ? new Date(data.release_date).getFullYear() : '未知',
      runtime: data.runtime,
      genres: data.genres ? data.genres.map(g => g.name).join(', ') : '',
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      popularity: data.popularity,
      adult: data.adult,
      originalLanguage: data.original_language
    };
    
    console.log(`电影信息获取成功: ${movieInfo.title} (${movieInfo.year})`);
    return movieInfo;
    
  } catch (error) {
    console.error('获取电影信息时发生错误:', error);
    return null;
  }
}

/**
 * 获取电影的详细信息（包括演员、导演等）
 * @param {string} movieId - TMDB电影ID
 * @return {Object|null} 详细电影信息或null
 */
function getMovieDetails(movieId) {
  try {
    const apiKey = getConfig().TMDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      console.error('TMDB API密钥未配置');
      return null;
    }
    
    // 获取基本信息
    const movieInfo = getMovieInfo(movieId);
    if (!movieInfo) return null;
    
    // 获取演职员信息
    const creditsUrl = `${TMDB_API_URL}/movie/${movieId}/credits?api_key=${apiKey}`;
    const creditsResponse = UrlFetchApp.fetch(creditsUrl);
    
    if (creditsResponse.getResponseCode() === 200) {
      const creditsData = JSON.parse(creditsResponse.getContentText());
      
      // 提取主要演员（前5位）
      const cast = creditsData.cast ? creditsData.cast.slice(0, 5).map(actor => actor.name) : [];
      
      // 提取导演
      const directors = creditsData.crew ? 
        creditsData.crew.filter(person => person.job === 'Director').map(director => director.name) : [];
      
      movieInfo.cast = cast.join(', ');
      movieInfo.directors = directors.join(', ');
    }
    
    return movieInfo;
    
  } catch (error) {
    console.error('获取电影详细信息时发生错误:', error);
    return getMovieInfo(movieId); // 降级到基本信息
  }
}

/**
 * 搜索电影（根据标题）
 * @param {string} query - 搜索关键词
 * @return {Array} 搜索结果列表
 */
function searchMovies(query) {
  try {
    const apiKey = getConfig().TMDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      console.error('TMDB API密钥未配置');
      return [];
    }
    
    const encodedQuery = encodeURIComponent(query);
    const url = `${TMDB_API_URL}/search/movie?api_key=${apiKey}&language=zh-CN&query=${encodedQuery}`;
    
    const response = UrlFetchApp.fetch(url);
    
    if (response.getResponseCode() !== 200) {
      console.error('搜索请求失败');
      return [];
    }
    
    const data = JSON.parse(response.getContentText());
    
    return data.results ? data.results.slice(0, 10).map(movie => ({
      id: movie.id,
      title: movie.title || movie.original_title,
      originalTitle: movie.original_title,
      releaseDate: movie.release_date,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : '未知',
      overview: movie.overview,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average
    })) : [];
    
  } catch (error) {
    console.error('搜索电影时发生错误:', error);
    return [];
  }
}

/**
 * 验证TMDB API密钥是否有效
 * @return {boolean} API密钥是否有效
 */
function validateTmdbApiKey() {
  try {
    const apiKey = getConfig().TMDB_API_KEY;
    if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY_HERE') {
      console.log('TMDB API密钥未配置');
      return false;
    }
    
    const url = `${TMDB_API_URL}/configuration?api_key=${apiKey}`;
    const response = UrlFetchApp.fetch(url);
    
    const isValid = response.getResponseCode() === 200;
    console.log(`TMDB API密钥验证结果: ${isValid ? '有效' : '无效'}`);
    
    return isValid;
    
  } catch (error) {
    console.error('验证TMDB API密钥时发生错误:', error);
    return false;
  }
}

/**
 * 格式化电影信息为用户友好的文本
 * @param {Object} movieInfo - 电影信息
 * @return {string} 格式化的电影信息
 */
function formatMovieInfo(movieInfo) {
  if (!movieInfo) return '无法获取电影信息';
  
  let info = `🎬 **${movieInfo.title}**\n`;
  
  if (movieInfo.originalTitle && movieInfo.originalTitle !== movieInfo.title) {
    info += `📝 原名：${movieInfo.originalTitle}\n`;
  }
  
  if (movieInfo.year && movieInfo.year !== '未知') {
    info += `📅 年份：${movieInfo.year}\n`;
  }
  
  if (movieInfo.runtime) {
    info += `⏱️ 时长：${movieInfo.runtime}分钟\n`;
  }
  
  if (movieInfo.genres) {
    info += `🎭 类型：${movieInfo.genres}\n`;
  }
  
  if (movieInfo.directors) {
    info += `🎬 导演：${movieInfo.directors}\n`;
  }
  
  if (movieInfo.cast) {
    info += `👥 主演：${movieInfo.cast}\n`;
  }
  
  if (movieInfo.voteAverage) {
    info += `⭐ 评分：${movieInfo.voteAverage}/10\n`;
  }
  
  if (movieInfo.overview) {
    info += `📖 简介：${movieInfo.overview.substring(0, 200)}${movieInfo.overview.length > 200 ? '...' : ''}\n`;
  }
  
  return info;
}

/**
 * 测试TMDB功能
 */
function testTmdbFunctions() {
  console.log('开始测试TMDB功能...');
  
  // 测试API密钥
  const apiValid = validateTmdbApiKey();
  console.log(`API密钥验证: ${apiValid ? '通过' : '失败'}`);
  
  if (!apiValid) {
    console.log('请先配置有效的TMDB API密钥');
    return;
  }
  
  // 测试链接解析
  const testUrl = 'https://www.themoviedb.org/movie/550';
  const movieId = parseTmdbUrl(testUrl);
  console.log(`链接解析测试: ${testUrl} -> ${movieId}`);
  
  if (movieId) {
    // 测试电影信息获取
    const movieInfo = getMovieInfo(movieId);
    if (movieInfo) {
      console.log('电影信息获取测试通过:');
      console.log(formatMovieInfo(movieInfo));
    } else {
      console.log('电影信息获取测试失败');
    }
  }
}