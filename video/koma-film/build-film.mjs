// Produces ordinary editable HyperFrames HTML. No runtime DOM generation.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));process.chdir(dir);
const D=37, css=fs.readFileSync('assets/style.css','utf8');
const sceneCss=css.replace(/html,body\{[^}]*\}/g,'').replace(/body\{[^}]*\}/g,'');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const img=(name,style,extra='')=>`<img src="assets/visual/${name}" style="${style}" ${extra}>`;
const cursor=id=>`<svg id="${id}" class="cursor" viewBox="0 0 64 80"><path d="M8 5L52 44 33 46 45 69 34 75 23 51 8 65Z"/></svg>`;
let artIndex=0;
const art=()=>img(['section-writing.webp','section-connecting.webp','section-discovering.webp','section-connecting.webp','section-discovering.webp','section-writing.webp'][artIndex++%6],'', 'class="back-art" data-layout-ignore');
const scenes=[];
function scene(id,start,duration,markup,tweens){
  const seen=new Set();tweens=tweens.replace(/tl\.fromTo\('([^']+)',\{([^}]+)\},\{/g,(m,s)=>{if(seen.has(s))return m+'immediateRender:false,';seen.add(s);return m});
  const body=`<template><style>${sceneCss}\n#root{position:absolute;inset:0}</style><div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-duration="${duration}"><div id="${id}-canvas" class="scene">${markup}</div></div><script>(()=>{const tl=gsap.timeline({paused:true});${tweens}\ntl.set({}, {}, ${duration});window.__timelines=window.__timelines||{};window.__timelines['${id}']=tl;})();</script></template>`;
  fs.writeFileSync(`compositions/${id}.html`,body);scenes.push({id,start,duration});
}
scene('head',0,2.8,`
  ${art()}
  <div class="kicker">ISI KEPALA KAMU:</div>
  <h1 class="headline" id="head-title">Kok<br><span id="head-rame" class="strip">rame</span><br>sendiri?</h1>
  <div id="head-tab-a" class="note small" style="left:125px;top:890px;width:370px">random banget.</div>
  <div id="head-tab-b" class="note small" style="left:520px;top:910px;width:370px">serius dikit.</div>
  <div id="head-tab-c" class="note small" style="left:280px;top:1010px;width:480px">eh, kepikiran lagi.</div>
  ${img('doodle-star.svg','position:absolute;left:790px;top:390px;width:125px','id="head-star" data-layout-ignore')}
`, `
  tl.fromTo('#head-rame',{scaleX:1.1,rotation:-4},{scaleX:1,rotation:-2,duration:.45,ease:'expo.out'},0);
  tl.fromTo('#head-tab-a',{x:-600,rotation:-12},{x:0,rotation:-5,duration:.42,ease:'back.out(1.2)'},.5);
  tl.fromTo('#head-tab-b',{x:650,rotation:10},{x:0,rotation:4,duration:.42,ease:'back.out(1.2)'},.8);
  tl.fromTo('#head-tab-c',{y:600,rotation:-9},{y:0,rotation:-2,duration:.45,ease:'expo.out'},1.25);
  tl.fromTo('#head-star',{scale:0,rotation:-45},{scale:1,rotation:0,duration:.38,ease:'back.out(1.4)'},1.75);
  tl.fromTo('#head-canvas',{x:0},{x:-1080,duration:.28,ease:'power3.in'},2.52);
`);
scene('noodle',2.8,2.6,`
  <div id="noodle-sheet" class="scrap" style="left:40px;top:175px;width:950px;height:1090px" data-layout-ignore></div>
  <div class="kicker">PERTANYAAN PENTING (KATANYA)</div>
  <h1 class="headline" style="top:300px;font-size:112px" id="noodle-title">Mi instan<br><span class="violet">punya teman</span><br>kok lebih enak?</h1>
  <svg id="noodle-bowl" viewBox="0 0 600 380" style="position:absolute;left:240px;top:760px;width:580px;height:370px" data-layout-ignore>
   <path d="M58 155Q300 70 542 155L490 290Q300 390 110 290Z" fill="#5A46D6" stroke="#1D1B18" stroke-width="10"/>
   <ellipse cx="300" cy="155" rx="242" ry="62" fill="#DCCDBB" stroke="#1D1B18" stroke-width="9"/>
   <g fill="none" stroke="#1D1B18" stroke-width="7"><path d="M115 150q30-35 70 0t70 0t70 0t70 0t80 0M135 177q35-35 70 0t70 0t70 0t70 0M150 122q35 25 70 0t70 0t70 0t65 0"/><path d="M250 75q-30-28 0-55M310 67q-30-28 0-55M370 75q-30-28 0-55"/></g><path d="M320 128L565 20M335 145L590 47" stroke="#1D1B18" stroke-width="11"/>
  </svg>${art()}
`,`tl.fromTo('#noodle-canvas',{x:1080},{x:0,duration:.35,ease:'expo.out'},0);tl.fromTo('#noodle-bowl',{y:230,rotation:8},{y:0,rotation:-3,duration:.55,ease:'back.out(1.3)'},.25);tl.fromTo('#noodle-sheet',{rotation:2},{rotation:-1,duration:.4,ease:'power2.out'},0);tl.fromTo('#noodle-bowl',{y:0},{y:-30,duration:.12,repeat:1,yoyo:true,ease:'power1.out'},1.8);tl.fromTo('#noodle-canvas',{y:0},{y:-1920,duration:.25,ease:'power3.in'},2.35);`);
scene('parking',5.4,2.8,`
  <div style="position:absolute;inset:0;background:#5A46D6"></div>
  ${img('hero-foreground.webp','position:absolute;width:1280px;height:900px;object-fit:cover;left:-100px;top:1070px','data-layout-ignore')}
  <div id="parking-ticket" class="paper" style="position:absolute;left:115px;top:220px;width:780px;height:880px;padding:48px;clip-path:polygon(0 0,100% 0,100% 97%,96% 100%,92% 97%,88% 100%,84% 97%,80% 100%,76% 97%,72% 100%,68% 97%,64% 100%,60% 97%,56% 100%,52% 97%,48% 100%,44% 97%,40% 100%,36% 97%,32% 100%,28% 97%,24% 100%,20% 97%,16% 100%,12% 97%,8% 100%,4% 97%,0 100%)">
   <div class="mono" style="font-size:36px;border-bottom:3px dashed #1D1B18;padding-bottom:26px">P &nbsp; MESIN PARKIR</div>
   <p style="font-size:54px;line-height:1.2;margin-top:48px">Tadi aku bilang</p>
   <h1 id="parking-thanks" style="font:700 110px/.95 'Koma Serif';letter-spacing:-5px;margin-top:35px">“sama-<br>sama.”</h1>
   <p class="mono" style="font-size:36px;line-height:1.3;margin-top:45px">ke mesin.<br>bukan ke orang.</p>
   <div style="margin-top:40px;height:66px;background:repeating-linear-gradient(90deg,#1D1B18 0 5px,transparent 5px 11px,#1D1B18 11px 13px,transparent 13px 19px)" data-layout-ignore></div>
  </div>
`,`tl.fromTo('#parking-ticket',{y:900,rotation:7},{y:0,rotation:-3,duration:.45,ease:'expo.out'},0);tl.fromTo('#parking-thanks',{scale:1.35},{scale:1,duration:.3,ease:'back.out(1.1)'},.4);tl.fromTo('#parking-ticket',{y:0},{y:-1800,rotation:12,duration:.38,ease:'power3.in'},2.42);`);
scene('question',8.2,2.6,`
 ${art()}<div class="kicker">TERUS...</div><h1 class="headline" style="top:345px;font-size:140px;line-height:1.05" id="question-title">Cerita<br>ke <span class="violet">siapa?</span></h1>
 ${img('doodle-arrow.svg','position:absolute;left:420px;top:760px;width:340px','id="question-arrow" data-layout-ignore')}
 <img id="question-comma" src="assets/brand/koma-symbol-violet.svg" style="position:absolute;left:170px;top:850px;width:170px;height:170px" data-layout-ignore>
`,`tl.fromTo('#question-title',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.4,ease:'power2.out'},.05);tl.fromTo('#question-arrow',{opacity:0},{opacity:1,duration:.1},.85);tl.fromTo('#question-comma',{scale:0,rotation:25},{scale:1,rotation:0,duration:.4,ease:'back.out(1.3)'},1.3);tl.fromTo('#question-comma',{scale:1},{scale:25,duration:.4,ease:'power3.in'},2.2);`);
scene('product',10.8,6.8,`
 ${art()}
 <div id="product-home" style="position:absolute;left:100px;top:205px;width:800px;height:920px;overflow:hidden;border:2px solid #CBC3B5;background:#F7F4EE" data-layout-allow-overflow><img src="assets/screens/home-mobile.png" style="width:800px;height:auto"><div class="small" style="position:absolute;left:0;right:0;bottom:0;background:#1D1B18;color:#fff;padding:15px;text-align:center">ruangkoma.web.id</div></div>
 <div id="product-compose" class="ui" style="top:255px">
  ${img('tape-purple.svg','', 'class="tape" data-layout-ignore')}
  <div class="ui-label violet" style="margin-bottom:20px">KOMA • LEMBAR BARU</div>
  <h2 class="ui-title">Tumpahkan<br>isi kepalamu.</h2>
  <div class="ui-rule"></div><div class="ui-label" style="margin-bottom:20px">IDENTITAS PENGIRIM</div>
  <div id="product-anon" class="chip" style="background:#ECE9FE;border-color:#5A46D6">◉ Tanpa Nama</div><div class="chip" style="margin-left:14px;background:#FAF8F5">○ Samaran</div>
  <div class="ui-label" style="margin:30px 0 18px">Naskah Coretan</div>
  <div class="ui-box" style="height:260px"><span id="product-typed">Tadi bilang “sama-sama”<br>ke mesin parkir.</span></div>
  <div class="ui-label" style="margin-top:30px;color:#3F2EA6">#cerita-kecil</div>
 </div>
  <div id="product-post" class="ui" style="top:295px;padding:38px" data-layout-allow-overflow>
  ${img('tape-kraft.svg','', 'class="tape" data-layout-ignore')}
  <div style="display:flex;justify-content:space-between;align-items:center"><span class="chip" style="background:#f1efeb">Tanpa Nama</span><span class="ui-label" style="color:#166534">Boleh Dibalas</span></div>
  <div class="ui-rule"></div><p style="font-size:65px;line-height:1.19;letter-spacing:-1.7px">Tadi bilang<br>“sama-sama”<br>ke mesin parkir.</p>
  <p class="ui-label violet" style="margin-top:28px">#cerita-kecil</p><div class="ui-rule"></div>
  <div style="display:flex;gap:24px;align-items:center" id="product-reactions">${['dengerin','relate','senyum','peluk'].map(x=>img('reactions/'+x+'.svg','width:45px;height:45px')).join('')}<span class="ui-label" style="margin-left:auto;font-size:29px">Beri tanggapan</span></div>
 </div>
 <div id="product-serious" class="note" style="left:150px;top:850px;width:710px;padding:32px"><span class="ui-label violet">Tanpa Nama</span><p style="font-size:44px;line-height:1.2;margin-top:16px">Hari ini akhirnya berani<br>bilang: aku butuh istirahat.</p></div>
 <div id="product-label" class="demo-label">ILUSTRASI CERITA • BUKAN POSTING ASLI</div>
`,`tl.fromTo('#product-home',{scale:1.07,opacity:0},{scale:1,opacity:1,duration:.3,ease:'power3.out'},0);tl.fromTo('#product-home',{x:0,rotation:0},{x:-1100,rotation:-6,duration:.4,ease:'power3.in'},1.05);tl.fromTo('#product-compose',{x:1100},{x:0,duration:.48,ease:'expo.out'},1.05);tl.fromTo('#product-typed',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.9,ease:'steps(18)'},1.75);tl.fromTo('#product-compose',{y:0},{y:-1500,duration:.4,ease:'power3.in'},3.05);tl.fromTo('#product-post',{y:1400,rotation:3,opacity:0},{y:0,rotation:0,opacity:1,duration:.45,ease:'expo.out'},3.15);tl.fromTo('#product-serious',{x:1100,rotation:8},{x:0,rotation:-3,duration:.45,ease:'expo.out'},4.65);tl.fromTo('#product-label',{opacity:0},{opacity:1,duration:.1},1.15);tl.fromTo('#product-canvas',{y:0},{y:-1920,duration:.33,ease:'power3.in'},6.47);`);
scene('modes',17.6,6.8,`
 ${art()}
 <div class="kicker">KAMU YANG TENTUKAN.</div>
 <div id="modes-open" class="ui" style="top:330px;padding:40px">
  <h2 class="ui-title" style="font-size:75px">Mau ngobrol?</h2><div class="ui-rule"></div>
  <div id="modes-open-button" class="ui-box" style="background:#ECE9FE;border-color:#5A46D6"><span class="ui-label violet" style="font-size:42px">Boleh Dibalas</span><p class="sans" style="font-size:31px;margin-top:10px">Terbuka komentar</p></div>
  <div class="ui-rule"></div><p style="font-size:46px;line-height:1.25">“Tadi bilang sama-sama<br>ke mesin parkir.”</p>
  <div id="modes-reply" style="background:#efede8;padding:28px;margin-top:35px;border:2px solid #ddd7ce"><span class="ui-label violet">Tanpa Nama</span><p class="sans" style="font-size:39px;margin-top:13px">Mesinnya pasti terharu.</p></div>
 </div>
 ${cursor('modes-cursor')}
 <div id="modes-listen" class="ui" style="top:330px;background:#1E1C1A;border-color:#38342E;color:#F7F4EE;padding:45px">
  <h2 class="ui-title" style="font-size:74px">Atau, cukup<br>didengar.</h2><div class="ui-rule" style="border-color:#555"></div>
  <div class="ui-box" style="background:#F4F1FD;border-color:#5A46D6;color:#1D1B18"><span class="ui-label violet" style="font-size:42px">Cukup Didengar</span><p class="sans" style="font-size:31px;margin-top:10px">Hanya ventilasi</p></div>
  <p style="font-size:48px;line-height:1.3;margin-top:40px">Hari ini pengin cerita.<br>Belum pengin nasihat.</p>
  <div style="display:flex;gap:24px;align-items:center;margin-top:45px"><img src="assets/visual/stamp-dengar.svg" style="width:155px;height:155px;background:#F7F4EE;border-radius:50%"><span style="font:700 37px 'Koma Mono'">Aku dengerin.</span></div>
 </div>
 <div class="demo-label">ILUSTRASI CERITA & PERCAKAPAN</div>
`,`tl.fromTo('#modes-open',{y:1200},{y:0,duration:.45,ease:'expo.out'},0);tl.fromTo('#modes-reply',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.3,ease:'power2.out'},1.6);tl.fromTo('#modes-cursor',{x:900,y:1000},{x:730,y:590,duration:.6,ease:'power2.inOut'},.65);tl.fromTo('#modes-cursor',{scale:1},{scale:.84,duration:.1,repeat:1,yoyo:true},1.45);tl.to('#modes-cursor',{opacity:0,duration:.15},2.6);tl.fromTo('#modes-open',{rotation:0,y:0},{rotation:-6,y:-1500,duration:.38,ease:'power3.in'},3.1);tl.fromTo('#modes-listen',{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.4,ease:'power3.out'},3.15);tl.fromTo('#modes-listen',{x:0},{x:-1200,duration:.3,ease:'power3.in'},6.5);`);
scene('studio',24.4,6.2,`
 ${art()}
 <div class="kicker" style="font-size:29px">PRATINJAU FITUR • DARI REPOSITORI</div>
 <div id="studio-panel" class="ui" style="top:295px;padding:38px">
  ${img('tape-purple.svg','', 'class="tape" data-layout-ignore')}
  <div class="ui-label violet">KOMA • STUDIO KONTEN AI</div>
  <h2 class="ui-title" style="font-size:48px;margin-top:18px">Ramu gagasan,<br>poles dengan sentuhanmu.</h2>
  <div class="ui-rule"></div><div style="display:flex;gap:14px"><span class="chip" style="background:#5A46D6;color:#fff;border-color:#5A46D6">Humor Receh</span><span class="chip">Pikiran Acak</span></div>
  <div class="ui-label" style="margin-top:20px;font-size:28px">Topik atau Kata Kunci (Opsional)</div>
  <div class="ui-box" style="font-size:38px;margin-top:15px;padding:17px">sama-sama ke mesin parkir</div>
  <div id="studio-button" class="ui-btn" style="margin-top:18px">Ramu 3 Saran</div>
  <div id="studio-result" style="margin-top:20px;padding:20px;border:2px solid #5A46D6;background:white"><div class="ui-label violet" style="font-size:28px">Opsi 1 • Terpilih untuk disunting</div><p style="font-size:35px;line-height:1.25;margin-top:12px">Sopan ke mesin parkir.<br>Siapa tahu dia juga butuh dihargai.</p></div>
 </div>
 <div id="studio-choice" class="paper" style="position:absolute;left:118px;top:570px;width:775px;padding:45px;background:#5A46D6;color:#fffdf8;border-color:#3F2EA6">
  <p style="font-size:87px;line-height:1.06;font-weight:700;letter-spacing:-3px">Tetap kamu<br>yang pilih.</p><p class="mono" style="font-size:30px;line-height:1.3;margin-top:30px">Baca. Sunting. Setujui.</p>
 </div>
 <div class="demo-label" style="font-size:28px;top:1110px">PRATINJAU • BELUM TERSEDIA DI SITUS LIVE</div>
 ${cursor('studio-cursor')}
`,`tl.fromTo('#studio-panel',{x:1080},{x:0,duration:.45,ease:'expo.out'},0);tl.fromTo('#studio-result',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.35,ease:'power2.out'},2.65);tl.fromTo('#studio-cursor',{x:950,y:1100},{x:550,y:800,duration:.45,ease:'power2.inOut'},1.9);tl.fromTo('#studio-cursor',{scale:1},{scale:.82,duration:.1,repeat:1,yoyo:true},2.4);tl.to('#studio-cursor',{opacity:0,duration:.1},3.2);tl.fromTo('#studio-choice',{x:-1100,rotation:-7},{x:0,rotation:-2,duration:.48,ease:'expo.out'},4.1);tl.fromTo('#studio-panel',{opacity:1},{opacity:.17,duration:.2},4.1);tl.fromTo('#studio-choice',{scale:1},{scale:4.5,duration:.33,ease:'power3.in'},5.87);`);
scene('close',30.6,6.4,`
 <div style="position:absolute;inset:0;background:#5A46D6"></div>
 <div id="close-art" style="position:absolute;left:0;right:0;bottom:0;height:620px;overflow:hidden" data-layout-ignore>${img('hero-main.webp','width:1200px;height:680px;object-fit:cover')}</div>
 <div id="close-paper" class="scrap" style="left:70px;top:190px;width:900px;height:1145px;padding:65px 45px">
  <div class="small" style="color:#3F2EA6;font-size:31px">ISI KEPALA BUKAN SATU GENRE.</div>
  <img id="close-logo" src="assets/brand/koma-logo-horizontal-color.svg" style="width:740px;height:290px;object-fit:contain;margin-top:70px">
  <h1 id="close-line" style="font-size:91px;line-height:1.06;letter-spacing:-3.8px;margin-top:40px">Jeda sebentar,<br>cerita apa aja.</h1>
  <div id="close-domain" style="margin-top:65px;font:700 48px 'Koma Mono';background:#1D1B18;color:#fffdf8;padding:25px 18px;text-align:center">ruangkoma.web.id ↗</div>
  <p id="close-invite" style="font:700 32px 'Koma Mono';margin-top:36px;text-align:center">Satu pikiranmu, boleh keluar.</p>
 </div>
 <div id="close-credit" style="position:absolute;left:110px;top:1395px;width:800px;font:400 23px/1.4 'Koma Mono';background:#F7F4EE;padding:18px 22px;color:#1D1B18" data-layout-ignore>Musik: “Local Forecast – Elevator”<br>Kevin MacLeod · incompetech.com · CC BY 4.0<br>creativecommons.org/licenses/by/4.0/ · dipotong & dimix</div>
`,`tl.fromTo('#close-paper',{rotation:5,scale:.78,y:150},{rotation:0,scale:1,y:0,duration:.55,ease:'expo.out'},0);tl.fromTo('#close-logo',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.5,ease:'power2.out'},.15);tl.fromTo('#close-line',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',duration:.4,ease:'power2.out'},1.25);tl.fromTo('#close-domain',{scaleX:0},{scaleX:1,duration:.4,ease:'expo.out'},2.3);tl.fromTo('#close-invite',{opacity:0},{opacity:1,duration:.15},3.1);tl.fromTo('#close-credit',{opacity:0},{opacity:1,duration:.2},3.6);`);

