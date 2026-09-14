import type { Media } from './content';

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function videoCard(item: Media) {
  return `<div class="video-cover">${item.poster ? `<img src="${escape(item.poster)}" alt="${escape(item.title)}的视频封面" loading="lazy">` : '<div class="video-placeholder"><span>生活的动态切片</span></div>'}<span class="video-play" aria-hidden="true">▶</span><span class="video-kind">VIDEO</span>${item.duration ? `<span class="video-duration">${escape(item.duration)}</span>` : ''}</div>`;
}
export function videoDetail(item: Media) {
  return `<div class="media-detail video-detail"><a class="text-link" href="#/gallery">← 返回影像</a><header class="video-heading"><div><span class="eyebrow">MOTION DIARY / 动态记录</span><h1>${escape(item.title)}</h1></div><span class="video-date">${escape(item.date)}${item.duration ? ` · ${escape(item.duration)}` : ''}</span></header><div class="video-layout"><div class="video-stage"><video id="media-player" controls playsinline preload="none" aria-label="${escape(item.title)}" ${item.poster ? `poster="${escape(item.poster)}"` : ''} src="${escape(item.src)}"></video><button class="video-start" aria-label="播放 ${escape(item.title)}"><span class="video-start-icon">▶</span><span>播放这段瞬间</span></button></div><aside class="video-sidebar"><span class="eyebrow">ABOUT THIS MOMENT</span><h2>关于这段影像</h2><p>${escape(item.note)}</p><div class="tags">${item.tags.map(t=>`<span class="tag">${escape(t)}</span>`).join('')}</div><div class="video-actions"><label>播放速度<select id="video-speed" aria-label="播放速度"><option value="0.5">0.5×</option><option value="1" selected>1× 正常</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><button class="chip" id="video-replay">从头播放</button><a class="text-link" href="${escape(item.src)}" target="_blank" rel="noopener noreferrer">单独打开视频 ↗</a></div><p class="video-tip">暂停、进度、音量与全屏，可在播放器中控制。</p></aside></div><div class="video-feedback" id="video-feedback" role="status" aria-live="polite"></div></div>`;
}
export function mountVideo(): () => void {
  const video=document.querySelector<HTMLVideoElement>('#media-player'); if(!video)return ()=>{};
  const start=document.querySelector<HTMLButtonElement>('.video-start')!;
  const feedback=document.querySelector<HTMLElement>('#video-feedback')!;
  const listeners: Array<[string, EventListener]> = [];
  const on=(event:string, listener:EventListener)=>{video.addEventListener(event,listener);listeners.push([event,listener]);};
  const message=(text:string)=>{feedback.textContent=text;};
  const play=async()=>{start.hidden=true;message('正在加载视频…');try{await video.play();}catch(error){if((error as DOMException).name==='AbortError')return;message('暂时无法播放，请重试或单独打开视频。');start.hidden=false;}};
  start.onclick=()=>void play();
  document.querySelector<HTMLButtonElement>('#video-replay')!.onclick=()=>{if(video.readyState>0)video.currentTime=0;void play();};
  document.querySelector<HTMLSelectElement>('#video-speed')!.onchange=e=>{video.playbackRate=Number((e.target as HTMLSelectElement).value);};
  on('loadedmetadata',()=>{video.dataset.orientation=video.videoHeight>video.videoWidth?'portrait':'landscape';});
  on('play',()=>{start.hidden=true;});
  on('playing',()=>message(''));
  on('waiting',()=>{if(!video.paused)message('正在缓冲…');});
  on('pause',()=>{if(!video.error)message('');});
  on('ended',()=>message('播放完毕。可以从头再看一遍。'));
  on('error',()=>{start.hidden=false;message('视频加载失败，可能是网络或格式问题。请重试，或单独打开视频。');});
  return ()=>{listeners.forEach(([event,listener])=>video.removeEventListener(event,listener));video.pause();video.removeAttribute('src');video.load();};
}
