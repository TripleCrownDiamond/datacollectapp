# Guide de lecture de la documentation

Ce guide explique **quoi lire, dans quel ordre, et pourquoi**, selon qui vous êtes. La documentation `docs/` est la source de vérité du produit : elle sert à la fois à comprendre la solution (clients, décideurs), à la construire (développeurs, agents autonomes) et à collaborer (nouveaux arrivants).

## 1. Les 4 grandes familles de documents

| Famille | Documents | Ce qu'ils répondent |
|---|---|---|
| **Cap produit** | [01_VISION](01_VISION.md), [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md), [12_ROADMAP](12_ROADMAP.md), [14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md), [15_INNOVATIONS](15_INNOVATIONS.md) | Pourquoi ce produit, ce qui le rend différent, où on va |
| **Exigences** | [02_PRD](02_PRD.md), [03_FEATURES](03_FEATURES.md), [16_GLOSSAIRE](16_GLOSSAIRE.md) | Ce que le produit doit faire, priorisé et traçable |
| **Expérience** | [04_UX](04_UX.md), [05_MOBILE](05_MOBILE.md), [06_WEB](06_WEB.md), [13_DESIGN_SYSTEM](13_DESIGN_SYSTEM.md) | À quoi ressemble et comment se comporte le produit |
| **Technique** | [00_GUIDE_AGENT](00_GUIDE_AGENT.md), [09_ARCHITECTURE](09_ARCHITECTURE.md), [10_DATABASE](10_DATABASE.md), [11_API](11_API.md), [07_AI](07_AI.md), [08_GIS](08_GIS.md), [18_XLSFORM](18_XLSFORM.md), [19_ANALYSE](19_ANALYSE.md), [20_DEPLOIEMENT](20_DEPLOIEMENT.md) | Comment c'est construit, déployé et comment on le construit |
| **Business** | [21_MONETISATION](21_MONETISATION.md), [22_PRESENTATION](22_PRESENTATION.md), [23_COUTS](23_COUTS.md) | Modèle économique, coûts et présentation aux parties prenantes |
| **Exécution & conformité** | [24_RISQUES_ET_LACUNES](24_RISQUES_ET_LACUNES.md), [25_ETHIQUE_CONSENTEMENT](25_ETHIQUE_CONSENTEMENT.md), [26_SECURITE_MODELE_MENACE](26_SECURITE_MODELE_MENACE.md) | Réalisme d'exécution, do-no-harm, sécurité — **à lire avant de coder** |

## 2. Parcours par profil

### 👤 Client / décideur (30 min) — « Est-ce la bonne solution pour nous ? »
1. [22_PRESENTATION Partie C](22_PRESENTATION.md) — la présentation client en une page.
2. [01_VISION](01_VISION.md) — la promesse, les personas, à qui s'adresse le produit.
3. [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md) — les 10 principes non négociables (dont « aucune perte de données »).
4. [03_FEATURES](03_FEATURES.md) — le catalogue complet des capacités.
5. [20_DEPLOIEMENT](20_DEPLOIEMENT.md) — SaaS ou installation sur vos serveurs (souveraineté).
6. [14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md) — vs KoboToolbox, ODK, Survey123…
7. [12_ROADMAP](12_ROADMAP.md) et [16_GLOSSAIRE](16_GLOSSAIRE.md).

### 💼 Investisseur (30 min) — « Est-ce un bon pari ? »
1. [22_PRESENTATION Partie A](22_PRESENTATION.md) — le pitch structuré (deck).
2. [01_VISION](01_VISION.md) — problème, marché, vision.
3. [14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md) — le créneau vacant.
4. [21_MONETISATION](21_MONETISATION.md) — modèle économique et comparaison des prix.
5. [12_ROADMAP](12_ROADMAP.md) — exécution et risques ; [09_ARCHITECTURE](09_ARCHITECTURE.md) pour la défendabilité technique.

