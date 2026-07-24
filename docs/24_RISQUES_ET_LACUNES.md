# 24 — Registre des risques & lacunes (et réalisme d'exécution)

Ce document est le **garde-fou stratégique**. Il consolide les angles morts identifiés, adaptés au contexte réel du projet : **développement solo, en vibecode assisté par IA, par une personne ayant une vraie expérience du code**. Il prime sur l'enthousiasme : à relire avant d'ajouter la moindre fonctionnalité.

## 1. Contexte d'exécution (le facteur décisif)

Le projet est construit **par une seule personne**, avec l'IA comme accélérateur, et une expérience réelle du développement. Conséquences directes :

- **La contrainte n°1 n'est pas la technique, c'est le temps.** Une seule paire de mains. Chaque fonctionnalité ajoutée à la V1 recule la mise en production du cœur.
- **Le vibecode est asymétrique.** Il excelle sur l'UI, le CRUD, les écrans, le glue code — et il est **risqué là où la correction est critique** : moteur de synchronisation, idempotence, résolution de conflits, chiffrement, authentification. C'est précisément là que se joue le principe [P9 « aucune perte de données »](17_PRINCIPES_CONCEPTION.md). Ces modules se **spécifient et se testent d'abord**, ils ne se génèrent pas à l'aveugle.
- **L'expérience dev est un atout** : elle permet de relire le code IA de façon critique, notamment sur le cœur sensible — à condition de ne pas court-circuiter cette relecture par pression de vitesse.

## 2. La règle d'or : couper le périmètre

La doc décrit **4 à 5 produits en un** (Kobo + QField + Survey123 + IA native + analyse statistique + XLSForm 100 % + auto-hébergement). Même la V1 « MVP » est trop grosse pour un solo. Risque classique : tout vouloir, ne rien livrer de solide.

**Décision : découper la V1 en V0 (socle) + V1 (différenciateurs).** Voir §3. La roadmap est mise à jour en ce sens ([12_ROADMAP](12_ROADMAP.md)).

## 3. V0 — « Socle fiable » (le vrai premier jalon)

Le MVP réellement défendable = **« zéro perte de données en collecte offline »**, rien de plus :

- Auth + organisations + projets (minimal).
- **Form builder manuel** (drag & drop, types de questions de base, logique conditionnelle simple) — **pas** de génération IA.
- **Collecte mobile offline** : rendu du formulaire, GPS, photo, brouillons résilients.
- **Moteur de synchronisation robuste** (idempotence, reprise, zéro doublon) — le cœur, à soigner.
- **Table + carte** des soumissions, **export CSV/GeoJSON**.

Tout le reste — génération IA, contrôle qualité IA, chat avec les données, stats avancées (ANOVA/régression), import XLSForm, SIG avancé (placettes/transects), auto-hébergement packagé — est **repoussé en V1/V2/V3**. Prouver le socle sur **un vrai projet terrain** avant d'ajouter quoi que ce soit.

## 4. Registre des lacunes (priorisé)

Gravité : 🔴 critique · 🟠 importante · 🟡 à traiter.

| # | Lacune | Grav. | Pourquoi ça compte | Action | Doc |
|---|---|:-:|---|---|---|
| R1 | Périmètre irréaliste pour un solo | 🔴 | Retard fatal, rien de fini | Adopter le découpage V0 (§3) ; « Won't now » ferme | [12_ROADMAP](12_ROADMAP.md) |
| R2 | Éthique « do no harm » & consentement des **enquêtés** | 🔴 | Fuite = danger physique pour des personnes vulnérables ; **différenciateur** si bien traité | Module de consentement + minimisation ; spécifié | [25_ETHIQUE_CONSENTEMENT](25_ETHIQUE_CONSENTEMENT.md) |
| R3 | Pas de modèle de menace / sécurité dédié | 🔴 | Données = localisation de personnes vulnérables ; existentiel | Threat model + checklist + plan pentest/divulgation | [26_SECURITE_MODELE_MENACE](26_SECURITE_MODELE_MENACE.md) |
| R4 | Cœur sensible vibecodé à l'aveugle | 🔴 | Sync/crypto/auth = là où P9 se joue | Spécifier + tester **avant** de générer ; relire ligne à ligne | §1, [09 §6](09_ARCHITECTURE.md) |
| R5 | Open-source vs propriétaire non tranché | 🟠 | Conditionne adoption, confiance, GTM (Kobo/ODK sont open) | Décision **open-core** actée | [21_MONETISATION §7](21_MONETISATION.md) |
| R6 | Aucune validation terrain | 🟠 | Risque de construire le mauvais produit | 10–15 entretiens de découverte **avant** de coder | §5 |
| R7 | Migration Kobo/ODK sous-développée | 🟠 | C'est le meilleur levier d'adoption | Importer **formulaires ET données**, pas juste XLSForm. Enrichir avec **interop OpenRosa** (INTEROP-01) : exposer les endpoints OpenRosa pour que les apps ODK/Kobo puissent envoyer leurs soumissions directement — adoption sans migration forcée | [18_XLSFORM](18_XLSFORM.md) (§7b, §8) |
| R8 | Juridique concret absent (CGU, confidentialité, DPA) | 🟠 | Indispensable dès le 1er client Enterprise | Modèles à rédiger avant vente | [25 §6](25_ETHIQUE_CONSENTEMENT.md) |
| R9 | i18n réelle : RTL + langues du Sud | 🟡 | Cible mondiale (arabe RTL, swahili, PT, ES) | Prévoir RTL et pluralisation dès l'archi UI | [04_UX](04_UX.md) |
| R10 | Doc utilisateur & communauté | 🟡 | Adoption Kobo/ODK doit beaucoup à leur communauté | Centre d'aide minimal + stratégie communauté (post-V0) | [12_ROADMAP](12_ROADMAP.md) |
| R11 | **Notifications non spécifiées** | 🟠 | Listées comme module cœur ([27 §2](27_FUTURE_MODULES.md)) mais absentes de l'API et du schéma BDD ; conditionnent le workflow d'approbation (D4) et les alertes terrain | Spécifier le modèle (push/email/SMS) dans [11_API](11_API.md) + [10_DATABASE](10_DATABASE.md) avant la V1 | [11_API](11_API.md) |
| R12 | Catalogue de modules futurs = risque de dérive de périmètre | 🟠 | 10 modules × ~100 fonctions peuvent réactiver le « tout vouloir » que R1 combat | [27](27_FUTURE_MODULES.md) recadré : catalogue d'extensibilité, **pas** un engagement ; horizons explicites par module | [27_FUTURE_MODULES](27_FUTURE_MODULES.md) |

