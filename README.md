# Media School Compassion

Plateforme de formation en ligne pour **Media School Compassion** — un espace d'apprentissage moderne où les apprenants peuvent suivre des formations vidéo, tracker leur progression et reprendre là où ils se sont arrêtés.

---

## Apercu

- Authentification double : **Google OAuth** pour les apprenants, **email/mot de passe** pour l'admin
- Interface admin complète pour gérer les formations, modules et vidéos
- Lecteur vidéo YouTube intégré avec miniature personnalisée
- Suivi de progression par vidéo, module et formation
- Design responsive, moderne et fluide

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Firebase Authentication |
| Base de données | Cloud Firestore |
| Images | Cloudinary (upload sans serveur) |
| Routing | React Router v6 |

---

## Structure de l'app

```
/login               → Connexion apprenant (Google)
/admin/login         → Connexion admin (email + mot de passe)
/dashboard           → Tableau de bord apprenant
/formation/:id       → Page formation avec modules en accordéon
/formation/:id/...   → Lecteur vidéo

/admin               → Panneau admin
/admin/courses/:id   → Gestion des modules d'une formation
/admin/courses/:id/modules/:id → Gestion des vidéos d'un module
```

---

## Lancer le projet en local

### 1. Cloner le repo

```bash
git clone git@github.com:Itachi243-uchiwa/mediaschoolcompassion.git
cd mediaschoolcompassion
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copie le fichier d'exemple et remplis les valeurs :

```bash
cp .env.example .env
```

```env
# Firebase — https://console.firebase.google.com
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""

# Email de l'administrateur
VITE_ADMIN_EMAIL=""

# Cloudinary — https://cloudinary.com → Dashboard → Upload Presets
VITE_CLOUDINARY_CLOUD_NAME=""
VITE_CLOUDINARY_UPLOAD_PRESET=""
```

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000)

---

## Configuration Firebase

Dans la console Firebase, active :

- **Authentication** → Sign-in methods → Google + Email/Password
- **Firestore Database** → Créer en mode production

Règles Firestore recommandées :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Formations, modules, vidéos — lecture publique (connectés), écriture admin uniquement
    match /courses/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == "VOTRE_EMAIL_ADMIN";
    }

    // Progression — chaque utilisateur gère uniquement la sienne
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Configuration Cloudinary

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Aller dans **Settings → Upload → Upload presets**
3. Créer un preset **Unsigned**
4. Copier le nom du preset dans `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## Structure Firestore

```
courses/
  {courseId}/
    title, description, image_url, duration, order

    modules/
      {moduleId}/
        title, description, duration, order

        videos/
          {videoId}/
            title, description, youtube_url, thumbnail, duration, order

users/
  {userId}/
    progress/
      {videoId}: true | false
```

---

## Build de production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`. Le projet peut être déployé sur **Vercel**, **Netlify** ou tout hébergeur statique.

---

## Auteur

Projet développé pour **Media School Compassion** — Bruxelles.
