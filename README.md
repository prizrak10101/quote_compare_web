# Comparateur de Devis

Application locale permettant de télécharger différentes versions de devis PDF, d'en comparer le contenu (texte) et d'obtenir un aperçu visuel des modifications directement dans le navigateur. Le projet est découpé en deux parties : un backend FastAPI pour l'extraction/comparaison et un frontend React pour la visualisation.

## Architecture en un clin d'œil

- **Backend (`backend/`)**
  - FastAPI + pdfplumber + diff-match-patch + pypdfium2.
  - Endpoints pour lister, téléverser, réinitialiser et comparer des PDF stockés dans `backend/uploads`.
  - Génère à la fois une diff HTML, des statistiques brutes et des images annotées (ajouts en vert, suppressions en rouge) grâce à `generate_comparison_images`.
- **Frontend (`frontend/`)**
  - Vite + React + TypeScript + Tailwind.
  - `VersionManager` gère les uploads, la sélection des versions et le lancement des comparaisons.
  - `DiffViewer` affiche la diff textuelle enrichie ainsi que des métriques (ajouts/suppressions).
  - `VisualDiffViewer` affiche les captures d'écrans annotées page par page.

## Prérequis

- Python 3.8 ou plus récent (virtualenv recommandé).
- Node.js 18+ et npm.
- Poppler/PDFium ne sont pas nécessaires côté système : tout est embarqué dans les dépendances Python.

## Installation et lancement

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv            # création de l'environnement virtuel
# source venv/bin/activate     # macOS / Linux
# .\venv\Scripts\Activate      # Windows PowerShell
pip install -r requirements.txt
python main.py                 # lance uvicorn sur http://localhost:8000
```

Les PDF à comparer sont copiés côté serveur (dans `backend/uploads`). Vous pouvez y déposer manuellement des fichiers de test si besoin.

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev                    # serveur Vite, par défaut http://localhost:5173
```

Le frontend attend que l'API soit disponible sur `http://localhost:8001` (voir `frontend/src/App.tsx`, constante `API_URL`). Pour utiliser le port 8000 du backend par défaut, changez cette valeur ou créez une variable d'environnement Vite (`VITE_API_URL`) et remplacez la constante par `import.meta.env.VITE_API_URL`.

## Flux d'utilisation

1. Lancer backend puis frontend.
2. Dans l'UI, téléverser autant de PDF que souhaité (ils sont conservés dans `backend/uploads`).
3. Sélectionner deux versions dans la barre latérale (V1 = référence, V2 = version cible) et cliquer sur **Comparer**.
4. Alterner entre la vue **Visuelle** (images annotées) et la vue **Texte** (diff HTML + statistiques).
5. Utiliser le bouton **Vider** pour supprimer toutes les versions présentes côté serveur.

## API disponible

| Méthode | Route                | Description                                                                 |
|---------|---------------------|-----------------------------------------------------------------------------|
| GET     | `/`                 | Ping simple pour vérifier que l'API est en ligne.                           |
| GET     | `/versions`         | Liste les PDF disponibles dans `uploads` (nom, taille, dates).              |
| POST    | `/upload`           | Upload d'un unique fichier PDF (form-data `file`).                          |
| POST    | `/reset`            | Supprime tous les PDF précédemment téléversés.                              |
| POST    | `/compare-versions` | Compare deux fichiers déjà présents (`{"file1": "...", "file2": "..."}`).   |
| POST    | `/compare`          | (héritage) Upload direct de deux fichiers + comparaison immédiate.         |

La réponse de `/compare-versions` contient :

- `html_diff` : diff formatée (balises `ins`/`del`).
- `raw_diff` : tableau brut `[op, texte]` permettant de recalculer des métriques côté client.
- `visual_diff` : images encodées en base64 par page (ajouts/suppressions surlignés).
- `filename1` / `filename2` : rappel des fichiers comparés.

## Contenu du dépôt

- `backend/main.py` : définition des routes FastAPI et orchestration de la comparaison.
- `backend/services.py` : extraction du texte, calcul des diffs et génération des images annotées.
- `frontend/src/App.tsx` : état global, appels réseau et bascule entre les vues Text/Visuel.
- `frontend/src/components/` : composants UI (gestion des versions, diff textuelle, diff visuelle).
- `devis_*.pdf` : exemples de devis pour tester rapidement l'application.

## Dépannage & Conseils

- **Ports différents** : adaptez `API_URL` ou lancez le backend sur le port attendu (`uvicorn main:app --port 8001`).
- **Polices illisibles** : pdfplumber dépend du texte sélectionnable dans le PDF. Pour des scans, prévoir un OCR en amont.
- **Images lourdes** : les images annotées peuvent être volumineuses. Réduisez `scale` dans `generate_comparison_images` si nécessaire.
- **Nettoyage** : le dossier `backend/uploads` peut grossir rapidement. Utilisez `/reset` ou supprimez les fichiers manuellement.

## Fonctionnalités clés

- Upload illimité de versions PDF.
- Diff textuelle avec code couleur (ajouts en vert, suppressions en rouge).
- Résumé chiffré des changements.
- Vue visuelle page par page avec surlignage des modifications.

