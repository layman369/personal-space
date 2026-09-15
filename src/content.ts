export const profile = {
  name: "Layman",
  title: "一个不断生长的个人空间",
  intro: "记录那些不想忘记的瞬间，\n把脑海里的小念头，慢慢变成作品。",
  status: "正在把生活里的片段，放进这个小小世界",
  github: "https://github.com/layman369",
  about:
    "欢迎来到我的个人空间。这里用来放想法、写博客、存影像，也分享游戏、软件和其他有趣的尝试。",
};

export const featured = {
  photoId: "IMG_1702",
  postId: "hello-world",
  thoughtId: "small-things",
};

export interface Post {
  id: string;
  title: string;
  date: string;
  kind: "博客" | "想法";
  tags: string[];
  excerpt: string;
  body: string;
  demo?: boolean;
}

const markdown = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const posts: Post[] = [
  {
    id: "hello-world",
    title: "给自己的想法，留一个位置",
    date: "2026-09-14",
    kind: "博客",
    tags: ["生活", "建站"],
    excerpt:
      "照片、一段小猫的视频，还有几句还没长成文章的话。这个空间从真实的记录开始。",
    body: markdown["./posts/hello-world.md"],
  },
  {
    id: "small-things",
    title: "不必等到完成，才开始记录。",
    date: "2026-09-14",
    kind: "想法",
    tags: ["随想"],
    excerpt: "草稿、半成品、偶然闪过的念头，也值得拥有一个位置。",
    body: markdown["./posts/small-things.md"],
  },
  {
    id: "slow-web",
    title: "让网页慢一点，让阅读舒服一点",
    date: "2026-09-13",
    kind: "博客",
    tags: ["设计", "建站"],
    excerpt:
      "比起堆满屏幕的信息，更喜欢清楚的文字、恰好的留白，以及可以安静看完的内容。",
    body: markdown["./posts/slow-web.md"],
  },
];

export interface Media {
  id: string;
  title: string;
  type: "图片" | "视频";
  src: string;
  poster?: string;
  duration?: string;
  date: string;
  note: string;
  tags: string[];
}

export const media: Media[] = [
  {
    id: "JPVK2004",
    title: "生日那天",
    type: "图片",
    src: "./images/JPVK2004.JPG",
    date: "2026-08-08",
    note: "帽子、蛋糕，还有一张想留下来的合影。",
    tags: ["人物", "生日"],
  },
  {
    id: "JRMJ8775",
    title: "切蛋糕",
    type: "图片",
    src: "./images/JRMJ8775.JPG",
    date: "2026-08-08",
    note: "同一天稍晚一点，蛋糕上的无花果还没动完。",
    tags: ["人物", "生日"],
  },
  {
    id: "IMG_1730",
    title: "小猫咪",
    type: "视频",
    src: "./videos/IMG_1730-web.mp4",
    poster: "./images/IMG_1730-poster.jpg",
    duration: "0:05",
    date: "2026-08-08",
    note: "被抱起来的几秒钟。",
    tags: ["猫"],
  },
  {
    id: "IMG_1705",
    title: "云后的月亮",
    type: "图片",
    src: "./images/IMG_1705.JPG",
    date: "2026-07-28",
    note: "瓦片、电线，和被云挡住又露出来的光。",
    tags: ["夜景"],
  },
  {
    id: "IMG_1702",
    title: "路灯和月亮",
    type: "图片",
    src: "./images/IMG_1702.JPG",
    date: "2026-07-26",
    note: "空了一点的草地，灯还亮着。",
    tags: ["夜景"],
  },
  {
    id: "IMG_1700",
    title: "城墙边",
    type: "图片",
    src: "./images/IMG_1700.JPG",
    date: "2026-07-26",
    note: "夜里走到城墙下面，停下来拍一张。",
    tags: ["人物", "夜景"],
  },
  {
    id: "OEOD8425",
    title: "一口甜",
    type: "图片",
    src: "./images/OEOD8425.JPG",
    date: "2025-04-20",
    note: "路边坐下，喝一口潮汕的甜。",
    tags: ["人物"],
  },
  {
    id: "IMG_0949",
    title: "蓝眼睛",
    type: "图片",
    src: "./images/IMG_0949.JPG",
    date: "2025-03-15",
    note: "家里的猫，看人的时候很认真。",
    tags: ["猫"],
  },
  {
    id: "IMG_0795",
    title: "桌上的翅膀",
    type: "图片",
    src: "./images/IMG_0795.JPG",
    date: "2025-02-10",
    note: "拼完以后，先让它在屏幕前停一会儿。",
    tags: ["模型"],
  },
  {
    id: "XCMO3161",
    title: "门口的小孩",
    type: "图片",
    src: "./images/XCMO3161.JPG",
    date: "2025-01-11",
    note: "翻出来的旧照片。门口站着小时候的我。",
    tags: ["人物", "老照片"],
  },
  {
    id: "CQCW1780",
    title: "推车里",
    type: "图片",
    src: "./images/CQCW1780.JPG",
    date: "2025-01-11",
    note: "另一张旧照片。推车里坐着两个小孩。",
    tags: ["人物", "老照片"],
  },
];

export const projects = [
  {
    id: "memory",
    title: "记忆翻牌",
    category: "游戏",
    label: "在线试玩",
    description: "翻开卡片，找到相同的图案。一个适合休息时玩的小实验。",
    tags: ["浏览器游戏", "示例作品"],
    version: "1.0.0",
  },
  {
    id: "focus",
    title: "留白 · 专注时钟",
    category: "软件",
    label: "打开工具",
    description: "给一件事留出 25 分钟。暂停喧闹，专注眼前。",
    tags: ["效率工具", "示例作品"],
    version: "1.0.0",
  },
];
