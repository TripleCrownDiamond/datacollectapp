# 27 — Modules futurs & extensibilité

> ⚠️ **Ce document est un catalogue d'extensibilité, PAS un engagement de roadmap.** Il décrit ce que l'architecture doit pouvoir accueillir **sans refonte** — pas ce qui sera construit. Le périmètre engagé est défini par [12_ROADMAP](12_ROADMAP.md), et la discipline de découpage par [24_RISQUES_ET_LACUNES §2-3](24_RISQUES_ET_LACUNES.md) : **rien ici n'entre en développement avant que le V0 « Socle fiable » ne soit prouvé sur le terrain.**

## 1. Vision

La plateforme est conçue comme une architecture **modulaire**, **extensible** et **plug-and-play**. Même si certaines fonctionnalités (IoT, drones, télédétection…) ne seront pas disponibles au lancement, l'architecture doit être prête à les accueillir. Chaque module doit pouvoir être développé, déployé, activé ou désactivé indépendamment.

**Ce que cela impose dès aujourd'hui** (le seul coût à payer maintenant) :
- des **frontières de modules nettes** (services NestJS découplés, interfaces de repository — [09_ARCHITECTURE §3bis](09_ARCHITECTURE.md)) ;
- un **modèle de données extensible** (`geo_features.kind`, `properties` JSONB, `submissions.meta` — [10_DATABASE](10_DATABASE.md)) ;
- une **API versionnée** et documentée ([11_API](11_API.md)) ;
- des **jobs asynchrones** pour les traitements lourds (BullMQ), déjà en place pour l'IA et les exports.

Rien de plus. On ne construit pas d'abstraction spéculative pour des modules non engagés ([P1 « simplicité avant complexité »](17_PRINCIPES_CONCEPTION.md)).

## 2. Architecture cible

| Brique | Statut |
|---|---|
| Core Platform | V0 ([09_ARCHITECTURE](09_ARCHITECTURE.md)) |
| Mobile App | V0 ([05_MOBILE](05_MOBILE.md)) |
| Web Platform | V0 ([06_WEB](06_WEB.md)) |
| Public API | ENT ([11_API §14](11_API.md)) |
| Plugin System | post-V3 (§13) |
| Integration Hub | ENT (§12) |

Tous les modules communiquent via des API internes documentées.

### Modules cœur (déjà spécifiés)

Authentification · Utilisateurs · Organisations · Projets · Formulaires · Collecte · Synchronisation offline · SIG · IA · Dashboard · Rapports · API.

> ⚠️ **Lacune identifiée : les Notifications** (push, email, SMS) sont listées comme module cœur mais **ne sont spécifiées nulle part** ([11_API](11_API.md), [10_DATABASE](10_DATABASE.md) n'en contiennent pas le modèle). À spécifier avant la V1 (elles conditionnent le workflow d'approbation et les alertes) — à ajouter au registre [24 §4](24_RISQUES_ET_LACUNES.md).

## 3. Tableau de bord des modules

