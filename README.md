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

## Utilisation locale

```bash
python3 -m http.server 4173
```

Ouvrir ensuite `http://localhost:4173` sur smartphone ou navigateur desktop (mode responsive).
