# TerraCollect — Plateforme de collecte de données nouvelle génération

> **TerraCollect** (nom de travail) est une plateforme de collecte de données terrain **offline-first**, pensée dès sa conception pour l'**IA**, les **SIG** (systèmes d'information géographique) et une **expérience utilisateur moderne**. Elle vise à dépasser KoboToolbox, ODK Collect, Survey123 et CommCare pour les ONG, chercheurs, entreprises et administrations.

---

## 🎯 Le produit en une minute (pour les clients)

Vos équipes terrain collectent des données (enquêtes, inventaires forestiers, suivis agricoles, recensements…) même **sans connexion internet**, avec photos, GPS, audio, signatures et cartes satellite. Les données se synchronisent automatiquement dès que le réseau revient. Sur le web, vous créez vos formulaires **en décrivant simplement votre besoin à l'IA**, vous suivez la collecte en temps réel sur des cartes et tableaux de bord, et l'IA détecte les erreurs, résume les données et génère vos rapports.

**Ce qui nous différencie :**

| Problème avec les outils actuels | Notre réponse |
|---|---|
| Création de formulaires lente et technique (XLSForm) | Génération de formulaires par IA en langage naturel |
| Interfaces datées, courbe d'apprentissage élevée | UX moderne, prise en main en moins de 15 minutes |
| SIG limité ou payant (licences Esri) | SIG avancé natif : placettes, transects, buffers, offline |
| Contrôle qualité manuel, a posteriori | Détection d'erreurs et de doublons par IA, en temps réel |
| Analyse = export CSV puis Excel | Dashboards automatiques, chat avec les données, rapports IA |

📄 Pour comprendre le produit : [Vision](docs/01_VISION.md) · [Fonctionnalités](docs/03_FEATURES.md) · [Analyse concurrentielle](docs/14_COMPETITIVE_ANALYSIS.md) · [Roadmap](docs/12_ROADMAP.md) · [Glossaire](docs/16_GLOSSAIRE.md)

---

## 🧭 État du projet

**Phase actuelle : conception / documentation.** Aucun code n'a encore été écrit. Ce dépôt contient la documentation complète qui sert de source de vérité pour le développement (par des développeurs humains ou des agents IA autonomes).

> ⚠️ **Avant de coder, lire [24_RISQUES_ET_LACUNES](docs/24_RISQUES_ET_LACUNES.md).** Contexte réel : **build solo, vibecode assisté par IA**. Deux règles cardinales : livrer d'abord le **V0 « Socle fiable »** (collecte offline sans perte) avant tout différenciateur, et **ne pas vibecoder à l'aveugle le cœur sensible** (sync, auth, crypto) — le spécifier et le tester. Et **valider le terrain** (10–15 entretiens) avant de coder.

---

## 📚 Documentation

La documentation est organisée pour trois publics : **clients/parties prenantes** (comprendre le produit), **développeurs** (comprendre et contribuer), **agents de développement autonomes** (construire la solution de bout en bout).

👉 **Commencez par le [Guide de lecture](docs/GUIDE_LECTURE.md)** : il indique quoi lire, dans quel ordre, selon votre profil.

