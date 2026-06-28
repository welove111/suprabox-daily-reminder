// SUPRABOX Daily Reminder v2.0 — Pure Node.js PNG
const zlib=require('zlib');
const SB_URL=process.env.SB_URL||'https://yjtkahuihipiodcrodwx.supabase.co';
const SB_KEY=process.env.SB_KEY||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdGthaHVpaGlwaW9kY3JvZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjIyMDIsImV4cCI6MjA5NDkzODIwMn0.wT-rH4aCSghPkHkfUkxQbubOFoW6lS6OdQ_GpWUmYWw';
const TG_TOKEN=process.env.TG_TOKEN||'8805635363:AAEkRtKADSIC0bZ9mAUU5t3y80LRaNTmHFc';
const TG_CHAT=process.env.TG_CHAT||'-1004296812387';
const WA_TOKEN=process.env.WA_TOKEN||'dpcfs8tuddj237mr';
const WA_INST=process.env.WA_INST||'instance179631';
const WA_GROUPS=(process.env.WA_GROUPS||'120363408144572779@g.us,120363421814781385@g.us').split(',');
const DAYS_FR=['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
const COLORS={'MATIN':[20,83,45,134,239,172,22,163,74],'SOIR':[59,7,100,216,180,254,147,51,234],'MATIN ET SOIR':[69,26,3,252,211,77,202,138,4],'CH COMMERCIAL':[127,29,29,252,165,165,239,68,68],'DEPLACEMENT':[66,32,6,253,230,138,245,158,11],'LIVRAISON':[6,78,59,110,231,183,16,185,129],'DEPART DAKHLA':[22,78,99,103,232,249,6,182,212],'DEPART LAAYOUNE':[22,78,99,103,232,249,6,182,212],'DEPART CASA':[22,78,99,103,232,249,6,182,212],'DEPART REGION AGADIR':[22,78,99,103,232,249,6,182,212],'DEPART MARRAKECH':[22,78,99,103,232,249,6,182,212],'DEPART TAROUDANT':[22,78,99,103,232,249,6,182,212],'RETOUR DE DAKHLA':[46,16,101,196,181,253,124,58,237],'RETOUR DE CASA':[46,16,101,196,181,253,124,58,237],'RAMASSAGE':[30,58,138,147,197,253,59,130,246],'RAMASSAGE INZGUAN':[30,58,138,96,165,250,29,78,216],'RAMASSAGE AGADIR':[12,74,110,125,211,252,2,132,199],'REPOS':[30,41,59,148,163,184,71,85,105],'CONGE':[20,83,45,134,239,172,34,197,94],'MALADIE':[127,29,29,252,165,165,248,113,113],'ASTREINTE':[67,20,7,253,186,116,249,115,22],'ABSENT':[127,29,29,252,165,165,220,38,38],'20:00 AU 08:00':[30,27,75,165,180,252,99,102,241]};
function getC(m){return m?(COLORS[m.toUpperCase().trim()]||[15,23,42,100,116,139,51,65,85]):[15,23,42,100,116,139,51,65,85];}
function crc32(b){let c=0xFFFFFFFF;const t=new Uint32Array(256);for(let i=0;i<256;i++){let k=i;for(let j=0;j<8;j++)k=k&1?0xEDB88320^(k>>>1):k>>>1;t[i]=k;}for(let i=0;i<b.length;i++)c=t[(c^b[i])&0xFF]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
function chunk(type,data){const t=Buffer.from(type),l=Buffer.alloc(4);l.writeUInt32BE(data.length);const cv=Buffer.alloc(4);cv.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([l,t,data,cv]);}
function makePNG(W,H,px){
  const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2;
  const raw=Buffer.alloc(H*(1+W*3));
  for(let y=0;y<H;y++){raw[y*(1+W*3)]=0;for(let x=0;x<W;x++){const si=(y*W+x)*4,di=y*(1+W*3)+1+x*3;raw[di]=px[si];raw[di+1]=px[si+1];raw[di+2]=px[si+2];}}
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:6})),chunk('IEND',Buffer.alloc(0))]);
}
function sp(px,W,x,y,r,g,b){if(x<0||y<0||x>=W)return;const i=(y*W+x)*4;px[i]=r;px[i+1]=g;px[i+2]=b;px[i+3]=255;}
function fr(px,W,x0,y0,x1,y1,r,g,b){for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)sp(px,W,x,y,r,g,b);}
const F={'A':[14,17,17,31,17,17,17],'B':[30,17,17,30,17,17,30],'C':[14,17,16,16,16,17,14],'D':[28,18,17,17,17,18,28],'E':[31,16,16,30,16,16,31],'F':[31,16,16,30,16,16,16],'G':[14,17,16,23,17,17,14],'H':[17,17,17,31,17,17,17],'I':[14,4,4,4,4,4,14],'J':[7,2,2,2,2,18,12],'K':[17,18,20,24,20,18,17],'L':[16,16,16,16,16,16,31],'M':[17,27,21,17,17,17,17],'N':[17,25,21,19,17,17,17],'O':[14,17,17,17,17,17,14],'P':[30,17,17,30,16,16,16],'Q':[14,17,17,17,21,18,13],'R':[30,17,17,30,20,18,17],'S':[14,17,16,14,1,17,14],'T':[31,4,4,4,4,4,4],'U':[17,17,17,17,17,17,14],'V':[17,17,17,17,17,10,4],'W':[17,17,17,21,21,27,17],'X':[17,17,10,4,10,17,17],'Y':[17,17,10,4,4,4,4],'Z':[31,1,2,4,8,16,31],'0':[14,17,19,21,25,17,14],'1':[4,12,4,4,4,4,14],'2':[14,17,1,6,8,16,31],'3':[31,1,2,6,1,17,14],'4':[2,6,10,18,31,2,2],'5':[31,16,30,1,1,17,14],'6':[6,8,16,30,17,17,14],'7':[31,1,2,4,8,8,8],'8':[14,17,17,14,17,17,14],'9':[14,17,17,15,1,2,12],' ':[0,0,0,0,0,0,0],'-':[0,0,0,31,0,0,0],'.':[0,0,0,0,0,4,0],':':[0,4,0,0,4,0,0],'/':[1,2,2,4,8,8,16]};
function dc(px,W,cx,cy,ch,r,g,b,s=1){const bits=F[ch.toUpperCase()]||F[' '];for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(bits[row]&(1<<(4-col)))for(let sy=0;sy<s;sy++)for(let sx=0;sx<s;sx++)sp(px,W,cx+col*s+sx,cy+row*s+sy,r,g,b);}
function dt(px,W,x,y,text,r,g,b,s=1){let cx=x;for(const ch of text.toUpperCase()){dc(px,W,cx,cy=y,ch,r,g,b,s);cx+=(5+1)*s;}return cx;}
function tw(t,s=1){return t.length*6*s;}
function buildImage(data){
  const{day,dateFormatted,rows}=data;
  const W=600,HDR=70,ROW_H=52,PAD=20,H=HDR+rows.length*ROW_H+40;
  const px=new Uint8Array(W*H*4);
  for(let i=0;i<W*H;i++){px[i*4]=2;px[i*4+1]=5;px[i*4+2]=9;px[i*4+3]=255;}
  for(let x=0;x<W;x+=30)fr(px,W,x,0,x+1,H,5,12,18);
  for(let y=0;y<H;y+=30)fr(px,W,0,y,W,y+1,5,12,18);
  fr(px,W,0,0,W,HDR,4,14,26);
  fr(px,W,0,HDR-2,W,HDR,0,180,220);
  dt(px,W,PAD,16,'SUPRA',255,255,255,2);
  dt(px,W,PAD+tw('SUPRA',2)+4,16,'BOX',245,166,35,2);
  fr(px,W,PAD+tw('SUPRABOX',2)+8,12,PAD+tw('SUPRABOX',2)+10,HDR-10,0,100,120);
  dt(px,W,PAD+tw('SUPRABOX',2)+16,14,'ROULEMENT CHAUFFEURS',0,200,230,1);
  dt(px,W,PAD+tw('SUPRABOX',2)+16,26,'PLANNING QUOTIDIEN',80,140,160,1);
  const bW=110;
  fr(px,W,W-PAD-bW,8,W-PAD,HDR-8,0,30,50);
  fr(px,W,W-PAD-bW,8,W-PAD,9,0,180,220);
  fr(px,W,W-PAD-bW,8,W-PAD-bW+1,HDR-8,0,180,220);
  dt(px,W,W-PAD-bW+Math.floor((bW-tw(day,2))/2),14,day,245,166,35,2);
  const sd=dateFormatted.split(' ').slice(1,4).join(' ');
  dt(px,W,W-PAD-bW+Math.floor((bW-tw(sd,1))/2),38,sd,150,200,220,1);
  const colY=HDR+4;
  fr(px,W,PAD,colY,W-PAD,colY+22,4,10,20);
  dt(px,W,PAD+8,colY+7,'CHAUFFEUR',0,180,220,1);
  dt(px,W,PAD+200,colY+7,'MISSION DU JOUR',0,180,220,1);
  fr(px,W,PAD,colY+22,W-PAD,colY+23,0,60,90);
  rows.forEach((row,i)=>{
    const rY=HDR+26+i*ROW_H,bg=i%2===0?[7,16,30]:[4,10,20];
    fr(px,W,PAD,rY,W-PAD,rY+ROW_H,bg[0],bg[1],bg[2]);
    fr(px,W,PAD+4,rY+10,PAD+22,rY+ROW_H-10,20,30,45);
    dt(px,W,PAD+7,rY+15,String(i+1),100,140,160,1);
    dt(px,W,PAD+26,rY+10,row.driver,220,235,245,1);
    dt(px,W,PAD+26,rY+22,'CHAUFFEUR N'+( i+1),60,90,110,1);
    fr(px,W,PAD+185,rY+6,PAD+186,rY+ROW_H-6,0,50,80);
    if(row.mission&&row.mission.trim()){
      const c=getC(row.mission),mbg=c.slice(0,3),mtxt=c.slice(3,6),mbar=c.slice(6,9);
      const mX=PAD+192,mY=rY+8,mW=W-PAD-mX-4,mH=ROW_H-16;
      fr(px,W,mX,mY,mX+mW,mY+mH,mbg[0],mbg[1],mbg[2]);
      fr(px,W,mX,mY,mX+3,mY+mH,mbar[0],mbar[1],mbar[2]);
      dt(px,W,mX+6,mY+Math.floor((mH-7)/2),row.mission.toUpperCase(),mtxt[0],mtxt[1],mtxt[2],1);
    }else{dt(px,W,PAD+196,rY+20,'NON DEFINI',60,80,100,1);}
    fr(px,W,PAD,rY+ROW_H-1,W-PAD,rY+ROW_H,0,30,50);
  });
  const ftY=HDR+26+rows.length*ROW_H;
  fr(px,W,PAD,ftY,W-PAD,ftY+1,0,100,80);
  dt(px,W,PAD,ftY+8,'SUPRABOX · TASSILA MESSAGERIES · AGADIR',40,80,90,1);
  dt(px,W,PAD,ftY+20,'ENVOI AUTOMATIQUE 22H00',0,120,140,1);
  return makePNG(W,H,px);
}
async function sbFetch(path){const r=await fetch(`${SB_URL}/rest/v1${path}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});if(!r.ok)throw new Error(`SB ${r.status}`);return r.json();}
async function getTomorrow(){
  const tom=new Date(Date.now()+3600000);tom.setDate(tom.getDate()+1);
  const day=DAYS_FR[tom.getDay()];
  if(day==='DIMANCHE'){console.log('Dimanche');return null;}
  const ds=`${tom.getFullYear()}-${String(tom.getMonth()+1).padStart(2,'0')}-${String(tom.getDate()).padStart(2,'0')}`;
  console.log(`Demain: ${ds} (${day})`);
  const rows=await sbFetch(`/weekly_data?week_start=lte.${ds}&week_end=gte.${ds}&select=driver,missions`);
  if(!rows||!rows.length){console.log('Pas de données');return null;}
  return{day,dateFormatted:tom.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}),rows:rows.map(r=>({driver:r.driver,mission:(r.missions&&r.missions[day])?r.missions[day].trim():''})).filter(r=>r.driver)};
}
async function sendTG(buf,cap){
  const b='B'+Date.now();
  const hdr=Buffer.from(`--${b}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TG_CHAT}\r\n--${b}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown\r\n--${b}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${cap}\r\n--${b}\r\nContent-Disposition: form-data; name="photo"; filename="p.png"\r\nContent-Type: image/png\r\n\r\n`);
  const body=Buffer.concat([hdr,buf,Buffer.from(`\r\n--${b}--\r\n`)]);
  const r=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`,{method:'POST',headers:{'Content-Type':`multipart/form-data; boundary=${b}`},body});
  const j=await r.json();if(!j.ok)throw new Error('TG:'+JSON.stringify(j));console.log('✅ TG OK');
}
async function sendWA(buf,cap){
  const b64='data:image/png;base64,'+buf.toString('base64');
  for(const g of WA_GROUPS){try{const r=await fetch(`https://api.ultramsg.com/${WA_INST}/messages/image`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:WA_TOKEN,to:g,image:b64,caption:cap.replace(/\*/g,'')})});const j=await r.json();console.log(`✅ WA ${g}:`,j.sent||'ok');}catch(e){console.error(`❌ WA:`,e.message);}}
}
async function main(){
  console.log('🚀 v2.0',new Date().toISOString());
  try{
    const d=await getTomorrow();if(!d)return;
    d.rows.forEach(r=>console.log(`• ${r.driver}: ${r.mission||'vide'}`));
    console.log('🎨 Building PNG...');
    const png=buildImage(d);console.log(`✅ PNG ${Math.round(png.length/1024)}KB`);
    const cap=`📋 *PLANNING ${d.day}* — ${d.dateFormatted}\n`+d.rows.map(r=>`• *${r.driver}*: ${r.mission||'Non défini'}`).join('\n')+`\n_SUPRABOX · Tassila_`;
    await sendTG(png,cap);await sendWA(png,cap);console.log('✅ Done!');
  }catch(e){console.error('❌',e.message);process.exit(1);}
}
main();
