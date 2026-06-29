// ══════════════════════════════════════════════
// SUPRABOX — Daily Reminder Bot
// Envoie chaque jour à 22h00 les missions du lendemain
// Railway cron: 0 21 * * 0-5  (UTC 21h = Maroc 22h)
// Dimanche: pas d'envoi (pas de travail lundi = repos)
// ══════════════════════════════════════════════

const { createCanvas } = require('@napi-rs/canvas');

// ── CONFIG ──────────────────────────────────────
const SB_URL     = process.env.SB_URL     || 'https://yjtkahuihipiodcrodwx.supabase.co';
const SB_KEY     = process.env.SB_KEY     || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdGthaHVpaGlwaW9kY3JvZHd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjIyMDIsImV4cCI6MjA5NDkzODIwMn0.wT-rH4aCSghPkHkfUkxQbubOFoW6lS6OdQ_GpWUmYWw';
const TG_TOKEN   = process.env.TG_TOKEN   || '8805635363:AAEkRtKADSIC0bZ9mAUU5t3y80LRaNTmHFc';
const TG_CHAT    = process.env.TG_CHAT    || '-1004296812387';
const WA_TOKEN   = process.env.WA_TOKEN   || 'dpcfs8tuddj237mr';
const WA_INST    = process.env.WA_INST    || 'instance179631';
const WA_GROUPS  = (process.env.WA_GROUPS || '120363408144572779@g.us,120363421814781385@g.us').split(',');

