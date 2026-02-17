---
name: 替换爬虫为WMDB API
overview: 移除 Puppeteer 爬虫，改用 wmdb.tv API 获取电影数据。涉及删除爬虫文件、创建 API 调用模块、更新数据类型和前端组件。
todos:
  - id: create-wmdb-api
    content: 创建 WMDB API 调用模块 wmdbApi.ts
    status: completed
  - id: update-scrape-route
    content: 修改 scrape API 路由，使用新的 WMDB API
    status: completed
    dependencies:
      - create-wmdb-api
  - id: delete-scraper
    content: 删除旧的 doubanScraper.ts 爬虫文件
    status: completed
    dependencies:
      - update-scrape-route
---

## 用户需求

清除项目中与爬虫相关的所有代码，改用现成的 WMDB API 接口获取影片信息。

## 核心功能

- 删除 Puppeteer 爬虫模块
- 创建 WMDB API 调用模块
- 修改 API 路由使用新接口
- 保持前端组件接口不变，无需修改前端代码

## API 接口

- 地址: `https://api.wmdb.tv/movie/api?id={doubanId}`
- 从豆瓣 URL 提取 doubanId（如 `doubanUrl/subject/1428581/` 中的 `1428581`）

## 数据映射

| API 字段 | 目标字段 | 转换逻辑 |
| --- | --- | --- |
| data[lang=Cn].name | title | 取中文版本 |
| year | year | 直接使用 |
| director[0].data[lang=Cn].name | director | 取中文版本 |
| duration (秒) | duration | 转换为"X小时Y分钟" |
| doubanRating | rating | 字符串转数字 |
| genre | genre | 按"/"分割为数组 |
| data[lang=Cn].country | region | 取中文版本 |
| data[lang=Cn].poster | poster | 取中文版本 |
| data[lang=Cn].description | description | 取中文版本 |
| doubanId | doubanId | 直接使用 |


## 技术方案

### 删除文件

- `/home/share/CodeBuddy/randomMovie/src/lib/doubanScraper.ts` - Puppeteer 爬虫模块

### 新建文件

- `/home/share/CodeBuddy/randomMovie/src/lib/wmdbApi.ts` - WMDB API 调用模块

### 修改文件

- `/home/share/CodeBuddy/randomMovie/src/app/api/movies/scrape/route.ts` - 改用 WMDB API

### 保持不变

- `/home/share/CodeBuddy/randomMovie/src/types/index.ts` - DoubanMovieData 类型定义保持不变
- `/home/share/CodeBuddy/randomMovie/src/components/movie/AddMovieForm.tsx` - 前端组件接口不变

### 实现要点

1. 使用原生 fetch 调用 WMDB API
2. 从豆瓣 URL 中提取 doubanId
3. 解析 API 响应，获取中文版本的数据
4. 转换时长格式（秒 -> "X小时Y分钟"）
5. 处理类型转换和默认值