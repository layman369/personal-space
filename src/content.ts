export const profile = {
  name: 'Layman', title: '一个不断生长的个人空间',
  intro: '记录那些不想忘记的瞬间，\n把脑海里的小念头，慢慢变成作品。',
  status: '正在搭建自己的小小世界', github: 'https://github.com/layman369',
  about: '欢迎来到我的个人空间。这里用来放想法、写博客、存影像，也分享游戏、软件和其他有趣的尝试。',
};
export interface Post { id: string; title: string; date: string; kind: '博客' | '想法'; tags: string[]; excerpt: string; body: string; demo?: boolean }
const markdown = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
export const posts: Post[] = [
  { id:'hello-world', title:'给自己的想法，留一个位置', date:'2026-09-14', kind:'博客', tags:['生活','建站'], excerpt:'一些文字，一些照片，还有一些尚未完成的小作品。这个空间从这里开始。', body:markdown['./posts/hello-world.md'], demo:true },
  { id:'small-things', title:'不必等到完成，才开始记录。', date:'2026-09-14', kind:'想法', tags:['随想'], excerpt:'草稿、半成品、偶然闪过的念头，也值得拥有一个位置。', body:markdown['./posts/small-things.md'], demo:true },
  { id:'slow-web', title:'让网页慢一点，让阅读舒服一点', date:'2026-09-13', kind:'博客', tags:['设计','建站'], excerpt:'比起堆满屏幕的信息，更喜欢清楚的文字、恰好的留白，以及可以安静看完的内容。', body:markdown['./posts/slow-web.md'], demo:true },
];
export interface Media { id:string; title:string; type:'图片'|'视频'; src:string; poster?:string; date:string; note:string; tags:string[] }
export const media: Media[] = [
  {id:'coast',title:'在海边，留一点时间',type:'图片',src:'./images/coast.jpg',date:'2026-09-14',note:'AI 生成的示例影像，用于展示相册效果。',tags:['风景','示例']},
];
export const projects = [
  {id:'memory',title:'记忆翻牌',category:'游戏',label:'在线试玩',description:'翻开卡片，找到相同的图案。一个适合休息时玩的小实验。',tags:['浏览器游戏','示例作品'],version:'1.0.0'},
  {id:'focus',title:'留白 · 专注时钟',category:'软件',label:'打开工具',description:'给一件事留出 25 分钟。暂停喧闹，专注眼前。',tags:['效率工具','示例作品'],version:'1.0.0'},
];


