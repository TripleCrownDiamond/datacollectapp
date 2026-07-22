# 17 — Principes de conception

Ces principes **priment sur toute préférence individuelle** et servent d'arbitre en cas de conflit entre deux exigences. Toute décision de conception ou de développement doit pouvoir se justifier au regard de ces principes. Ils sont la traduction opérationnelle de la [Vision](01_VISION.md).

## La double exigence de chaque fonctionnalité

Aucune fonctionnalité n'est ajoutée si elle ne sert **au moins un** de ces deux buts, sans dégrader l'autre :

1. **Réduire le temps de collecte.**
2. **Améliorer automatiquement la qualité des données.**

Une fonctionnalité qui allonge la collecte sans gain de qualité, ou qui dégrade la qualité pour gagner du temps, est refusée. Ce test est explicite dans chaque revue de conception (« quel(s) but(s) sert cette fonctionnalité ? »).

## Les 10 principes

| # | Principe | Traduction concrète | Où c'est vérifié |
|---|---|---|---|
| P1 | **Simplicité avant complexité** | La solution la plus simple qui remplit l'exigence gagne. Toute complexité doit être justifiée par une exigence réelle, jamais anticipée. | Revue de conception, ADR ([09](09_ARCHITECTURE.md)) |
| P2 | **Moins de clics** | Chaque parcours a un budget d'interaction mesuré et respecté. On compte les gestes. | Budgets d'interaction [04_UX §3](04_UX.md) |
| P3 | **Navigation intuitive** | Utilisable sans manuel par une personne peu à l'aise avec l'informatique. Aucun jargon dans l'UI. | Tests utilisateurs, [04_UX §1, §4](04_UX.md) |
| P4 | **Offline First** | Tout ce qui touche la collecte fonctionne 100 % sans réseau ; le réseau ne sert qu'à synchroniser. | [04_UX §2](04_UX.md), [05_MOBILE](05_MOBILE.md), [09 §6](09_ARCHITECTURE.md) |
| P5 | **Synchronisation robuste** | Reprise sur erreur, idempotence, jamais de doublon, jamais d'écrasement silencieux. | Protocole [09 §6](09_ARCHITECTURE.md), tests d'injection de pannes |
| P6 | **IA comme copilote** | L'IA accompagne toute la collecte (génération, contrôle qualité, assistant) mais **propose sans jamais imposer** ; tout fonctionne sans elle. | [07_AI](07_AI.md) |
| P7 | **Contrôle qualité intégré** | La qualité se contrôle **à la source** (validation à la saisie + IA en temps réel), pas a posteriori. | [07_AI §3](07_AI.md), [04_UX §5](04_UX.md) |
| P8 | **SIG au cœur de la collecte** | La carte n'est pas un module annexe : c'est un mode de saisie et de contrôle central, disponible hors ligne. | [08_GIS](08_GIS.md) |
| P9 | **Aucune perte de données** | Sauvegarde automatique continue, brouillons résilients, rien n'est jamais détruit sans confirmation explicite. C'est le principe **prioritaire absolu**. | [05_MOBILE §2.6](05_MOBILE.md), règles métier [02_PRD §5](02_PRD.md) |
| P10 | **Plateforme ouverte via API** | Toute capacité de la plateforme est accessible par API REST documentée ; interopérable avec l'écosystème (QGIS, Power BI, R, Python, SPSS, ArcGIS). | [11_API](11_API.md), [19_ANALYSE §5](19_ANALYSE.md) |

## Règles d'arbitrage

1. **P9 (aucune perte de données) l'emporte toujours.** Aucune optimisation, aucune fonctionnalité ne peut introduire un risque de perte de données terrain.
2. **P4 (offline first) prime sur les fonctionnalités connectées.** Une fonctionnalité qui ne peut exister qu'en ligne (ex. génération IA) est un complément dégradable, jamais un maillon du parcours de collecte.
3. **P1 (simplicité) prime sur l'exhaustivité.** Face à deux implémentations équivalentes en valeur, la plus simple gagne — même si elle couvre un cas de moins.
4. **P6 (IA copilote) ne dispense jamais de P7 côté déterministe.** L'IA renforce le contrôle qualité mais ne le remplace pas : les validations dures restent des règles, pas des suggestions.
5. En cas de tension entre « moins de clics » (P2) et « limiter les erreurs » (P7), c'est la **réduction d'erreurs** qui tranche — mais on cherche d'abord une solution qui sert les deux.

## Anti-principes (ce qu'on refuse explicitement)

- Ajouter une option de configuration pour éviter de trancher un choix de conception (P1).
- Un écran de plus « au cas où » sans parcours utilisateur qui le justifie (P2).
- Un message d'erreur technique montré à un agent de terrain (P3).
- Une fonctionnalité de collecte qui exige le réseau (P4).
- Une résolution de conflit de sync qui écrase des données (P5, P9).
- Une action IA qui écrit en base sans validation humaine (P6).
- Un contrôle qualité repoussé à l'analyse au bureau (P7).