const voices=JSON.parse(fs.readFileSync('voice-timing.json','utf8'));
const starts=[.15,2.85,5.45,8.25,10.95,14.05,17.7,21,24.55,28.6,30.9];
voices.forEach((v,i)=>{v.start=starts[i];v.trimEnd=Math.min(v.duration,v.words.at(-1).end+.18)});
fs.writeFileSync('edit-timing.json',JSON.stringify({duration:D,fps:30,scenes,voices},null,2));
const splits=[[2,6],[3,5],[3,4],[2,3],[3,5],[4,4],[2,2],[3,2],[3,3,3],[4],[1,2,3]];
let caps='',ct='';let capId=0;
voices.forEach((v,i)=>{
 let k=0;for(const n of splits[i]){const words=v.words.slice(k,k+n);if(!words.length)continue;k+=n;let start=v.start+words[0].start,end=v.start+words.at(-1).end+.12;if(k>=v.words.length)end=Math.min(i===10?34.85:starts[i+1]||D,end+.25);const id='cap-'+capId++;
 caps+=`<div id="${id}" class="clip" data-start="${start.toFixed(3)}" data-duration="${(end-start).toFixed(3)}" data-track-index="0"><div class="caption-band"><span id="${id}-copy" class="caption-copy">${words.map((w,j)=>`<span ${j===words.length-1?'class="em"':''}>${esc(w.text)}</span>`).join(' ')}</span></div></div>`;
 ct+=`tl.fromTo('#${id}-copy',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.12,ease:'power2.out'},${start.toFixed(3)});`;
 }
});
fs.writeFileSync('compositions/captions.html',`<template><style>${sceneCss}\n#root{position:absolute;inset:0;background:transparent}</style><div id="root" data-composition-id="captions" data-width="1080" data-height="1920" data-duration="${D}">${caps}</div><script>(()=>{const tl=gsap.timeline({paused:true});${ct}tl.set({}, {}, ${D});window.__timelines['captions']=tl;})();</script></template>`);