| # | Document | Contenu | Public |
|---|---|---|---|
| — | [Guide de lecture](docs/GUIDE_LECTURE.md) | Par où commencer selon votre profil | Tous |
| 00 | [Guide de l'agent développeur](docs/00_GUIDE_AGENT.md) | Ordre de construction, conventions, definition of done | Agents / Devs |
| 01 | [Vision](docs/01_VISION.md) | Vision, mission, personas, cas d'usage, vision à 5 ans | Tous |
| 02 | [PRD](docs/02_PRD.md) | Exigences produit, MVP, user stories, critères d'acceptation | Tous |
| 03 | [Fonctionnalités](docs/03_FEATURES.md) | Catalogue complet des fonctionnalités, priorisées par version | Tous |
| 04 | [UX](docs/04_UX.md) | Principes UX, offline-first, parcours, accessibilité, métriques | Devs / Design |
| 05 | [Application mobile](docs/05_MOBILE.md) | Spécification écran par écran, stockage local, synchronisation | Devs / Agents |
| 06 | [Plateforme web](docs/06_WEB.md) | Spécification des pages web, form builder, dashboards | Devs / Agents |
| 07 | [Intelligence artificielle](docs/07_AI.md) | Cas d'usage IA, architecture, prompts, garde-fous, coûts | Devs / Agents |
| 08 | [SIG](docs/08_GIS.md) | Cartographie, placettes, transects, formats, calculs spatiaux | Devs / Agents |
| 09 | [Architecture](docs/09_ARCHITECTURE.md) | Stack technique, monorepo, protocole de sync, sécurité, ADR | Devs / Agents |
| 10 | [Base de données](docs/10_DATABASE.md) | Schéma complet, relations, index, permissions, audit | Devs / Agents |
| 11 | [API](docs/11_API.md) | Contrat REST complet : auth, ressources, sync, erreurs | Devs / Agents |
| 12 | [Roadmap](docs/12_ROADMAP.md) | Versions 1 à 3, Enterprise, IA — jalons et périmètres | Tous |
| 13 | [Design system](docs/13_DESIGN_SYSTEM.md) | Couleurs, typographie, composants, tokens, dark mode | Devs / Design |
| 14 | [Analyse concurrentielle](docs/14_COMPETITIVE_ANALYSIS.md) | KoboToolbox, ODK, Survey123, CommCare… et notre différenciation | Tous |
| 15 | [Innovations](docs/15_INNOVATIONS.md) | Innovations différenciantes et leur faisabilité | Tous |
| 16 | [Glossaire](docs/16_GLOSSAIRE.md) | Termes métier, SIG et techniques expliqués simplement | Clients |
| 17 | [Principes de conception](docs/17_PRINCIPES_CONCEPTION.md) | Les 10 principes non négociables et règles d'arbitrage | Tous |
| 18 | [Compatibilité XLSForm](docs/18_XLSFORM.md) | Import/export XLSForm 100 %, moteur d'expressions et de calculs | Devs / Agents |
| 19 | [Analyse & rapports](docs/19_ANALYSE.md) | Statistiques (dont ANOVA/régression), rapports IA, intégrations | Devs / Clients |
| 20 | [Déploiement & confidentialité](docs/20_DEPLOIEMENT.md) | SaaS / auto-hébergé / PWA / bureau, hébergement de base modulaire (Supabase / Postgres), souveraineté | Devs / Clients |
| 21 | [Monétisation](docs/21_MONETISATION.md) | Modèles concurrents, plans, sources de revenus | Investisseurs / Direction |
| 22 | [Présentation](docs/22_PRESENTATION.md) | Pitch investisseurs, collaborateurs et clients | Investisseurs / Clients |
| 23 | [Coûts](docs/23_COUTS.md) | Infrastructure, IA à l'usage, auto-hébergement, TCO client | Direction / Enterprise |
| 24 | [Risques & lacunes](docs/24_RISQUES_ET_LACUNES.md) | Réalisme d'exécution (solo/vibecode), MVP V0, registre priorisé | **À lire d'abord** |
| 25 | [Éthique & consentement](docs/25_ETHIQUE_CONSENTEMENT.md) | Do-no-harm, consentement des enquêtés, minimisation, conformité | Tous |
| 26 | [Sécurité & modèle de menace](docs/26_SECURITE_MODELE_MENACE.md) | Menaces, contrôles par couche, plan solo, pentest | Devs / Enterprise |
| 27 | [Modules futurs & extensibilité](docs/27_FUTURE_MODULES.md) | Catalogue d'extensibilité (IoT, drone, télédétection, plugins) — **pas un engagement de roadmap** | Devs / Tous |

**Parcours de lecture conseillés** (détaillés dans le [Guide de lecture](docs/GUIDE_LECTURE.md)) :

- **Client / décideur** : 22(C) → 01 → 17 → 03 → 20 → 14 → 12 → 16
- **Investisseur** : 22(A) → 01 → 14 → 21 → 12 → 09
- **Nouveau développeur** : 00 → 17 → 09 → 20 → 10 → 11 → 05/06 → 02
- **Agent de développement autonome** : 00 (obligatoire) → 17 → 09 → 20 → 10 → 11 → 02 → 05/06/07/08/18/19

---

## 🛠 Stack technique (résumé)

Décisions détaillées et justifiées dans [09_ARCHITECTURE.md](docs/09_ARCHITECTURE.md).

| Couche | Choix | Rôle |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo, 100 % TypeScript | Partage de types et de logique entre apps |
| Mobile | React Native (Expo), SQLite local, MapLibre Native | Collecte terrain offline-first |
| Web | Next.js (React), Tailwind CSS + shadcn/ui, MapLibre GL JS | Form builder, dashboards, cartes, administration |
| Backend | NestJS (Node.js), Prisma | API REST, logique métier, moteur de synchronisation |
| Base de données | **Supabase par défaut** (PostgreSQL 16 + PostGIS), **hébergement modulaire** (couche repository → Postgres self-hosted / Neon / RDS) | Données relationnelles + géospatiales, portable SaaS ↔ souverain |
| Stockage fichiers | S3-compatible (MinIO en dev, S3/R2/Supabase Storage en prod) | Photos, audio, vidéo, pièces jointes |
| IA | API Claude (Anthropic) | Génération de formulaires, contrôle qualité, analyse, chat |
| Auth | JWT (access + refresh), RBAC configurable par organisation | Sécurité multi-tenant |
| Déploiement | SaaS cloud · **auto-hébergé (souveraineté)** · PWA · app bureau ; mobile agnostique du backend | Voir [20_DEPLOIEMENT](docs/20_DEPLOIEMENT.md) |

## 📁 Structure cible du dépôt

```
datacollecting-app/
├── README.md              ← vous êtes ici
├── docs/                  ← documentation (source de vérité)
├── apps/
│   ├── api/               ← backend NestJS
│   ├── web/               ← plateforme web Next.js
│   └── mobile/            ← application mobile Expo
├── packages/
│   ├── shared/            ← types, schémas zod, validation, i18n
│   └── form-engine/       ← moteur de formulaires (rendu + logique + validation)
└── infra/                 ← docker-compose, migrations, CI/CD
```

## 🤝 Contribuer

1. Lire [00_GUIDE_AGENT.md](docs/00_GUIDE_AGENT.md) — les conventions s'appliquent aux humains comme aux agents.
2. Toute fonctionnalité doit être tracée vers une user story du [PRD](docs/02_PRD.md) ou une entrée du [catalogue de fonctionnalités](docs/03_FEATURES.md).
3. Toute décision d'architecture nouvelle ou modifiée doit être ajoutée comme ADR dans [09_ARCHITECTURE.md](docs/09_ARCHITECTURE.md).
4. La documentation est contractuelle : si le code s'écarte de la doc, mettre à jour la doc dans la même PR.
