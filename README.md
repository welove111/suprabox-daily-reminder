# SUPRABOX Daily Reminder Bot

Envoie automatiquement chaque soir à **22h00 (Maroc)** les missions du lendemain.

---

## 📸 Ce qui est envoyé

Une image premium avec:
- Header SUPRABOX avec date du lendemain
- Tableau: Chauffeur → Mission (avec couleur par mission)
- Footer automatique
- Envoi: **Telegram** + **WhatsApp** (2 groupes)

---

## ⚙️ Variables d'environnement Railway

| Variable | Valeur |
|----------|--------|
| `SB_URL` | `https://yjtkahuihipiodcrodwx.supabase.co` |
| `SB_KEY` | `eyJhbGci...` (anon key) |
| `TG_TOKEN` | `8805635363:AAEkRtKA...` |
| `TG_CHAT` | `-1004296812387` |
| `WA_TOKEN` | `dpcfs8tuddj237mr` |
| `WA_INST` | `instance179631` |
| `WA_GROUPS` | `120363408144572779@g.us,120363421814781385@g.us` |

---

## 🚀 Deploy sur Railway

### Étape 1 — Créer le repo GitHub
```bash
# Dans Termux
mkdir daily-reminder && cd daily-reminder
cp daily-reminder.js package.json .
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/welove111/suprabox-daily-reminder.git
git push -u origin main
```

### Étape 2 — Créer le projet Railway
1. Aller sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionner `welove111/suprabox-daily-reminder`
4. Railway détecte automatiquement Node.js

### Étape 3 — Ajouter les variables
Dans Railway → **Variables** → ajouter les variables du tableau ci-dessus

### Étape 4 — Configurer le Cron
Dans Railway → **Settings** → **Cron Schedule**:
```
0 21 * * 0-5
```
- `21` UTC = `22h00` Maroc (UTC+1)
- `0-5` = Lundi à Samedi (pas Dimanche)

---

## 📅 Planning des envois

| Jour d'envoi | Heure | Contenu |
|-------------|-------|---------|
| Lundi | 22h00 | Missions Mardi |
| Mardi | 22h00 | Missions Mercredi |
| Mercredi | 22h00 | Missions Jeudi |
| Jeudi | 22h00 | Missions Vendredi |
| Vendredi | 22h00 | Missions Samedi |
| Samedi | 22h00 | *(pas d'envoi — Dimanche = repos)* |
| Dimanche | — | Pas d'envoi |

---

## 🧪 Tester manuellement

```bash
node daily-reminder.js
```

---

*SUPRABOX · Tassila Messageries · Houssam Zina*
