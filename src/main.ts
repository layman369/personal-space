import "./style.css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  profile,
  posts,
  media,
  projects,
  featured,
  type Post,
} from "./content";
import { videoCard, videoDetail, mountVideo } from "./video";
import { mountMusicControl, musicControl } from "./music";

const app = document.querySelector<HTMLDivElement>("#app")!;
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const icon = (name: string) =>
  ({ sun: "☀", moon: "☾", search: "⌕", arrow: "↗", close: "×" })[name] || name;
let cleanup = () => {};
let filter = "全部";
let query = "";
let dark = false;
try {
  dark =
    localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      matchMedia("(prefers-color-scheme: dark)").matches);
} catch {}
document.documentElement.dataset.theme = dark ? "dark" : "light";
function tags(items: string[]) {
  return items.map((x) => `<span class="tag">${esc(x)}</span>`).join("");
}
function postRow(p: Post) {
  return `<a class="post-row" href="#/post/${p.id}"><span class="date">${p.date.slice(5).replace("-", " / ")}<small>${p.date.slice(0, 4)}</small></span><div><span class="eyebrow">${p.kind}${p.demo ? " · 示例" : ""}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><div class="tags">${tags(p.tags)}</div></div><span class="row-arrow">↗</span></a>`;
}
function sectionTitle(kicker: string, title: string, link?: string) {
  return `<div class="section-title"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2></div>${link ? `<a class="text-link" href="${link}">查看全部 ↗</a>` : ""}</div>`;
}
function projectCard(p: (typeof projects)[number]) {
  return `<a class="project-card" href="#/project/${p.id}"><div class="project-art ${p.id}">${p.id === "memory" ? '<div class="mini-tiles"><i>✳</i><i>●</i><i>●</i><i>✳</i></div>' : '<span class="clock-art">25<span>:00</span></span>'}<span class="art-label">${p.category} / 0${projects.indexOf(p) + 1}</span></div><div class="project-copy"><div class="project-heading"><h3>${p.title}</h3><span>↗</span></div><p>${p.description}</p><div class="tags">${tags(p.tags)}</div></div></a>`;
}
function home() {
  const photo = media.find((m) => m.id === featured.photoId);
  const story = posts.find((p) => p.id === featured.postId);
  const thought = posts.find((p) => p.id === featured.thoughtId);
  if (!photo || !story || !thought) return missing();
  const intro = esc(profile.intro).replaceAll("\n", "<br>");
  const storyTitle = esc(story.title).replace("，", "，<br>");
  const thoughtTitle = esc(thought.title).replace("，", "，<br>");
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow">A SMALL CORNER OF THE INTERNET</span><h1>你好，我是 <span>${profile.name}<i>✳</i></span></h1><p class="intro">${intro}</p><a class="button" href="#/journal">随便逛逛 <span>↗</span></a><div class="now"><span class="now-label">此刻</span>${esc(profile.status)}</div></div><a class="hero-photo" href="#/gallery/${photo.id}"><img src="${esc(photo.src)}" alt="${esc(photo.title)}，${esc(photo.note)}" fetchpriority="high"><div class="photo-caption"><span>一些生活的切片</span><span>01 / ${esc(photo.title)} ↗</span></div><span class="photo-stamp">慢慢来，也没关系。</span></a></section><section>${sectionTitle("HANDPICKED", "值得停留的片刻")}<div class="featured"><a class="featured-story" href="#/post/${story.id}"><span class="eyebrow">置顶文章</span><h2>${storyTitle}</h2><p>${esc(story.excerpt)}</p><span class="text-link">读这篇文章 ↗</span><span class="story-decoration" aria-hidden="true">“</span></a><div class="featured-side"><a class="thought-card" href="#/post/${thought.id}"><span class="eyebrow">随手记</span><p>${thoughtTitle}</p><span class="muted">草稿也有自己的生命。 ↗</span></a><a class="lab-teaser" href="#/lab"><span class="eyebrow">我的实验室</span><div><h3>想法，也可以被玩到。</h3><span class="circle-arrow">↗</span></div><p>游戏、小工具，以及正在发生的尝试。</p></a></div></div></section><section class="updates"><div>${sectionTitle("LATEST NOTES", "最近更新", "#/journal")}${posts.slice(0, 3).map(postRow).join("")}</div><aside class="side-note"><span class="eyebrow">ABOUT THIS SPACE</span><span class="asterisk">✳</span><h3>保持好奇，<br>持续生长。</h3><p>文字、影像、代码。<br>用不同的方式，<br>留下思考和创造的痕迹。</p><a class="text-link" href="#/about">关于这个空间 ↗</a></aside></section><section>${sectionTitle("PLAY & MAKE", "做一点有趣的东西", "#/lab")}<div class="project-grid">${projects.map(projectCard).join("")}</div></section>`;
}
function heading(kicker: string, title: string, subtitle: string) {
  return `<header class="page-heading"><span class="eyebrow">${kicker}</span><h1>${title}<span class="accent-dot">.</span></h1><p>${subtitle}</p></header>`;
}
function journal() {
  const options = [
    "全部",
    "博客",
    "想法",
    ...new Set(posts.flatMap((p) => p.tags)),
  ];
  const matched = posts.filter(
    (p) =>
      (filter === "全部" || p.kind === filter || p.tags.includes(filter)) &&
      `${p.title} ${p.excerpt} ${p.tags.join(" ")} ${p.body}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return `${heading("JOURNAL", "记录", "长一点的思考，短一点的灵感。")}<div class="browse-controls"><div class="filters" aria-label="筛选记录">${options.map((t) => `<button class="chip ${filter === t ? "active" : ""}" data-filter="${t}" aria-pressed="${filter === t}">${t}</button>`).join("")}</div><label class="search"><span aria-hidden="true">⌕</span><input id="journal-search" type="search" placeholder="搜索文字与标签" aria-label="搜索记录" value="${esc(query)}"></label></div><div class="results-count" aria-live="polite">${matched.length} 条记录</div><div id="post-list">${matched.length ? matched.map(postRow).join("") : '<div class="empty"><h3>暂时没有找到</h3><p>试试其他关键词，或清除筛选。</p><button class="button" id="clear-search">清除筛选</button></div>'}</div>`;
}
function article(id: string) {
  const p = posts.find((p) => p.id === id);
  if (!p) return missing();
  return `<div class="reading"><a href="#/journal" class="text-link">← 返回记录</a><header class="article-heading"><div class="eyebrow">${p.kind} / ${p.date}${p.demo ? " / 示例文章" : ""}</div><h1>${esc(p.title)}</h1><div class="tags">${tags(p.tags)}</div></header><article class="prose">${DOMPurify.sanitize(marked.parse(p.body, { async: false }) as string)}</article><div class="article-bottom">写下此刻，留给未来。<a href="#/journal">继续阅读 ↗</a></div></div>`;
}
function gallery(id?: string) {
  const current = media.find((m) => m.id === id);
  if (id && !current) return missing();
  if (current?.type === "视频") return videoDetail(current);
  if (current)
    return `<div class="media-detail"><a class="text-link" href="#/gallery">← 返回影像</a><h1>${esc(current.title)}</h1><button class="image-open" aria-label="放大 ${esc(current.title)}"><img src="${esc(current.src)}" alt="${esc(current.title)}"></button><p class="muted">${current.date} · ${esc(current.note)}</p></div>`;
  const selection = media.filter((m) => filter === "全部" || m.type === filter);
  return `${heading("VISUAL DIARY", "影像", "把一些瞬间，留在这里。")}<div class="filters">${["全部", "图片", "视频"].map((t) => `<button class="chip ${filter === t ? "active" : ""}" data-filter="${t}" aria-pressed="${filter === t}">${t}</button>`).join("")}</div><div class="gallery-grid">${selection.length ? selection.map((m) => `<a class="media-card" href="#/gallery/${m.id}">${m.type === "视频" ? videoCard(m) : `<div class="media-cover"><img src="${esc(m.src)}" alt="${esc(m.title)}" loading="lazy"></div>`}<span class="eyebrow">${m.type} / ${m.date}</span><h3>${esc(m.title)} <span>↗</span></h3><p>${esc(m.note)}</p></a>`).join("") : '<div class="empty"><h3>第一段视频，还在路上。</h3><p>有值得分享的片段时，会放在这里。</p></div>'}</div>`;
}
function lab() {
  return `${heading("PLAYGROUND", "实验室", "把好奇心，变成能摸到的小作品。")}<div class="project-grid">${projects.map(projectCard).join("")}</div><p class="section-footnote">这里的两个小作品是首版示例，可直接体验。</p>`;
}
function project(id: string) {
  const p = projects.find((x) => x.id === id);
  if (!p) return missing();
  return `<a class="text-link" href="#/lab">← 返回实验室</a>${heading(`${p.category} / V${p.version} / 示例作品`, p.title, p.description)}<section class="interactive-stage ${id === "focus" ? "focus-stage" : ""}">${id === "memory" ? `<div class="game-top"><span id="game-status" aria-live="polite">找出 6 对相同图案</span><button class="chip" id="restart">重新开始</button></div><div class="memory-board" id="memory-board"></div>` : `<span class="eyebrow">ONE THING AT A TIME</span><div class="timer" role="timer" aria-label="剩余时间" id="timer">25:00</div><p id="timer-status" aria-live="polite">给一件事，完整的注意力。</p><div class="timer-buttons"><button class="button" id="timer-toggle">开始专注</button><button class="chip" id="timer-reset">重置</button></div>`}</section><div class="project-notes"><h3>使用说明</h3><p>${id === "memory" ? "点击或用键盘选中卡片，每次翻开两张。配对成功的卡片会保留，找到全部 6 对即可完成。" : "点击开始，进行 25 分钟专注。支持暂停和重置；计时在后台标签页中仍按实际时间计算。离开本工具会结束本次计时。"}</p><h3>更新记录</h3><p>v1.0.0 · 首次发布，可在桌面和手机浏览器中体验。</p></div>`;
}
function about() {
  return `${heading("HELLO, AGAIN", "关于", "很高兴在这里遇见你。")}<div class="about-layout"><div class="about-avatar">L<span>✳</span></div><div class="prose"><h2>我是 ${profile.name}。</h2><p>${profile.about}</p><p>影像已经换成生活里的片段。实验室里的两个小工具，仍是可以打开玩的试验。</p><h3>在这里可以找到</h3><p>文字里的思考，照片里的瞬间，以及代码里有趣的尝试。</p><a class="button" href="${profile.github}" target="_blank" rel="noopener noreferrer">在 GitHub 找到我 ↗</a></div></div>`;
}
function missing() {
  return `<div class="empty"><span class="eyebrow">404</span><h1>这个角落还没有内容。</h1><a class="button" href="#/">回到首页</a></div>`;
}
function render(preserveFocus = false) {
  cleanup();
  cleanup = () => {};
  const parts = (location.hash.slice(1) || "/").split("/").filter(Boolean);
  const route = parts[0] || "home";
  const names: Record<string, string> = {
    home: "首页",
    journal: "记录",
    post: "记录",
    gallery: "影像",
    lab: "实验室",
    project: "实验室",
    about: "关于",
  };
  const main =
    route === "home"
      ? home()
      : route === "journal"
        ? journal()
        : route === "post"
          ? article(parts[1])
          : route === "gallery"
            ? gallery(parts[1])
            : route === "lab"
                ? lab()
                : route === "project"
                  ? project(parts[1])
                  : route === "about"
                    ? about()
                    : missing();
  const detailTitle =
    route === "post"
      ? posts.find((p) => p.id === parts[1])?.title
      : route === "project"
        ? projects.find((p) => p.id === parts[1])?.title
        : route === "gallery" ? media.find(m => m.id === parts[1])?.title : undefined;
  document.title = `${detailTitle || names[route] || "未找到"} · ${profile.name} 的个人空间`;
  app.innerHTML = `<header class="site-header"><a class="brand" href="#/" aria-label="Layman 首页"><span class="brand-mark">L<i></i></span><span>${profile.name}<small>的个人空间</small></span></a><nav aria-label="主导航">${Object.entries(
    {
      home: "首页",
      journal: "记录",
      gallery: "影像",
      lab: "实验室",
      about: "关于",
    },
  )
    .map(
      ([key, name]) =>
        `<a href="#/${key === "home" ? "" : key}" ${names[route] === name ? 'aria-current="page"' : ""}>${name}</a>`,
    )
    .join(
      "",
    )}</nav><div class="header-actions">${musicControl()}<button class="theme-button" aria-label="${dark ? "切换浅色模式" : "切换深色模式"}" title="切换主题">${icon(dark ? "sun" : "moon")}</button></div></header><main id="main" tabindex="-1">${main}</main><footer class="site-footer"><div><a class="brand footer-brand" href="#/">${profile.name}<span>✳</span></a><p>一个不断生长的个人空间。</p></div><div class="footer-links"><a href="#/journal">记录</a><a href="#/lab">实验室</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a><small>© ${new Date().getFullYear()} ${profile.name}</small></div></footer><dialog id="lightbox" aria-label="图片大图"><button class="lightbox-close" aria-label="关闭大图">×</button><img alt=""></dialog>`;
  mountMusicControl();
  document.querySelector<HTMLButtonElement>(".theme-button")!.addEventListener("click", async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    const bounds = button.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    const applyTheme = () => {
      dark = !dark;
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch {}
      button.textContent = icon(dark ? "sun" : "moon");
      button.setAttribute("aria-label", dark ? "切换浅色模式" : "切换深色模式");
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> };
    };
    if (
      !transitionDocument.startViewTransition ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      applyTheme();
      return;
    }
    const transition = transitionDocument.startViewTransition(applyTheme);
    await transition.ready;
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 680,
        easing: "cubic-bezier(.2,.72,.2,1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
  if (route === "gallery") cleanup = mountVideo();
  if (route === "post") {
    const headings = [
      ...document.querySelectorAll<HTMLElement>(".prose h2, .prose h3"),
    ];
    if (headings.length > 1) {
      const toc = document.createElement("details");
      toc.className = "article-toc";
      toc.innerHTML = "<summary>文章目录</summary>";
      headings.forEach((h, i) => {
        h.id = `section-${i}`;
        h.tabIndex = -1;
        const b = document.createElement("button");
        b.textContent = h.textContent;
        b.addEventListener("click", () => {
          h.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          });
          h.focus({ preventScroll: true });
        });
        toc.append(b);
      });
      document.querySelector(".article-heading")!.after(toc);
    }
  }
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      filter = b.dataset.filter!;
      render();
    }),
  );
  const input = document.querySelector<HTMLInputElement>("#journal-search");
  input?.addEventListener("input", () => {
    query = input.value;
    const template = document.createElement("template");
    template.innerHTML = journal();
    document.querySelector("#post-list")!.innerHTML =
      template.content.querySelector("#post-list")!.innerHTML;
    document.querySelector(".results-count")!.textContent =
      template.content.querySelector(".results-count")!.textContent;
  });
  document.querySelector("#post-list")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("#clear-search")) {
      query = "";
      filter = "全部";
      render();
      document.querySelector<HTMLInputElement>("#journal-search")?.focus();
    }
  });
  const dialog = document.querySelector<HTMLDialogElement>("#lightbox")!;
  document.querySelector(".image-open")?.addEventListener("click", () => {
    const m = media.find((m) => m.id === parts[1])!;
    dialog.querySelector("img")!.src = m.src;
    dialog.querySelector("img")!.alt = m.title;
    dialog.showModal();
  });
  dialog
    .querySelector("button")!
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  if (route === "project" && parts[1] === "memory") startMemory();
  if (route === "project" && parts[1] === "focus") startTimer();
  if (preserveFocus) return;
}
function startMemory() {
  const symbols = ["✳", "☀", "☾", "◆", "●", "✿"];
  let deck = [...symbols, ...symbols];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  let open: number[] = [];
  let matched = new Set<number>();
  let moves = 0;
  let pending: ReturnType<typeof setTimeout> | undefined;
  const board = document.querySelector("#memory-board")!;
  const status = document.querySelector("#game-status")!;
  status.textContent = "找出 6 对相同图案";
  board.innerHTML = deck
    .map(
      (_, i) =>
        `<button class="memory-tile" data-index="${i}" aria-label="翻开第 ${i + 1} 张卡片"><span>?</span></button>`,
    )
    .join("");
  const buttons = [...board.querySelectorAll<HTMLButtonElement>("button")];
  buttons.forEach((b, i) =>
    b.addEventListener("click", () => {
      if (open.length === 2 || open.includes(i) || matched.has(i)) return;
      open.push(i);
      b.textContent = deck[i];
      b.classList.add("flipped");
      b.setAttribute("aria-label", `第 ${i + 1} 张：${deck[i]}`);
      if (open.length === 2) {
        moves++;
        const [a, c] = open;
        if (deck[a] === deck[c]) {
          matched.add(a);
          matched.add(c);
          for (const index of open) {
            buttons[index].classList.add("matched");
            buttons[index].disabled = true;
          }
          open = [];
        } else {
          pending = setTimeout(() => {
            open.forEach((index) => {
              buttons[index].textContent = "?";
              buttons[index].classList.remove("flipped");
              buttons[index].setAttribute(
                "aria-label",
                `翻开第 ${index + 1} 张卡片`,
              );
            });
            open = [];
          }, 850);
        }
        status.textContent =
          matched.size === 12
            ? `完成！用了 ${moves} 次配对。`
            : `${matched.size / 2} / 6 对 · ${moves} 次尝试`;
      }
    }),
  );
  document.querySelector<HTMLButtonElement>("#restart")!.onclick = () => {
    if (pending) clearTimeout(pending);
    startMemory();
  };
  cleanup = () => {
    if (pending) clearTimeout(pending);
  };
}
function startTimer() {
  let remaining = 25 * 60;
  let end = 0;
  let running = false;
  const timer = document.querySelector("#timer")!;
  const toggle = document.querySelector("#timer-toggle")!;
  const status = document.querySelector("#timer-status")!;
  const update = () => {
    if (running) remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    timer.textContent = `${Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
    if (running && remaining === 0) {
      running = false;
      toggle.textContent = "再来一轮";
      status.textContent = "这一轮完成了，休息一下吧。";
    }
  };
  toggle.addEventListener("click", () => {
    if (running) {
      update();
      running = false;
      toggle.textContent = "继续专注";
      status.textContent = "已暂停，准备好后继续。";
    } else {
      if (remaining === 0) remaining = 1500;
      end = Date.now() + remaining * 1000;
      running = true;
      toggle.textContent = "暂停";
      status.textContent = "只做眼前这一件事。";
    }
    update();
  });
  document.querySelector("#timer-reset")!.addEventListener("click", () => {
    running = false;
    remaining = 1500;
    toggle.textContent = "开始专注";
    status.textContent = "给一件事，完整的注意力。";
    update();
  });
  const interval = setInterval(update, 250);
  cleanup = () => clearInterval(interval);
}
document.querySelector(".skip")?.addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector<HTMLElement>("#main")?.focus();
});
window.addEventListener("hashchange", () => {
  filter = "全部";
  query = "";
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
});
render();
