export type MusicTrack = {
  title: string;
  artist?: string;
  src: string;
};

// 将 FLAC 放入 public/music/，然后在这里按播放顺序登记。
// 例如：{ title: "歌名", artist: "歌手", src: "./music/song.flac" }
export const musicTracks: MusicTrack[] = [{
  title: "Numb",
  artist: "Linkin Park",
  src: "./music/Linkin Park - Numb.flac"
},{
  // public/music/Westlife - My Love.flac
  title: "My Love",
  artist: "Westlife",
  src: "./music/Westlife - My Love.flac"
}];

const audio = new Audio();
audio.preload = "metadata";
let currentIndex = 0;
let activeRoot: HTMLElement | null = null;
let activeCanvas: HTMLCanvasElement | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let visualizerFrame = 0;
let visualizerLevel = 0;

function currentTrack() {
  return musicTracks[currentIndex];
}

function loadCurrent() {
  const track = currentTrack();
  if (!track) return;
  if (!audio.src.endsWith(track.src.replace(/^\.\//, "/"))) {
    audio.src = track.src;
  }
}

function updateControls(root = activeRoot) {
  if (!root) return;
  const track = currentTrack();
  const playing = !audio.paused && !audio.ended;
  root.classList.toggle("is-playing", playing);
  root.classList.toggle("is-empty", !track);

  const title = root.querySelector<HTMLElement>(".music-title")!;
  const toggles = root.querySelectorAll<HTMLButtonElement>("[data-music-toggle]");
  const previous = root.querySelector<HTMLButtonElement>("[data-music-previous]")!;
  const next = root.querySelector<HTMLButtonElement>("[data-music-next]")!;
  title.textContent = track
    ? `${track.title}${track.artist ? ` · ${track.artist}` : ""}`
    : "请添加本地 FLAC";
  toggles.forEach((toggle) => {
    toggle.setAttribute("aria-label", playing ? "暂停音乐" : "播放音乐");
    if (!toggle.classList.contains("cd-button")) {
      toggle.innerHTML = playing
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';
      toggle.disabled = !track;
    }
  });
  previous.disabled = musicTracks.length < 2;
  next.disabled = musicTracks.length < 2;
}

export function musicControl() {
  return `<canvas class="music-visualizer" aria-hidden="true"></canvas><div class="global-music" aria-label="音乐播放器"><button class="cd-button" type="button" data-music-toggle aria-label="播放音乐" title="音乐播放器"><span class="cd-disc" aria-hidden="true"><i></i></span></button><div class="music-controls"><div class="music-meta"><span class="music-kicker">NOW PLAYING</span><span class="music-title" aria-live="polite"></span></div><div class="music-buttons"><button type="button" data-music-previous aria-label="上一首" title="上一首"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zm3 7 9-7v14z"/></svg></button><button class="music-toggle" type="button" data-music-toggle aria-label="播放音乐" title="播放或暂停"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg></button><button type="button" data-music-next aria-label="下一首" title="下一首"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM6 5l9 7-9 7z"/></svg></button></div></div></div>`;
}

async function enableVisualizer() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!audioContext) {
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }
  if (audioContext.state === "suspended") await audioContext.resume();
  if (!visualizerFrame) drawVisualizer();
}

