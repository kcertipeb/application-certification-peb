# PEB Terrain Mobile (Bruxelles)

Application web **mobile-first** pour aider le certificateur PEB résidentiel à relever les données sur site.

> Ce projet n'est **pas** un logiciel PEB :
> - pas de calcul énergétique,
> - pas de composantes PEB officielles,
> - pas d'export officiel.
>
> Il sert de **checklist terrain structurée** avec preuves (photos), mesures et notes exploitables au bureau.

## Ce que fait l'application

- Gestion d'un **dossier logement** (référence, adresse, date).
- Ajout progressif d'**étages**.
- Plan 2D simple par étage (pièces rectangulaires tapables).
- Édition pièce par pièce :
  - nom/type,
  - surface,
  - hauteur,
  - notes,
  - photos générales.
- Objets terrain dans chaque pièce :
  - **châssis** (type, dimensions, vitrage observé, photo),
  - **émetteurs** (type, vanne thermostatique, photo),
  - **observations de parois** (type, épaisseur, isolation visible, justification/photo).
- **Rappels non bloquants** (mesure/preuve manquante).
- Offline-first via `localStorage` + import/export JSON.

## Lancer l'application

### Option A (recommandée)

```bash
./run-local.sh
```

Puis ouvrir `http://localhost:4173`.

### Option B

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Puis ouvrir `http://localhost:4173`.

### Option C (sans serveur)

Ouvrir directement `index.html` dans le navigateur.

## Dépannage : "localhost n'autorise pas la connexion"

L'erreur `ERR_CONNECTION_REFUSED` signifie généralement que le serveur local n'est pas démarré.

1. Démarrer le serveur avec `./run-local.sh`.
2. Vérifier qu'il écoute :
   ```bash
   curl -I http://127.0.0.1:4173
   ```
3. Si le port 4173 est occupé, utiliser un autre port :
   ```bash
   ./run-local.sh 8080
   ```
   et ouvrir `http://localhost:8080`.
## Utilisation locale

```bash
python3 -m http.server 4173
```

Ouvrir ensuite `http://localhost:4173` sur smartphone ou navigateur desktop (mode responsive).