| # | Module | Horizon | Déjà partiellement spécifié dans |
|---|---|---|---|
| 1 | Télédétection | post-V3 | [08_GIS §2b](08_GIS.md) (imagerie satellite) |
| 2 | Drone | post-V3 | — |
| 3 | IoT | post-V3 | — |
| 4 | IA Vision | IA+ | [15_INNOVATIONS](15_INNOVATIONS.md) (analyse d'images terrain) |
| 5 | SIG avancé | **V2 (partiel)** | [08_GIS](08_GIS.md) — la majorité est déjà spécifiée |
| 6 | Météo | post-V3 | — |
| 7 | Analytics avancés | **V3** | [19_ANALYSE §2](19_ANALYSE.md) — déjà spécifié |
| 8 | Copilote IA | **V1→V3** | [07_AI](07_AI.md) — déjà spécifié (AI-01→AI-10) |
| 9 | Integration Hub | **ENT** | [11_API §14](11_API.md) — déjà spécifié |
| 10 | Plugin Marketplace | post-V3 | [03_FEATURES](03_FEATURES.md) (marketplace V3) |

**Lecture** : les modules 5, 7, 8, 9 ne sont pas « futurs » — ils sont **déjà spécifiés ailleurs** et ce document ne fait que rappeler leur trajectoire. Les modules 1, 2, 3, 4, 6, 10 sont de vraies extensions futures.

## 4. Module 1 — Télédétection

Sources compatibles : Sentinel-2, Sentinel-1 (radar), Landsat, Planet, Maxar, Google Earth Engine, Copernicus, NASA EarthData. *(Le choix des fournisseurs d'imagerie et leur modèle de coût sont traités en [08_GIS §2b](08_GIS.md) et [23_COUTS §5](23_COUTS.md).)*

Fonctionnalités futures : indices NDVI, EVI, SAVI, NDWI · détection de déforestation · détection de maladies · stress hydrique · classification automatique des cultures · estimation des rendements · historique des cultures · comparaison temporelle · détection des changements · alertes automatiques.

**Architecture** : traitements lourds déportés dans un **microservice externe** (raster/Python), appelé en job asynchrone — jamais dans le chemin de collecte ([P4](17_PRINCIPES_CONCEPTION.md)).

## 5. Module 2 — Drone

Intégrations envisagées : DJI, Autel, Parrot, Pix4D, DroneDeploy.

Fonctionnalités : import des vols · import des orthomosaïques · photogrammétrie · nuages de points · modèles 3D · calculs de volume · comptage automatique · détection IA · inspection des cultures.

**Point d'ancrage existant** : les orthomosaïques s'intègrent comme fonds de carte personnalisés (COG/PMTiles) via le registre de fournisseurs ([08_GIS §2b](08_GIS.md)) — c'est déjà prévu.

## 6. Module 3 — IoT

Protocoles : MQTT, HTTP, LoRaWAN, Sigfox, NB-IoT.

Capteurs : humidité du sol · température · pluviométrie · vent · rayonnement solaire · qualité de l'air · niveau et débit d'eau · pH · conductivité · capteurs agricoles · stations météo connectées.

**Contrainte** : ingestion temps réel = un modèle de données **séries temporelles**, distinct des `submissions` (qui sont événementielles et immuables). Ne pas forcer l'IoT dans le schéma de collecte : prévoir une table dédiée (ou une extension type TimescaleDB) le moment venu.

## 7. Module 4 — IA Vision

Détection de maladies · ravageurs · comptage d'arbres et de fruits · mauvaises herbes · classification d'espèces · détection d'anomalies · OCR · lecture automatique de documents.

**Cohérence** : l'OCR est déjà catalogué (COL-12, V3) et l'analyse d'images terrain est listée en [15_INNOVATIONS](15_INNOVATIONS.md) comme exploratoire ⚠️. Ces fonctions restent soumises à la règle [P6](17_PRINCIPES_CONCEPTION.md) : l'IA **propose**, l'humain valide.

## 8. Module 5 — SIG avancé

Formats : GeoJSON, Shapefile, KML, GPX, GeoPackage, GeoTIFF, COG, MBTiles, PMTiles, tuiles raster et vectorielles, WMS, WMTS, WFS.
Fonctions : buffers · intersections · dissolve · union · découpage · calculs de surfaces et distances · heatmaps · analyse spatiale.

> **Déjà spécifié en grande partie dans [08_GIS](08_GIS.md)** (GIS-06 buffers, GIS-09/10 import-export, GIS-11 calculs, PMTiles/MBTiles offline). Ce module ne couvre que le **reliquat** : GeoPackage, WMS/WFS, dissolve/union/découpage, heatmaps — horizon V3+.

## 9. Module 6 — Météo

Intégrations : OpenWeather, Tomorrow.io, ECMWF, NOAA.
Fonctionnalités : prévisions · historique · alertes · cumuls de pluie · température · humidité · vent.

**Contrainte offline** : la météo est une donnée **en ligne** — elle doit être un enrichissement dégradable, jamais un prérequis à la collecte ([P4](17_PRINCIPES_CONCEPTION.md)).

## 10. Module 7 — Analytics avancés

Descriptives · corrélations · régressions · ANOVA · **ACP** · **clustering** · séries temporelles · cartographie statistique. Génération automatique de rapports par IA.

> **Déjà spécifié dans [19_ANALYSE §2](19_ANALYSE.md)** (V3, moteur statistique serveur). Ajouts propres à ce module : **ACP** et **clustering** — à intégrer au catalogue [19_ANALYSE](19_ANALYSE.md) (ID **ANA-07**). Les garde-fous d'honnêteté statistique de [19 §2](19_ANALYSE.md) s'appliquent intégralement.

## 11. Module 8 — Copilote IA

Générer un formulaire · corriger les réponses · détecter les erreurs · résumer une enquête · générer un rapport · interpréter les résultats · répondre à des questions sur les données.

> **Déjà spécifié dans [07_AI](07_AI.md)** : AI-01 (génération), AI-03 (contrôle qualité), AI-06 (résumé), AI-07 (chat données), AI-08 (rapports), AI-09 (assistant terrain). Ce module n'ajoute rien de nouveau — il décrit la trajectoire consolidée.

## 12. Module 9 — Integration Hub

Connecteurs vers les systèmes **du client**, via l'API publique et les exports : **Power BI**, **Excel**, **SPSS**, **R**, **Python**, **QGIS**, **ArcGIS**, **PostgreSQL/PostGIS**, webhooks signés.

> **Déjà spécifié dans [11_API §14](11_API.md)** et [19_ANALYSE §5](19_ANALYSE.md) (ENT). *Précision importante : il s'agit de **destinations d'export/intégration chez le client**, sans rapport avec la base de la plateforme — celle-ci reste **PostgreSQL + PostGIS** dans tous les modes de déploiement ([ADR-4](09_ARCHITECTURE.md), [20_DEPLOIEMENT §3](20_DEPLOIEMENT.md)).*

## 13. Module 10 — Plugin Marketplace

Toute nouvelle fonctionnalité doit pouvoir être ajoutée sous forme de plugin activable/désactivable sans modifier le cœur. Exemples : drone DJI, Sentinel, IoT, IA, OCR, signature, paiement, biométrie.

**Prérequis à traiter avant d'ouvrir un système de plugins** : modèle de sécurité (un plugin tiers ne doit **jamais** accéder aux données brutes des enquêtés — [25_ETHIQUE_CONSENTEMENT](25_ETHIQUE_CONSENTEMENT.md), [26_SECURITE](26_SECURITE_MODELE_MENACE.md)), isolation d'exécution, revue et signature des plugins, partage de revenus ([21_MONETISATION §4](21_MONETISATION.md)). Horizon post-V3.

## 14. Principes d'architecture (alignés sur [17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md))

- **Architecture modulaire** — frontières nettes, activation/désactivation par module.
- **API First** — toute capacité est accessible par API ([P10](17_PRINCIPES_CONCEPTION.md)).
- **Offline First** — la collecte fonctionne sans réseau ([P4](17_PRINCIPES_CONCEPTION.md)).
- **IA copilote, jamais bloquante** — l'IA accompagne toute la collecte mais **tout fonctionne sans elle** ([P6](17_PRINCIPES_CONCEPTION.md)). *(À ne pas formuler « IA First » : cela contredirait P4 et P6.)*
- **SIG natif** ([P8](17_PRINCIPES_CONCEPTION.md)).
- **Extensible** — sans refonte du cœur.
- **Extractible en services** — les traitements lourds (raster, statistiques, IA) sont des jobs asynchrones, extractibles en microservices ; le cœur reste un monolithe modulaire ([ADR-3](09_ARCHITECTURE.md)). *(On ne part pas en microservices d'emblée : ce serait ingérable en solo.)*
- **Open-core** — cœur AGPL, premium propriétaire ([21_MONETISATION §7](21_MONETISATION.md)).
- **Multi-tenant, sécurisée, scalable, cloud-native** — et **auto-hébergeable** ([20_DEPLOIEMENT](20_DEPLOIEMENT.md)).

## 15. Objectif

Construire une plateforme **évolutive**, capable d'intégrer à l'avenir satellites, drones, capteurs IoT, analyses géospatiales avancées et IA, **sans refonte de l'architecture**. Le MVP reste **léger** : seules les interfaces, API et modèles de données sont conçus pour accueillir ces modules — pas les modules eux-mêmes.