function drawVisualizer() {
  visualizerFrame = requestAnimationFrame(drawVisualizer);
  const canvas = activeCanvas;
  if (!canvas || !analyser) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = innerWidth;
  const height = innerHeight;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const bins = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(bins);
  const energy = bins.reduce((sum, value) => sum + value, 0) / bins.length / 255;
  const target = audio.paused ? 0 : Math.min(1, energy * 3.2 + 0.24);
  visualizerLevel += (target - visualizerLevel) * (audio.paused ? 0.08 : 0.18);
  if (visualizerLevel < 0.005) return;

  const time = performance.now();
  const points = 72;
  const amplitude = 12 + visualizerLevel * 38;
  const valueAt = (index: number) => bins[(index * 3) % bins.length] / 255;
  const drawEdge = (
    pointAt: (position: number, wave: number) => [number, number],
    length: number,
    offset: number,
    gradient: CanvasGradient,
  ) => {
    const edgePoints: [number, number][] = [];
    for (let i = 0; i <= points; i++) {
      const position = (i / points) * length;
      const spectrum = Math.pow(valueAt(i + offset), 1.35);
      const shimmer = (Math.sin(i * 0.58 + time / 260) + 1) * 0.08;
      edgePoints.push(pointAt(position, 3 + (spectrum + shimmer) * amplitude));
    }

    context.beginPath();
    context.moveTo(edgePoints[0][0], edgePoints[0][1]);
    for (let i = 1; i < edgePoints.length - 1; i++) {
      const current = edgePoints[i];
      const next = edgePoints[i + 1];
      context.quadraticCurveTo(
        current[0],
        current[1],
        (current[0] + next[0]) / 2,
        (current[1] + next[1]) / 2,
      );
    }
    const last = edgePoints.at(-1)!;
    context.lineTo(last[0], last[1]);
    context.strokeStyle = gradient;
    context.globalAlpha = 0.18 * visualizerLevel;
    context.lineWidth = 13;
    context.shadowColor = "#6d5cff";
    context.shadowBlur = 26;
    context.stroke();
    context.globalAlpha = 0.48 * visualizerLevel;
    context.lineWidth = 4;
    context.shadowBlur = 15;
    context.stroke();
    context.globalAlpha = 0.95 * visualizerLevel;
    context.lineWidth = 1.35;
    context.shadowBlur = 7;
    context.stroke();
  };

  const horizontal = context.createLinearGradient(0, 0, width, 0);
  horizontal.addColorStop(0, "#20e3ff");
  horizontal.addColorStop(0.34, "#5865ff");
  horizontal.addColorStop(0.68, "#a855f7");
  horizontal.addColorStop(1, "#ff4fc8");
  const vertical = context.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "#ff4fc8");
  vertical.addColorStop(0.5, "#6d5cff");
  vertical.addColorStop(1, "#20e3ff");

  const edgeGlow = 38 + visualizerLevel * 34;
  const topGlow = context.createLinearGradient(0, 0, 0, edgeGlow);
  topGlow.addColorStop(0, "#6d5cff70");
  topGlow.addColorStop(1, "#6d5cff00");
  const bottomGlow = context.createLinearGradient(0, height, 0, height - edgeGlow);
  bottomGlow.addColorStop(0, "#ff4fc870");
  bottomGlow.addColorStop(1, "#ff4fc800");
  const leftGlow = context.createLinearGradient(0, 0, edgeGlow, 0);
  leftGlow.addColorStop(0, "#20e3ff62");
  leftGlow.addColorStop(1, "#20e3ff00");
  const rightGlow = context.createLinearGradient(width, 0, width - edgeGlow, 0);
  rightGlow.addColorStop(0, "#a855f762");
  rightGlow.addColorStop(1, "#a855f700");
  context.globalAlpha = 0.25 + visualizerLevel * 0.32;
  context.fillStyle = topGlow;
  context.fillRect(0, 0, width, edgeGlow);
  context.fillStyle = bottomGlow;
  context.fillRect(0, height - edgeGlow, width, edgeGlow);
  context.fillStyle = leftGlow;
  context.fillRect(0, 0, edgeGlow, height);
  context.fillStyle = rightGlow;
  context.fillRect(width - edgeGlow, 0, edgeGlow, height);

  drawEdge((p, w) => [p, w], width, 0, horizontal);
  drawEdge((p, w) => [width - w, p], height, 11, vertical);
  drawEdge((p, w) => [width - p, height - w], width, 23, horizontal);
  drawEdge((p, w) => [w, height - p], height, 37, vertical);

  const pulse = 18 + visualizerLevel * 34 + Math.sin(time / 180) * 4;
  const corners: [number, number, string][] = [
    [0, 0, "#20e3ff"],
    [width, 0, "#ff4fc8"],
    [width, height, "#a855f7"],
    [0, height, "#20e3ff"],
  ];
  corners.forEach(([x, y, color]) => {
    const glow = context.createRadialGradient(x, y, 0, x, y, pulse * 2.6);
    glow.addColorStop(0, color);
    glow.addColorStop(0.24, `${color}88`);
    glow.addColorStop(1, `${color}00`);
    context.globalAlpha = 0.45 * visualizerLevel;
    context.fillStyle = glow;
    context.fillRect(x ? x - pulse * 2.6 : 0, y ? y - pulse * 2.6 : 0, pulse * 2.6, pulse * 2.6);
  });

  context.globalCompositeOperation = "lighter";
  context.setLineDash([3, 20]);
  context.lineDashOffset = -time / 22;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1.5;
  context.globalAlpha = 0.55 * visualizerLevel;
  context.strokeRect(2, 2, width - 4, height - 4);
  context.setLineDash([]);
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

export function mountMusicControl() {
  const root = document.querySelector<HTMLElement>(".global-music");
  if (!root) return;
  activeRoot = root;
  activeCanvas = document.querySelector<HTMLCanvasElement>(".music-visualizer");

  const selectTrack = async (step: number) => {
    if (!musicTracks.length) return;
    currentIndex = (currentIndex + step + musicTracks.length) % musicTracks.length;
    audio.src = currentTrack().src;
    try {
      await audio.play();
    } catch {}
    updateControls(root);
  };

  root.querySelectorAll<HTMLButtonElement>("[data-music-toggle]").forEach((button) =>
    button.addEventListener("click", async () => {
      const track = currentTrack();
      if (!track) return;
      if (audio.paused) {
        loadCurrent();
        await enableVisualizer();
        try {
          await audio.play();
        } catch {}
      } else {
        audio.pause();
      }
      updateControls(root);
    }),
  );
  root.querySelector("[data-music-previous]")?.addEventListener("click", () => selectTrack(-1));
  root.querySelector("[data-music-next]")?.addEventListener("click", () => selectTrack(1));
  updateControls(root);
}

audio.addEventListener("play", () => updateControls());
audio.addEventListener("pause", () => updateControls());
audio.addEventListener("ended", async () => {
  if (!musicTracks.length) return;
  currentIndex = (currentIndex + 1) % musicTracks.length;
  audio.src = currentTrack().src;
  try {
    await audio.play();
  } catch {}
  updateControls();
});
