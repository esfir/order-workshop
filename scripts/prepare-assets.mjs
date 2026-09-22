import fs from 'node:fs';
import vm from 'node:vm';
import sharp from 'sharp';
const base='public/assets';
for(const dir of ['ui','icons','keys','effects','audio']) fs.mkdirSync(`${base}/${dir}`,{recursive:true});
const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
async function png(dir,name,w,h,body){await sharp(Buffer.from(svg(w,h,body))).png().toFile(`${base}/${dir}/${name}.png`)}
for(const name of ['order','progress','hint','message','score']) await png('ui',`panel_${name}`,600,300,`<rect x="3" y="3" width="594" height="294" rx="30" fill="${name==='score'?'#fff3d7':'#ffffff'}" stroke="#e3ddef" stroke-width="3"/>`);
for(const [name,symbol] of Object.entries({play:'▶',restart:'↻',next:'→',home:'⌂',sound_on:'♪',sound_off:'×'})) await png('ui',`btn_${name}`,240,100,`<rect x="3" y="8" width="234" height="89" rx="22" fill="#5947b1"/><rect x="3" y="3" width="234" height="85" rx="22" fill="#7460d6"/><text x="120" y="60" text-anchor="middle" fill="white" font-family="Arial" font-size="42">${symbol}</text>`);
for(const [name,symbol] of Object.entries({star:'★',check:'✓',warning:'!',click:'↖',duplicate:'▣',order:'▤'})) await png('icons',`icon_${name}`,96,96,`<rect x="4" y="4" width="88" height="88" rx="25" fill="${name==='star'?'#fff0c9':'#eee9fa'}"/><text x="48" y="67" text-anchor="middle" font-family="Arial" font-size="58" fill="${name==='star'?'#d4a548':'#8874b8'}">${symbol}</text>`);
for(const [name,symbol] of Object.entries({ctrl:'Ctrl',command:'⌘',d:'D',plus:'+'})) await png('keys',`key_${name}`,110,96,`<rect x="3" y="7" width="104" height="86" rx="18" fill="#d8d3e4"/><rect x="3" y="3" width="104" height="81" rx="18" fill="white" stroke="#e0dbea"/><text x="55" y="60" text-anchor="middle" font-family="Arial" font-size="34" fill="#71677e">${symbol}</text>`);
await png('effects','fx_glow',256,256,'<defs><radialGradient id="g"><stop stop-color="#b19be9" stop-opacity=".7"/><stop offset="1" stop-color="#b19be9" stop-opacity="0"/></radialGradient></defs><circle cx="128" cy="128" r="128" fill="url(#g)"/>');
await png('effects','fx_star',128,128,'<path d="M64 8 L78 47 120 49 87 76 98 117 64 94 30 117 41 76 8 49 50 47Z" fill="#efc365"/>');
await png('effects','fx_success',128,128,'<circle cx="64" cy="64" r="57" fill="#dcf0e5"/><path d="m32 65 22 22 42-47" fill="none" stroke="#71aa8f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>');
await png('effects','fx_confetti',400,400,Array.from({length:35},(_,i)=>`<rect x="${i*73%380}" y="${i*113%380}" width="8" height="17" rx="2" fill="${['#ae9be3','#efc365','#8ac9b4'][i%3]}" transform="rotate(${i*37} ${i*73%380} ${i*113%380})"/>`).join(''));
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('node_modules/lamejs/lame.all.js','utf8'),context);
const sampleRate=44100;
const sounds={ui_click:[640],item_select:[740],duplicate:[660,880],slot_fill:[880],order_complete:[523,659,784],reward:[1047,1319],wrong_item:[330,294],nothing_selected:[392,330],hint:[523,660],finish:[523,659,784,1047]};
for(const [name,notes] of Object.entries(sounds)) { const samples=new Int16Array(Math.ceil((notes.length*.095+.24)*sampleRate)); notes.forEach((f,i)=>{for(let j=0;j<.22*sampleRate;j++){const t=j/sampleRate;const env=Math.min(t/.012,1)*Math.exp(-t*22);samples[Math.floor(i*.095*sampleRate)+j]+=Math.sin(2*Math.PI*f*t)*env*5000;}}); encode(name,samples); }
const music=new Int16Array(sampleRate*16);const notes=[261.63,329.63,392,329.63,220,261.63,349.23,261.63,174.61,220,261.63,220,196,246.94,293.66,246.94];
notes.forEach((f,i)=>{for(let j=0;j<sampleRate;j++){let t=j/sampleRate;music[i*sampleRate+j]=Math.sin(2*Math.PI*f*t)*Math.sin(Math.PI*t)**2*2200+Math.sin(2*Math.PI*f/2*t)*Math.sin(Math.PI*t)**2*1000;}});encode('background_loop',music);
function encode(name,samples){const enc=new context.lamejs.Mp3Encoder(1,sampleRate,128);let chunks=[];for(let i=0;i<samples.length;i+=1152) chunks.push(Buffer.from(enc.encodeBuffer(samples.subarray(i,i+1152))));chunks.push(Buffer.from(enc.flush()));fs.writeFileSync(`${base}/audio/${name}.mp3`,Buffer.concat(chunks));}
for(const file of fs.readdirSync(`${base}/items`)){const path=`${base}/items/${file}`; const metadata=await sharp(path).metadata();console.log(file,metadata.width,metadata.height,'alpha',metadata.hasAlpha); const buffer=await sharp(path).resize(512,512,{fit:'inside'}).png().toBuffer();fs.writeFileSync(path,buffer);}
console.log('UI assets and 11 MP3 files generated');
