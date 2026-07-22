# 06 — Plateforme web

Spécification de `apps/web`. Stack : **Next.js (App Router)**, TypeScript strict, Tailwind CSS + shadcn/ui (voir [13_DESIGN_SYSTEM.md](13_DESIGN_SYSTEM.md)), TanStack Query + Table, MapLibre GL JS, Recharts. L'app web consomme exclusivement l'API de `apps/api` ([11_API.md](11_API.md)) ; la validation des formulaires construits passe par `packages/form-engine`.

## 1. Structure et navigation

```
/login, /register, /invite/[token], /forgot-password
/org/[orgSlug]/
├── projects                    # liste des projets
└── projects/[projectId]/
    ├── overview                # dashboard
    ├── forms                   # liste + builder
    │   └── [formId]/edit       # form builder
    ├── submissions             # table + détail
    ├── map                     # carte interactive
    ├── team                    # membres & assignations
    └── settings                # paramètres projet
/org/[orgSlug]/settings         # organisation, membres, facturation (V2)
/account                        # profil, sécurité, langue
```

Barre latérale par projet ; sélecteurs organisation/projet en en-tête ; breadcrumb ; recherche globale (V2). Toutes les pages sont responsives (usage tablette réel, mobile en lecture).

## 2. Pages

### 2.1 Authentification
Register (crée l'organisation, user = owner, vérification email), Login (+ « se souvenir de moi »), acceptation d'invitation via token (fixe le rôle), réinitialisation de mot de passe. Erreurs inline, jamais de détail exploitable (« identifiants invalides »).

### 2.2 Projets
Liste avec statut (draft/active/archived), compteurs (formulaires, soumissions, membres), création (nom, description, langues, fuseau), archivage (owner/admin). Carte projet → overview.

### 2.3 Dashboard (overview)
- Compteurs : soumissions totales / 7 derniers jours, collecteurs actifs, formulaires publiés, taux d'approbation.
- Courbe des soumissions par jour (filtre 7/30/90 j), répartition par formulaire, mini-carte des derniers points, activité récente (dernières soumissions, rejets).
- Pour chaque question à choix d'un formulaire sélectionné : répartition (barres/camembert). Widgets configurables : V3 (WEB-07).
- Données à jour < 1 min après sync (invalidation TanStack Query + polling léger ; websockets en V2).

### 2.4 Formulaires (liste)
Tableau : nom, version publiée, statut (brouillon/publié/archivé), soumissions, dernière modification. Actions : créer (vierge, depuis modèle V2, **par IA**), dupliquer, archiver, exporter la définition (JSON), historique des versions avec diff (WEB-02).

### 2.5 Form builder (`/forms/[formId]/edit`)
Écran central du produit. Trois panneaux :

1. **Palette** (gauche) : types de questions V1 (texte, nombre, décimal, date, heure, choix unique, choix multiple, GPS, photo, audio, signature, note, calcul, groupe, groupe répétable) — glisser vers le canevas.
2. **Canevas** (centre) : arbre du formulaire, drag & drop de réordonnancement (dnd-kit), sélection → panneau propriétés, duplication/suppression, indicateurs (logique ⚡, contrainte 🔒, obligatoire *).
3. **Propriétés** (droite) : selon le type — libellés multilingues (onglets par langue), nom de variable (slug auto, unique), obligatoire, indice/placeholder, options de choix (édition en liste + import collé), contraintes (min/max/regex + message), **éditeur de logique** (constructeur de conditions : question / opérateur / valeur, combinables ET/OU), formule de calcul, paramètres spécifiques (précision GPS, compression photo…).

Barre supérieure : titre, statut, **Aperçu** (rendu fidèle mobile dans un cadre téléphone, interactif, propulsé par `form-engine` — le même code que l'app), **Enregistrer** (brouillon, auto-save), **Publier** (validation complète → version immuable n+1, confirmation avec résumé des changements).

**Assistant IA (AI-01/AI-02)** : panneau latéral « Générer avec l'IA » — zone de description libre + options (langue, secteur) → brouillon inséré dans le canevas, chaque question marquée « générée » jusqu'à édition ; bouton « Suggérer des améliorations » (V2). L'IA ne publie jamais ([07_AI.md](07_AI.md)).

Validation à la publication (form-engine) : noms de variables uniques, logique sans référence avant/circulaire, options non vides, au moins une question, langues complètes (avertissement si traductions manquantes).

### 2.6 Soumissions
- **Table** (TanStack Table, pagination serveur) : colonnes = métadonnées (date, auteur, statut, version) + questions (choix des colonnes visibles, persisté par utilisateur). Tri, filtres composables (date, auteur, statut, formulaire, valeur de question), recherche plein texte.
- **Détail** (panneau latéral ou page) : toutes les réponses groupées par section, médias (visionneuse photo, lecteur audio, signature), carte du point GPS, métadonnées complètes (appareil, durée de saisie, version). Actions : **Approuver / Rejeter** (motif obligatoire, notifié au mobile à la sync — D4), historique des révisions de la soumission.
- **Exports** (WEB-08) : CSV, XLSX, GeoJSON ; sélection = filtres courants ; repeats en feuilles/fichiers liés par `submission_uuid` ; option zip des médias. Génération asynchrone (job) avec notification de téléchargement.

### 2.7 Carte interactive
Plein écran : fonds OSM/satellite/terrain, points des soumissions (clustering au-delà de 200 points, couleur par statut ou par formulaire), filtres (formulaire, période, auteur, statut), popup → détail. V2 : couches projet importées (GeoJSON/Shapefile/KML), éditeur de géométries (GIS-12), placettes/transects/buffers, export de la vue.

### 2.8 Équipe
Membres de l'organisation ayant accès au projet : rôle, dernière activité, soumissions. Invitations par email (rôle choisi), révocation, changement de rôle (admin+). Assignations par formulaire (B6) : « tous les collecteurs » ou liste nominative.

### 2.9 Paramètres projet
Général (nom, description, langues, fuseau), collecte (précision GPS requise, compression photo, taille max des pièces jointes, autorisation galerie), workflow (approbation obligatoire on/off), données (rétention, export complet du projet), zone dangereuse (archiver ; supprimer = owner + confirmation nominative, soft delete).

## 3. Exigences non fonctionnelles web

- Accessibilité WCAG 2.1 AA (navigation clavier complète, y compris le builder : réordonnancement au clavier).
- Performance : LCP < 2,5 s ; table fluide à 100 000 soumissions (pagination serveur) ; carte fluide à 50 000 points (clustering + tuiles vectorielles côté API en V2).
- i18n FR/EN (next-intl), dark mode (voir design system).
- Sécurité : cookies httpOnly + CSRF pour la session web, CSP stricte, aucune donnée sensible dans le localStorage.

## 4. Tests

- Composants critiques (Testing Library) : éditeur de logique, panneau propriétés, table des soumissions.
- E2E (Playwright) : register → projet → builder (formulaire 10 questions avec logique) → publication → simulation de soumissions (API) → table/filtres → export CSV → approbation/rejet.
- Contrats : les appels API sont typés depuis `packages/shared` ; tout écart de schéma casse le build.
