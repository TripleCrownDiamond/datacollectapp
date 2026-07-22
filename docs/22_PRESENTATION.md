# 22 — Document de présentation (investisseurs, collaborateurs, clients)

Support de présentation du projet, décliné pour trois audiences. Il synthétise la documentation existante ; les chiffres de marché et de prix sont **indicatifs, à vérifier** avant toute diffusion externe. Nom de travail : **TerraCollect**.

---

## Partie A — Pitch investisseurs (structure de deck)

### 1. Accroche
La collecte de données terrain repose encore sur des outils conçus il y a 15 ans. **Nous construisons la plateforme de collecte de nouvelle génération : offline-first, SIG professionnel intégré, et IA copilote — au prix des outils open source.**

### 2. Le problème
- Créer un formulaire est **lent et technique** (XLSForm/Excel).
- Le **SIG** est soit rudimentaire (Kobo/ODK), soit **verrouillé et cher** (écosystème Esri).
- Le **contrôle qualité** se fait des semaines après le terrain, quand il est trop tard.
- L'**analyse** est externalisée (export → Excel/R) : rupture pour les équipes non techniques.
- **Aucune IA native.**

### 3. La solution
Une plateforme web + mobile unifiée : **formulaires générés par IA en langage naturel** (ou importés Word/PDF/XLSForm), **collecte 100 % hors ligne** avec cartes satellite, **SIG pro** (placettes, transects, géofencing) sans licence Esri, **contrôle qualité IA en temps réel**, et **analyse + rapports** intégrés. Voir [01_VISION](01_VISION.md), [03_FEATURES](03_FEATURES.md).

### 4. Pourquoi maintenant
- Les LLM rendent enfin possible la génération de formulaires et le contrôle qualité sémantique **fiables**.
- Les fonds cartographiques et vectoriels **open source** (MapLibre, PMTiles) éliminent le coût des licences.
- Exigence croissante de **souveraineté des données** (RGPD, bailleurs, gouvernements) que les SaaS fermés ne satisfont pas.

### 5. Marché
Cible : ONG et humanitaire, recherche (agronomie/foresterie/environnement), M&E, administrations, entreprises (audit, inspection, agri). Des centaines de milliers d'organisations utilisent déjà Kobo/ODK/Survey123. *(Dimensionner TAM/SAM/SOM avec des sources vérifiées avant présentation.)*

### 6. Différenciation
Personne n'occupe l'**intersection** « enquête accessible + SIG pro + IA native + souveraineté ». Détail et matrice comparative : [14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md).

| | Enquête | Offline | SIG | Analyse | IA | Prix ONG | Souveraineté |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Kobo/ODK | ●●● | ●●● | ● | ● | — | ●●● | ●● |
| Esri (Survey123) | ●●● | ●● | ●●● | ●●● | ● | ● | ● |
| QField/Mergin | ● | ●●● | ●●● | ● | — | ●●● | ●● |
| **Nous** | ●●● | ●●● | ●●● | ●●● | ●●● | ●●● | ●●● |

### 7. Produit & traction
État : conception/documentation complète (source de vérité prête au développement). Jalons : V1 (MVP, ~4 mois) → pilotes ONG/recherche → V2 (SIG pro + interopérabilité Kobo/ODK) → V3 (analyse avancée) + Enterprise. Feuille de route : [12_ROADMAP](12_ROADMAP.md).

### 8. Modèle économique
Freemium SaaS + add-ons IA à l'usage + **licence auto-hébergée (souveraineté)** + services + marketplace. On **ne facture pas par enquêteur** (contrairement à Esri/Fulcrum) : levier d'adoption terrain. Détail : [21_MONETISATION](21_MONETISATION.md) ; structure de coûts et marges : [23_COUTS](23_COUTS.md).

### 9. Go-to-market
1. Adoption par le bas : free tier + **migration XLSForm sans ressaisie** depuis Kobo/ODK.
2. Effet « wow » de la génération IA en avant-vente.
3. Montée en gamme : SIG avancé, contrôle qualité, analyse.
4. Enterprise tiré par la souveraineté (gouvernements, bailleurs).

### 10. Technologie & défendabilité
Monorepo TypeScript, offline-first robuste (protocole de sync propriétaire à idempotence, [09 §6](09_ARCHITECTURE.md)), moteur de formulaires **sur-ensemble de XLSForm** ([18_XLSFORM](18_XLSFORM.md)), base à **hébergement modulaire** (Supabase managé → Postgres auto-hébergé) et **déployable en SaaS ou auto-hébergé** ([20_DEPLOIEMENT](20_DEPLOIEMENT.md)). Barrières : robustesse offline (difficile à bien faire), qualité des prompts (évals continues), interopérabilité, et confiance/souveraineté.

