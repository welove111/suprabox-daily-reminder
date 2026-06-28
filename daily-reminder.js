const SB_URL=process.env.SB_URL||'https://yjtkahuihipiodcrodwx.supabase.co';
const SB_KEY=process.env.SB_KEY||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdGthaHVpaGlwaW9kY3JvZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjIyMDIsImV4cCI6MjA5NDkzODIwMn0.wT-rH4aCSghPkHkfUkxQbubOFoW6lS6OdQ_GpWUmYWw';
const TG_TOKEN=process.env.TG_TOKEN||'8805635363:AAEkRtKADSIC0bZ9mAUU5t3y80LRaNTmHFc';
const TG_CHAT=process.env.TG_CHAT||'-1004296812387';
const WA_TOKEN=process.env.WA_TOKEN||'dpcfs8tuddj237mr';
const WA_INST=process.env.WA_INST||'instance179631';
const WA_GROUPS=(process.env.WA_GROUPS||'120363408144572779@g.us,120363421814781385@g.us').split(',');
const DAYS_FR=['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
const EMOJIS={'MATIN':'🟢','SOIR':'🟣','MATIN ET SOIR':'🟡','DEPART DAKHLA':'🔵','DEPART LAAYOUNE':'🔵','DEPART CASA':'🔵','DEPART REGION AGADIR':'🔵','DEPART MARRAKECH':'🔵','DEPART TAROUDANT':'🔵','RETOUR DE DAKHLA':'🟤','RETOUR DE CASA':'🟤','RAMASSAGE':'🔷','RAMASSAGE INZGUAN':'🔷','RAMASSAGE AGADIR':'🔷','LIVRAISON':'🟩','CH COMMERCIAL':'🔴','DEPLACEMENT':'🟠','REPOS':'⚫','CONGE':'✅','MALADIE':'🏥','ASTREINTE':'⚠️','ABSENT':'❌','20:00 AU 08:00':'🌙'};
function getEmoji(m){return m?(EMOJIS[m.toUpperCase().trim()]||'▪️'):'⚫';}
async function sbFetch(path){const r=await fetch(`${SB_URL}/rest/v1${path}`,{headers:{'apikey':SB_KEY,'Authorization':`Bearer ${SB_KEY}`}});if(!r.ok)throw new Error(`SB ${r.status}`);return r.json();}
async function getTomorrow(){
  const tom=new Date(Date.now()+3600000);tom.setDate(tom.getDate()+1);
  const day=DAYS_FR[tom.getDay()];
  if(day==='DIMANCHE'){console.log('Dimanche — pas envoi');return null;}
  const ds=`${tom.getFullYear()}-${String(tom.getMonth()+1).padStart(2,'0')}-${String(tom.getDate()).padStart(2,'0')}`;
  console.log(`Demain: ${ds} (${day})`);
  const rows=await sbFetch(`/weekly_data?week_start=lte.${ds}&week_end=gte.${ds}&select=driver,missions`);
  if(!rows||!rows.length){console.log('Pas de donnees');return null;}
  const df=tom.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  return{day,dateFormatted:df,rows:rows.map(r=>({driver:r.driver,mission:(r.missions&&r.missions[day])?r.missions[day].trim():''})).filter(r=>r.driver)};
}
function buildTG(d){
  const lines=[`╔══════════════════════════╗`,`║  📋 SUPRABOX — PLANNING  ║`,`╚══════════════════════════╝`,``,`📅 *${d.day}* — ${d.dateFormatted}`,`🏢 Tassila Messageries · Agadir`,``,`━━━━━━━━━━━━━━━━━━━━━━━━━━`];
  d.rows.forEach((r,i)=>{lines.push(`${getEmoji(r.mission)} *${r.driver}*`);lines.push(`   ↳ ${r.mission||'Non défini'}`);if(i<d.rows.length-1)lines.push('');});
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━','','_SUPRABOX · Envoi automatique 22h00_');
  return lines.join('\n');
}
function buildWA(d){
  const lines=[`📋 PLANNING ${d.day}`,`📅 ${d.dateFormatted}`,`🏢 Tassila Messageries · Agadir`,``,`─────────────────────`];
  d.rows.forEach(r=>lines.push(`${getEmoji(r.mission)} ${r.driver}: ${r.mission||'Non défini'}`));
  lines.push(`─────────────────────`,`SUPRABOX · 22h00 automatique`);
  return lines.join('\n');
}
async function sendTG(msg){
  const r=await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:TG_CHAT,text:msg,parse_mode:'Markdown'})});
  const j=await r.json();if(!j.ok)throw new Error('TG: '+JSON.stringify(j));console.log('✅ Telegram OK');
}
async function sendWA(msg){
  for(const g of WA_GROUPS){try{const r=await fetch(`https://api.ultramsg.com/${WA_INST}/messages/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:WA_TOKEN,to:g,body:msg})});const j=await r.json();console.log(`✅ WA ${g}:`,j.sent||'ok');}catch(e){console.error(`❌ WA:`,e.message);}}
}
async function main(){
  console.log('🚀 SUPRABOX v1.3',new Date().toISOString());
  try{const d=await getTomorrow();if(!d)return;d.rows.forEach(r=>console.log(`• ${r.driver}: ${r.mission||'vide'}`));await sendTG(buildTG(d));await sendWA(buildWA(d));console.log('✅ Done!');}
  catch(e){console.error('❌',e.message);process.exit(1);}
}
main();