// ── JOURS ────────────────────────────────────────
const DAYS_FR = ['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
const DAYS_SHORT = { LUNDI:'Lun', MARDI:'Mar', MERCREDI:'Mer', JEUDI:'Jeu', VENDREDI:'Ven', SAMEDI:'Sam', DIMANCHE:'Dim' };

// ── COULEURS MISSIONS ─────────────────────────────
const COLORS = {
  'RAMASSAGE':            { bg:'#1e3a8a', txt:'#93c5fd', bar:'#3b82f6' },
  'RAMASSAGE INZGUAN':    { bg:'#1e3a8a', txt:'#60a5fa', bar:'#1d4ed8' },
  'RAMASSAGE AGADIR':     { bg:'#0c4a6e', txt:'#7dd3fc', bar:'#0284c7' },
  'MATIN':                { bg:'#14532d', txt:'#86efac', bar:'#16a34a' },
  'SOIR':                 { bg:'#3b0764', txt:'#d8b4fe', bar:'#9333ea' },
  'MATIN ET SOIR':        { bg:'#451a03', txt:'#fcd34d', bar:'#ca8a04' },
  'CH COMMERCIAL':        { bg:'#7f1d1d', txt:'#fca5a5', bar:'#ef4444' },
  'DEPLACEMENT':          { bg:'#422006', txt:'#fde68a', bar:'#f59e0b' },
  'LIVRAISON':            { bg:'#064e3b', txt:'#6ee7b7', bar:'#10b981' },
  'DEPART DAKHLA':        { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'DEPART LAAYOUNE':      { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'DEPART CASA':          { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'DEPART REGION AGADIR': { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'DEPART MARRAKECH':     { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'DEPART TAROUDANT':     { bg:'#164e63', txt:'#67e8f9', bar:'#06b6d4' },
  'RETOUR DE DAKHLA':     { bg:'#2e1065', txt:'#c4b5fd', bar:'#7c3aed' },
  'RETOUR DE CASA':       { bg:'#2e1065', txt:'#c4b5fd', bar:'#7c3aed' },
  'REPOS':                { bg:'#1e293b', txt:'#94a3b8', bar:'#475569' },
  'CONGE':                { bg:'#14532d', txt:'#86efac', bar:'#22c55e' },
  'MALADIE':              { bg:'#7f1d1d', txt:'#fca5a5', bar:'#f87171' },
  'ASTREINTE':            { bg:'#431407', txt:'#fdba74', bar:'#f97316' },
  'ABSENT':               { bg:'#7f1d1d', txt:'#fca5a5', bar:'#dc2626' },
  '20:00 AU 08:00':       { bg:'#1e1b4b', txt:'#a5b4fc', bar:'#6366f1' },
  'DEFAULT':              { bg:'#0f172a', txt:'#64748b', bar:'#334155' },
};

function getColor(mission) {
  if (!mission || mission.trim() === '') return null;
  return COLORS[mission.toUpperCase()] || COLORS['DEFAULT'];
}

// ── SUPABASE ──────────────────────────────────────
async function sbFetch(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    method: opts.method || 'GET',
    headers: {
      'apikey': SB_KEY,
      'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.prefer ? { 'Prefer': opts.prefer } : {}),
    },
    body: opts.body || undefined,
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── GET TOMORROW'S MISSIONS ──────────────────────
async function getTomorrowMissions() {
  const now = new Date();

  // Maroc timezone (UTC+1)
  const marocOffset = 1 * 60;
  const marocNow = new Date(now.getTime() + marocOffset * 60000);

  const tomorrowMaroc = new Date(marocNow);
  tomorrowMaroc.setDate(tomorrowMaroc.getDate() + 1);

  const dayIndex = tomorrowMaroc.getDay(); // 0=Dim, 1=Lun, ...
  const dayName  = DAYS_FR[dayIndex];

  // Pas d'envoi si demain = Dimanche
  if (dayName === 'DIMANCHE') {
    console.log('Demain = Dimanche — pas d\'envoi.');
    return null;
  }

  // Format date YYYY-MM-DD
  const yyyy = tomorrowMaroc.getFullYear();
  const mm   = String(tomorrowMaroc.getMonth() + 1).padStart(2, '0');
  const dd   = String(tomorrowMaroc.getDate()).padStart(2, '0');
  const tomorrowStr = `${yyyy}-${mm}-${dd}`;

  console.log(`Demain: ${tomorrowStr} (${dayName})`);

  // Chercher la semaine qui contient demain
  const rows = await sbFetch(
    `/weekly_data?week_start=lte.${tomorrowStr}&week_end=gte.${tomorrowStr}&select=driver,missions,week_start,week_end`
  );

  if (!rows || rows.length === 0) {
    console.log('Aucune donnée trouvée pour demain.');
    return null;
  }

  return {
    day: dayName,
    date: tomorrowStr,
    dateFormatted: tomorrowMaroc.toLocaleDateString('fr-FR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }),
    rows: rows.map(r => ({
      driver: r.driver,
      mission: (r.missions && r.missions[dayName]) ? r.missions[dayName] : '',
    })).filter(r => r.driver),
  };
}

// ── BUILD IMAGE ───────────────────────────────────
async function buildImage(data) {
  const { day, dateFormatted, rows } = data;

  const W        = 900;
  const HEADER_H = 100;
  const ROW_H    = 72;
  const PAD      = 32;
  const DRV_W    = 320;
  const MIS_W    = W - DRV_W - PAD * 2 - 20;
  const H        = HEADER_H + rows.length * ROW_H + PAD * 2 + 60;

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // ── BG ──
  ctx.fillStyle = '#020509';
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = 'rgba(0,229,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // ── HEADER ──
  const grad = ctx.createLinearGradient(0, 0, W, HEADER_H);
  grad.addColorStop(0, 'rgba(0,229,255,0.12)');
  grad.addColorStop(1, 'rgba(245,166,35,0.08)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, HEADER_H);

  // Header border bottom
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0,   'transparent');
  lineGrad.addColorStop(0.3, '#00e5ff');
  lineGrad.addColorStop(0.7, '#f5a623');
  lineGrad.addColorStop(1,   'transparent');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, HEADER_H - 2, W, 2);

  // SUPRABOX logo
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SUPRA', PAD, 38);
  ctx.fillStyle = '#f5a623';
  ctx.fillText('BOX', PAD + 80, 38);

  // Separator
  ctx.fillStyle = 'rgba(0,229,255,0.3)';
  ctx.fillRect(PAD + 130, 20, 1, 36);

  // Title
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText('ROULEMENT CHAUFFEURS', PAD + 148, 32);

  ctx.font = '11px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('PLANNING QUOTIDIEN · TASSILA MESSAGERIES · AGADIR', PAD + 148, 52);

  // Date badge
  const badgeX = W - PAD - 220;
  ctx.fillStyle = 'rgba(0,229,255,0.1)';
  roundRect(ctx, badgeX, 20, 220, 56, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,229,255,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, badgeX, 20, 220, 56, 10);
  ctx.stroke();

  ctx.font = 'bold 13px Arial';
  ctx.fillStyle = '#f5a623';
  ctx.textAlign = 'center';
  ctx.fillText(day.toUpperCase(), badgeX + 110, 40);
  ctx.font = '11px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(dateFormatted.split(' ').slice(1).join(' '), badgeX + 110, 60);
  ctx.textAlign = 'left';

  // ── TABLE HEADER ──
  const tY = HEADER_H + PAD;
  ctx.fillStyle = 'rgba(4,10,20,0.98)';
  roundRect(ctx, PAD, tY, W - PAD * 2, 44, 10);
  ctx.fill();

  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = 'rgba(0,229,255,0.7)';
  ctx.letterSpacing = '2px';
  ctx.fillText('CHAUFFEUR', PAD + 20, tY + 22);
  ctx.fillText('MISSION DU JOUR', PAD + DRV_W + 20, tY + 22);

  // Table border top
  const thGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  thGrad.addColorStop(0, 'transparent');
  thGrad.addColorStop(0.5, 'rgba(0,229,255,0.3)');
  thGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = thGrad;
  ctx.fillRect(PAD, tY, W - PAD * 2, 1);

  // ── ROWS ──
  rows.forEach((row, i) => {
    const rowY = tY + 44 + i * ROW_H;
    const isEven = i % 2 === 0;

    // Row bg
    ctx.fillStyle = isEven ? 'rgba(7,16,30,0.9)' : 'rgba(4,10,20,0.9)';
    ctx.fillRect(PAD, rowY, W - PAD * 2, ROW_H);

    // Row border bottom
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(PAD, rowY + ROW_H - 1, W - PAD * 2, 1);

    // Driver number badge
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    roundRect(ctx, PAD + 12, rowY + ROW_H/2 - 14, 28, 28, 5);
    ctx.fill();
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText(`${i+1}`, PAD + 26, rowY + ROW_H/2 + 1);
    ctx.textAlign = 'left';

    // Driver name
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = '#e2eaf4';
    ctx.fillText(row.driver, PAD + 52, rowY + ROW_H/2 - 4);

    // Driver subtitle
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText(`Chauffeur N°${i+1}`, PAD + 52, rowY + ROW_H/2 + 14);

    // Separator vertical
    ctx.fillStyle = 'rgba(0,229,255,0.08)';
    ctx.fillRect(PAD + DRV_W, rowY + 12, 1, ROW_H - 24);

    // Mission badge
    const mission = row.mission;
    if (mission && mission.trim() !== '') {
      const color = getColor(mission);
      const misX = PAD + DRV_W + 16;
      const misY = rowY + ROW_H/2 - 18;
      const misW = MIS_W - 16;
      const misH = 36;

      // Badge bg
      ctx.fillStyle = color.bg;
      roundRect(ctx, misX, misY, misW, misH, 8);
      ctx.fill();

      // Left bar accent
      ctx.fillStyle = color.bar;
      roundRect(ctx, misX, misY, 4, misH, 4);
      ctx.fill();

      // Mission text
      ctx.font = 'bold 13px Arial';
      ctx.fillStyle = color.txt;
      ctx.textAlign = 'center';
      ctx.fillText(mission.toUpperCase(), misX + misW/2 + 2, misY + misH/2 + 1);
      ctx.textAlign = 'left';

    } else {
      // No mission
      ctx.font = '12px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillText('— Repos / Non défini —', PAD + DRV_W + 20, rowY + ROW_H/2 + 4);
    }
  });

  // Bottom border
  const btY = tY + 44 + rows.length * ROW_H;
  const btGrad = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  btGrad.addColorStop(0, 'transparent');
  btGrad.addColorStop(0.5, 'rgba(245,166,35,0.3)');
  btGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = btGrad;
  ctx.fillRect(PAD, btY, W - PAD * 2, 1);

  // ── FOOTER ──
  const footY = btY + 20;
  ctx.font = '10px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'center';
  ctx.fillText('SUPRABOX · Tassila Messageries · ONCF/SUPRATOURS · Agadir', W/2, footY + 12);
  ctx.fillStyle = 'rgba(0,229,255,0.3)';
  ctx.fillText(`Envoi automatique ${new Date().toLocaleString('fr-FR')}`, W/2, footY + 28);
  ctx.textAlign = 'left';

  return canvas.toBuffer('image/png');
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── SEND TELEGRAM ─────────────────────────────────
async function sendTelegram(imageBuffer, caption) {
  // Use multipart/form-data manually
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  
  const header = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="chat_id"\r\n\r\n${TG_CHAT}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n` +
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="photo"; filename="planning.png"\r\n` +
    `Content-Type: image/png\r\n\r\n`
  );
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, imageBuffer, footer]);

  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
    },
    body,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch(e) { throw new Error('Telegram parse error: ' + text.slice(0,200)); }
  if (!json.ok) throw new Error(`Telegram error: ${JSON.stringify(json)}`);
  console.log('✅ Telegram envoyé');
}

// ── SEND WHATSAPP ─────────────────────────────────
async function sendWhatsApp(imageBuffer, caption) {
  const base64 = 'data:image/png;base64,' + imageBuffer.toString('base64');

  for (const group of WA_GROUPS) {
    try {
      const res = await fetch(`https://api.ultramsg.com/${WA_INST}/messages/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: WA_TOKEN,
          to: group,
          image: base64,
          caption: caption.replace(/\*/g, ''),
        }),
      });
      const json = await res.json();
      console.log(`✅ WhatsApp envoyé → ${group}`, json.sent || '');
    } catch (e) {
      console.error(`❌ WhatsApp error (${group}):`, e.message);
    }
  }
}

// ── MAIN ──────────────────────────────────────────
async function main() {
  console.log('🚀 SUPRABOX Daily Reminder — Démarrage...');
  console.log('🕙 Heure UTC:', new Date().toISOString());

  try {
    const data = await getTomorrowMissions();
    if (!data) {
      console.log('⏭️ Pas d\'envoi aujourd\'hui.');
      return;
    }

    console.log(`📅 Demain: ${data.day} — ${data.rows.length} chauffeurs`);
    data.rows.forEach(r => console.log(`  • ${r.driver}: ${r.mission || '(vide)'}`));

    // Build image
    console.log('🎨 Construction de l\'image...');
    const imageBuffer = await buildImage(data);
    console.log(`✅ Image: ${Math.round(imageBuffer.length/1024)}KB`);

    // Caption
    const caption = `📋 *PLANNING ${data.day}* — ${data.dateFormatted}\n\n` +
      data.rows.map(r => `• *${r.driver}*: ${r.mission || 'Non défini'}`).join('\n') +
      `\n\n_SUPRABOX · Tassila Messageries · Agadir_`;

    // Send
    await sendTelegram(imageBuffer, caption);
    await sendWhatsApp(imageBuffer, caption);

    console.log('✅ Rappel quotidien envoyé avec succès !');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

main();