### 11. Équipe & demande
**État réel : fondateur solo, développeur expérimenté, build accéléré par l'IA (vibecode).** C'est un atout de vélocité et de coûts fixes bas — assumé comme tel. La stratégie d'exécution en tient compte : périmètre resserré autour d'un **V0 « Socle fiable »** avant toute fonctionnalité différenciante, cœur sensible spécifié et testé (non vibecodé à l'aveugle), validation terrain préalable ([24_RISQUES_ET_LACUNES](24_RISQUES_ET_LACUNES.md)).
- **Ce qu'un financement débloquerait** (si levée) : atteindre le V0 en production sur des pilotes réels, financer 3–5 pilotes ONG/recherche, puis recruter (1er profil : ingénieur backend/sync ou growth selon la traction).
- **Sans financement** : bootstrap possible sur le V0 open-core + premiers clients Pro/Équipe, la vélocité IA compensant l'absence d'équipe. *(Compléter avec un chiffrage précis avant présentation à un investisseur.)*

### 12. Vision
Devenir le **standard mondial** de la collecte terrain intelligente : de la question posée en langage naturel jusqu'à la décision, avec un minimum d'effort et une fiabilité absolue des données. Vision 5 ans : [01_VISION](01_VISION.md).

### Risques & parades (annexe investisseurs)
Fiabilité de la sync terrain, qualité IA, coûts variables (IA/tuiles), périmètre V1 — parades documentées dans [12_ROADMAP](12_ROADMAP.md).

---

## Partie B — Présentation collaborateurs (développeurs & partenaires techniques)

**Pourquoi rejoindre / contribuer.** Un produit à fort impact (ONG, recherche, souveraineté des données), une base technique moderne et documentée de bout en bout, pensée pour un développement collaboratif **et** assisté par agents IA.

- **Stack** : monorepo TypeScript (Expo mobile, Next.js web, NestJS API, Supabase/Postgres+PostGIS, MapLibre, API Claude). [09_ARCHITECTURE](09_ARCHITECTURE.md).
- **Qualité** : contrats explicites ([10_DATABASE](10_DATABASE.md), [11_API](11_API.md)), tests exigés, definition of done claire ([00_GUIDE_AGENT](00_GUIDE_AGENT.md)).
- **Onboarding** : le [Guide de lecture](GUIDE_LECTURE.md) amène tout nouveau contributeur à la productivité rapidement ; principes d'arbitrage explicites ([17_PRINCIPES_CONCEPTION](17_PRINCIPES_CONCEPTION.md)).
- **Ouverture** : plateforme API-first ([P10](17_PRINCIPES_CONCEPTION.md)), interopérable (XLSForm, QGIS, Power BI, R/Python), déployable chez le partenaire.
- **Comment contribuer** : voir la section « Contribuer » du [README](../README.md) et les conventions du guide agent.

---

## Partie C — Présentation clients (une page)

**Collectez mieux, plus vite, partout — même sans réseau.**

- **Créez vos formulaires en une phrase.** Décrivez votre besoin, l'IA génère le questionnaire ; ou importez votre Word/PDF/XLSForm existant.
- **Vos équipes collectent hors ligne.** Photos, GPS, cartes satellite, signatures — tout fonctionne sans connexion, rien n'est jamais perdu, la synchronisation est automatique.
- **La qualité est contrôlée à la source.** L'IA repère en temps réel incohérences, doublons, GPS suspects, photos floues — et propose des corrections, sans jamais décider à votre place.
- **La cartographie professionnelle est intégrée.** Placettes, transects, parcelles, superficies calculées automatiquement — sans licence coûteuse.
- **De la donnée à la décision.** Tableaux de bord, cartes interactives, analyses et rapports générés automatiquement ; exports vers Excel, QGIS, Power BI, R, SPSS.
- **Vos données vous appartiennent.** Hébergement UE, export à tout moment, et — si vous le souhaitez — **installation sur vos propres serveurs** : vos données ne sortent jamais de chez vous.
- **Un tarif juste.** Vos agents de terrain ne sont **jamais facturés** ; un plan gratuit pour démarrer, et vous ne payez que pour l'échelle et les fonctions avancées.

**Pour qui ?** ONG, chercheurs, bureaux d'études, administrations, entreprises. **Comment démarrer ?** Créez un compte (SaaS) ou demandez un déploiement souverain (Enterprise). Glossaire tout public : [16_GLOSSAIRE](16_GLOSSAIRE.md).

---

> **Format.** Ce document est le **contenu source**. Pour une présentation projetée (slides) ou un one-pager PDF, ce contenu peut être décliné en deck visuel — demander la génération d'un support à partir de cette trame. Les éléments entre *(parenthèses italiques)* (équipe, montant, TAM chiffré) sont à compléter avec des données vérifiées avant toute diffusion externe.
