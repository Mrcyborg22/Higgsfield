# 🎬 Seedance Studio — Clone Higgsfield AI

Interface complète de génération vidéo IA avec Seedance 2.0, sans connexion, sans abonnement, sans crédits.

## ✨ Fonctionnalités
- Texte → Vidéo (Text-to-Video)
- Image → Vidéo (Image-to-Video)
- Paramètres complets : durée, résolution, format, intensité de mouvement
- Galerie locale des générations
- Téléchargement MP4 direct
- Interface sombre cinématique inspirée de Higgsfield AI

---

## 🚀 Déploiement sur Vercel (5 minutes)

### 1. Prérequis — Clé API fal.ai (GRATUITE)

Seedance 2.0 utilise [fal.ai](https://fal.ai) comme backend de génération vidéo.

1. Créez un compte sur **https://fal.ai** (gratuit, pas de CB requise pour commencer)
2. Allez dans **Settings → API Keys**
3. Créez une nouvelle clé → copiez-la

> fal.ai offre des crédits gratuits au démarrage. Pour un accès vraiment illimité, vous pouvez aussi déployer avec votre propre clé et configurer la facturation à la demande.

### 2. Déployer sur Vercel

#### Option A — Via GitHub (recommandé)

1. Créez un repo GitHub et poussez ce projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VOTRE_USER/seedance-studio
   git push -u origin main
   ```

2. Allez sur **https://vercel.com/new**
3. Importez votre repo GitHub
4. Dans **Environment Variables**, ajoutez :
   - `FAL_KEY` = votre clé API fal.ai
5. Cliquez **Deploy** ✅

#### Option B — Via Vercel CLI

```bash
npm i -g vercel
cd seedance-studio
vercel

# Lors du setup, ajoutez la variable d'env :
vercel env add FAL_KEY
# Entrez votre clé fal.ai

vercel --prod
```

### 3. Variables d'environnement requises

| Variable | Description | Obtenir |
|----------|-------------|---------|
| `FAL_KEY` | Clé API fal.ai pour Seedance 2.0 | https://fal.ai/dashboard/keys |

---

## 🏗️ Architecture

```
seedance-studio/
├── index.html          # Frontend complet (HTML/CSS/JS vanilla)
├── api/
│   └── generate.js     # Vercel Edge Function → fal.ai Seedance 2.0
├── vercel.json         # Config routing Vercel
└── package.json
```

## 🔧 Modèles utilisés

| Mode | Endpoint fal.ai |
|------|----------------|
| Texte → Vidéo | `fal-ai/seedance-1-5/text-to-video` |
| Image → Vidéo | `fal-ai/seedance-1-5/image-to-video` |

## 💡 Personnalisation

Pour changer le modèle vidéo, éditez `api/generate.js` et modifiez la variable `endpoint`.

Autres modèles disponibles sur fal.ai :
- `fal-ai/kling-video/v1.6/standard/text-to-video`
- `fal-ai/wan-t2v`
- `fal-ai/minimax-video`
