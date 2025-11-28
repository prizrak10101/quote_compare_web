# Comparateur de Devis

Application web locale pour comparer les versions de devis (PDF), inspirée de la comparaison de documents Adobe Acrobat.

## Prérequis

- Node.js (v18+)
- Python (v3.8+)

## Installation et Lancement

### 1. Backend (Python)

Le backend gère l'extraction de texte des PDF et la comparaison.

```bash
cd backend
# Créer un environnement virtuel (si pas déjà fait)
python -m venv venv

# Activer l'environnement
# Windows (PowerShell) :
.\venv\Scripts\Activate
# Mac/Linux :
# source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python main.py
```
Le serveur backend tourne sur `http://localhost:8000`.

### 2. Frontend (React)

L'interface utilisateur.

```bash
cd frontend
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer le serveur de développement
npm run dev
```
Ouvrez votre navigateur sur le lien indiqué (généralement `http://localhost:5173`).

## Fonctionnalités

- Upload de deux fichiers PDF (Version Originale et Version Modifiée).
- Visualisation des différences :
  - Vert / Souligné : Ajouts
  - Rouge / Barré : Suppressions
- Résumé statistique des changements sur le côté.