const sfx=[['whoosh-short',2.48,.2],['whoosh-short',5.12,.19],['pop',5.8,.18],['click-soft',19.08,.28],['typing',12.58,.16],['click-soft',26.83,.25],['whoosh-short',30.35,.18],['impact-bass-1',30.75,.1]];
const audio=voices.map((v,i)=>`<audio id="voice-${i}" class="clip" data-start="${v.start}" data-duration="${v.trimEnd.toFixed(3)}" data-track-index="3" data-volume="1" src="${v.file}"></audio>`).join('\n')+`<audio id="music" class="clip" data-start="0" data-duration="37" data-media-start="8" data-track-index="4" data-volume="0.17" data-fade-in="0.08" data-fade-out="1.6" src="assets/audio/local-forecast-elevator.mp3"></audio>`+sfx.map(([name,start,volume],i)=>`<audio id="sfx-${i}" class="clip" data-start="${start}" data-duration="${name==='typing'?1.3:name==='impact-bass-1'?2.12:name==='pop'?.72:name==='click-soft'?.37:.57}" data-track-index="${5+i}" data-volume="${volume}" src="assets/audio/${name}.mp3"></audio>`).join('\n');
fs.writeFileSync('index.html',`<!doctype html><html lang="id" data-resolution="portrait" data-composition-variables='[{"id":"paper","type":"color","label":"Paper","default":"#F7F4EE"},{"id":"accent","type":"color","label":"Koma Violet","default":"#5A46D6"},{"id":"cta","type":"string","label":"Verified website","default":"ruangkoma.web.id"}]'><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><title>Koma — Isi kepala bukan satu genre</title><script src="assets/vendor/gsap.min.js"></script><style>${css}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${D}" data-width="1080" data-height="1920" data-fps="30">${scenes.map(s=>`<div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.duration}" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920"></div>`).join('\n')}<div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${D}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:100;pointer-events:none"></div>${audio}</div><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});tl.set({}, {}, ${D});window.__timelines.main=tl;</script></body></html>`);
fs.writeFileSync('VOICEOVER.md','# Koma — naskah voiceover final\n\nSuara laki-laki Indonesia: Ardi Neural. Narasi sintetis; bukan rekaman aktor.\n\n'+voices.map(v=>`**${v.start.toFixed(2)} detik** — ${v.text}`).join('\n\n')+'\n\nAdegan AI Studio secara eksplisit disebut rancangan dan diberi label pratinjau, karena komponen belum terhubung ke situs live.\n');
console.log('Built',scenes.length,'scenes,',capId,'caption groups, 37 seconds.');