### 🧑‍💼 Chef de projet / superviseur métier (45 min) — « Comment je vais l'utiliser ? »
1. [01_VISION](01_VISION.md) puis [02_PRD](02_PRD.md) (parcours utilisateurs §4, rôles §5).
2. [06_WEB](06_WEB.md) — form builder, suivi, approbation, cartes, exports.
3. [05_MOBILE](05_MOBILE.md) — ce que vivent vos agents de terrain.
4. [19_ANALYSE](19_ANALYSE.md) — analyses et rapports.

### 🧑‍💻 Développeur / fondateur solo (2 h) — « Par où je commence à coder ? »
1. [24_RISQUES_ET_LACUNES](24_RISQUES_ET_LACUNES.md) — **à lire en premier** : périmètre V0, ce qui se vibecode ou pas, validation terrain.
2. [00_GUIDE_AGENT](00_GUIDE_AGENT.md) — conventions, ordre de construction, definition of done.
3. [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md) — les principes qui arbitrent chaque décision.
4. [09_ARCHITECTURE](09_ARCHITECTURE.md) + [26_SECURITE](26_SECURITE_MODELE_MENACE.md) — stack, sync, sécurité.
5. [10_DATABASE](10_DATABASE.md) + [11_API](11_API.md) — les contrats.
6. Le document de votre couche : [05_MOBILE](05_MOBILE.md) / [06_WEB](06_WEB.md) / [07_AI](07_AI.md) / [08_GIS](08_GIS.md) / [18_XLSFORM](18_XLSFORM.md) / [19_ANALYSE](19_ANALYSE.md).
7. [02_PRD](02_PRD.md) + [03_FEATURES](03_FEATURES.md) + [25_ETHIQUE](25_ETHIQUE_CONSENTEMENT.md) — exigences et do-no-harm.

### 🤖 Agent de développement autonome — « Construire la solution de bout en bout »
Ordre **strict** (chaque étape produit une base testable) :
1. [00_GUIDE_AGENT](00_GUIDE_AGENT.md) — lu en entier, appliqué à la lettre.
2. [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md) — grille d'arbitrage.
3. [09_ARCHITECTURE](09_ARCHITECTURE.md) → [10_DATABASE](10_DATABASE.md) → [11_API](11_API.md) — les contrats à respecter.
4. [02_PRD](02_PRD.md) — traçabilité de chaque fonctionnalité.
5. Docs de spécialité selon la phase en cours : [05_MOBILE](05_MOBILE.md), [06_WEB](06_WEB.md), [07_AI](07_AI.md), [08_GIS](08_GIS.md), [18_XLSFORM](18_XLSFORM.md), [19_ANALYSE](19_ANALYSE.md).
6. [13_DESIGN_SYSTEM](13_DESIGN_SYSTEM.md) — pour toute UI.

## 3. Ordre canonique complet