## 5. Validation terrain (à faire avant/pendant V0)

Ne pas coder 6 mois sur des hypothèses. **10–15 entretiens** de découverte (coordinatrices M&E, enquêteurs, chercheurs) pour valider : la douleur réelle, le parcours actuel, ce qui les ferait basculer, les non-négociables (offline, prix, souveraineté). Coût : quelques semaines ; économise potentiellement des mois de mauvais code. Trame d'entretien à préparer ; consigner les enseignements ici et dans le [PRD](02_PRD.md).

## 6. Ce qui se vibecode bien / ce qui ne se vibecode pas

| ✅ Vibecode volontiers (UI, CRUD, glue) | ⚠️ À concevoir + tester d'abord (relecture humaine stricte) |
|---|---|
| Écrans web/mobile, form builder, tables, dashboards | **Moteur de synchronisation** (idempotence, reprise, conflits) — [09 §6](09_ARCHITECTURE.md) |
| Composants UI, design system, i18n de surface | **Auth & sessions** (JWT, refresh, RBAC) |
| Endpoints CRUD simples, validations zod | **Chiffrement** (secrets, stockage local, presigned URLs) |
| Exports CSV/GeoJSON, mise en forme | **Évaluateur d'expressions / calculs** du form-engine (parité mobile/serveur) |
| Scripts, seed, fixtures | **Uploads par chunks & reprise média** |

Règle : pour la colonne de droite, **écrire les tests d'abord** (idempotence, injection de pannes), puis générer, puis relire. L'IA est la plus faible exactement là où l'enjeu est le plus fort.

## 7. Décisions stratégiques (tranchées)

| Décision | Statut | Détail |
|---|---|---|
| Périmètre V0 (§3) | ✅ **Acté** | Socle fiable avant tout différenciateur |
| Modèle open-core | ✅ **AGPL cœur + MIT shared + premium propriétaire** | Licence cœur AGPL-3.0, packages/shared en MIT, fonctions premium propriétaires. Frontière détaillée dans [21_MONETISATION §7](21_MONETISATION.md) |
| Fournisseur satellite premium | ✅ **Planet** (add-on) + **Sentinel Hub** (socle gratuit radar) | Planet comme add-on premium (avec NICFI gratuit pour ONG forêts), Sentinel Hub pour le radar Sentinel-1 gratuit en socle. Voir [08_GIS §2b](08_GIS.md) |
| Nom & domaine | ⏳ **À faire** | Voir [NOMS_MARQUE](NOMS_MARQUE.md) |
| Licence auto-hébergée | ⏳ **À définir** | Structure dans [21_MONETISATION §4](21_MONETISATION.md), montants à caler sur coûts réels V1

## 8. En une phrase

Le *quoi* et le *comment* sont excellents ; ce qui manquait, c'est le **réalisme d'exécution** (solo, périmètre), la **couche éthique-sécurité-juridique** qu'exige la sensibilité des données, et la **validation** qu'on construit la bonne chose. Rien d'irréparable — mais **couper le périmètre et valider le terrain passent avant toute nouvelle fonctionnalité**.
