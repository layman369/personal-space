# Layman 的个人空间

一个温暖、安静的个人网站，展示博客、短想法、图片、视频、游戏与软件。

**在线访问：https://layman369.github.io/personal-space/**

## 第一版功能

- 首页：精选文章、想法、影像和作品。首页大图来自影像列表中的真实照片。
- 记录：Markdown 文章、标签筛选、全文搜索和空状态。
- 影像：图片列表、大图浏览、视频分类和 HTML5 视频详情播放。
- 音乐：全局本地 FLAC 播放器，切换页面不中断，支持暂停和切歌。
- 实验室：项目介绍、版本记录、可玩的记忆翻牌、可暂停的 25 分钟专注时钟。
- 关于页面、深浅主题（保存在当前设备）、手机布局与键盘操作。
- GitHub Pages 自动构建发布。

影像为站主自己的照片和视频。实验室里的两个工具仍为明确标注的示例作品。没有虚构联系方式。未写入 `src/content.ts` 的本地文件不会进入发布包。

## 本地运行

需要 Node.js 22.12+（或 24 LTS）和 npm。

```sh
npm ci
npm run dev
```

构建：`npm run build`。预览构建结果：`npm run preview`。

## 修改内容

### 个人信息

编辑 `src/content.ts` 中的 `profile`，修改昵称、介绍、状态和 GitHub 链接。首页的介绍支持 `\n` 换行。修改 `index.html` 中的站点描述和标题作为加载前的默认信息。

### 博客和想法

1. 在 `src/posts/` 新建 `.md` 文件。
2. 在 `src/content.ts` 的 `posts` 中添加元数据，并通过 `markdown['./posts/文件名.md']` 引用正文。
3. `kind` 为 `博客` 或 `想法`，`tags` 控制筛选。真实文章移除 `demo: true`。
4. `id` 使用唯一英文短名；按日期从新到旧维护数组顺序。

Markdown 支持标题、列表、引用和代码块，渲染结果通过 DOMPurify 清理。

### 图片与视频

图片放入 `public/images/`，在 `media` 中添加一条 `type: '图片'` 的记录，`src` 使用 `./images/文件名.jpg`。每条记录有唯一 `id`、标题、日期、说明和标签。

视频添加 `type: '视频'`，`src` 使用 `./videos/文件名.mp4` 或可公开访问的 HTTPS MP4/WebM 地址，`poster` 是封面图片路径。不要把普通视频网站的观看页当成视频源地址；它们需要各自的嵌入播放器。首页大图由 `featured.photoId` 指向影像列表中的一条记录。

大视频建议放在外部媒体存储，避免超过 GitHub Pages 容量和带宽限制。

### 音乐

将 FLAC 文件放入 `public/music/`，然后在 `src/music.ts` 的 `musicTracks` 中按播放顺序登记，例如：`{ title: "歌名", artist: "歌手", src: "./music/song.flac" }`。播放器位于主题按钮旁，播放时 CD 会旋转；鼠标移入或用键盘聚焦即可展开暂停与切歌按钮。浏览器不会自动播放音乐，需要访客首次主动点击播放。

### 游戏和软件

现有项目定义在 `src/content.ts` 的 `projects`；页面与交互位于 `src/main.ts` 的 `project`、`startMemory` 和 `startTimer`。新增作品时为该项目实现对应页面，或改为真实的试玩、下载、源码链接，不要只添加元数据。

## 发布

仓库 Settings → Pages → Source 选择 **GitHub Actions**。推送到 `main` 会执行 `.github/workflows/pages.yml`：安装锁定依赖、TypeScript 检查、构建并发布 `dist/`。

项目使用相对资源路径和 hash 路由，兼容 GitHub Pages 项目子路径，刷新文章详情不会出现服务器 404。

## 技术与边界

TypeScript + Vite，静态前端，无账号、数据库或在线内容编辑后台。修改内容需要提交到仓库。不要将密钥写进前端或仓库。搜索在浏览器本地完成。页面使用系统字体，不依赖外部字体服务。

此版本使用 hash 路由，独立文章的搜索引擎收录和分享元数据有限；如果之后重视 SEO，可以迁移为静态生成的独立文章页面。