| # | Document | Rôle |
|---|---|---|
| — | [GUIDE_LECTURE](GUIDE_LECTURE.md) | Ce document |
| 00 | [Guide de l'agent développeur](00_GUIDE_AGENT.md) | Comment construire |
| 01 | [Vision](01_VISION.md) | Pourquoi |
| 02 | [PRD](02_PRD.md) | Quoi (exigences) |
| 03 | [Fonctionnalités](03_FEATURES.md) | Quoi (catalogue) |
| 04 | [UX](04_UX.md) | Comportement |
| 05 | [Mobile](05_MOBILE.md) | App terrain |
| 06 | [Web](06_WEB.md) | Plateforme |
| 07 | [IA](07_AI.md) | Intelligence artificielle |
| 08 | [SIG](08_GIS.md) | Cartographie |
| 09 | [Architecture](09_ARCHITECTURE.md) | Technique |
| 10 | [Base de données](10_DATABASE.md) | Données |
| 11 | [API](11_API.md) | Contrat d'interface |
| 12 | [Roadmap](12_ROADMAP.md) | Quand |
| 13 | [Design system](13_DESIGN_SYSTEM.md) | Apparence |
| 14 | [Analyse concurrentielle](14_COMPETITIVE_ANALYSIS.md) | Marché |
| 15 | [Innovations](15_INNOVATIONS.md) | Différenciation |
| 16 | [Glossaire](16_GLOSSAIRE.md) | Vocabulaire |
| 17 | [Principes de conception](17_PRINCIPES_CONCEPTION.md) | Règles d'arbitrage |
| 18 | [Compatibilité XLSForm](18_XLSFORM.md) | Interopérabilité formulaires |
| 19 | [Analyse & rapports](19_ANALYSE.md) | Statistiques et rapports IA |
| 20 | [Déploiement & confidentialité](20_DEPLOIEMENT.md) | Modes de déploiement, base modulaire, souveraineté |
| 21 | [Monétisation](21_MONETISATION.md) | Modèle économique |
| 22 | [Présentation](22_PRESENTATION.md) | Pitch investisseurs / collaborateurs / clients |
| 23 | [Coûts](23_COUTS.md) | Infrastructure, IA, auto-hébergement, TCO |
| 24 | [Risques & lacunes](24_RISQUES_ET_LACUNES.md) | Réalisme d'exécution, MVP V0, registre |
| 25 | [Éthique & consentement](25_ETHIQUE_CONSENTEMENT.md) | Do-no-harm, consentement enquêtés, conformité |
| 26 | [Sécurité & modèle de menace](26_SECURITE_MODELE_MENACE.md) | Menaces, contrôles, plan solo |

## 4. Comment cette doc reste vivante

- **La doc est contractuelle.** Si le code s'écarte d'un contrat ([10_DATABASE](10_DATABASE.md), [11_API](11_API.md)), on met à jour la doc dans la **même** PR.
- **Toute fonctionnalité est traçable** à une user story du [PRD](02_PRD.md) ou un ID du [catalogue](03_FEATURES.md).
- **Toute décision d'architecture** nouvelle devient un ADR dans [09_ARCHITECTURE](09_ARCHITECTURE.md).
- **Les principes** de [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md) tranchent les désaccords : en cas de conflit entre deux exigences, celui qui sert le mieux ces principes gagne.

## 5. Questions fréquentes → où chercher

| Question | Document |
|---|---|
| « Comment fonctionne la synchronisation offline ? » | [09_ARCHITECTURE §6](09_ARCHITECTURE.md) |
| « Quels types de questions sont supportés ? » | [10_DATABASE §5](10_DATABASE.md) + [18_XLSFORM](18_XLSFORM.md) |
| « Comment l'IA génère un formulaire ? » | [07_AI §2](07_AI.md) |
| « Quels rôles et permissions ? » | [10_DATABASE §6](10_DATABASE.md) |
| « Comment exporter vers QGIS / Power BI / R ? » | [11_API §12–14](11_API.md) + [19_ANALYSE](19_ANALYSE.md) |
| « Que fait l'app sans réseau ? » | [04_UX §2](04_UX.md) + [05_MOBILE](05_MOBILE.md) |
| « Comment sont calculées les superficies ? » | [08_GIS §2](08_GIS.md) |
| « Peut-on importer un formulaire Word/PDF/XLSForm ? » | [18_XLSFORM](18_XLSFORM.md) + [07_AI §2](07_AI.md) |
| « Peut-on l'installer sur nos serveurs / changer de base ? » | [20_DEPLOIEMENT](20_DEPLOIEMENT.md) + [09_ARCHITECTURE §3bis](09_ARCHITECTURE.md) |
| « Quel modèle économique / quels prix ? » | [21_MONETISATION](21_MONETISATION.md) |
| « Combien ça coûte à opérer / à auto-héberger / en IA ? » | [23_COUTS](23_COUTS.md) |
| « Comment présenter le projet à un investisseur/client ? » | [22_PRESENTATION](22_PRESENTATION.md) |
