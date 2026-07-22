# 21 — Plan de monétisation

Stratégie de revenus, calibrée sur les modèles des plateformes concurrentes et sur le positionnement du produit ([01_VISION](01_VISION.md), [14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md)). Objectif : **adoption large par le bas** (freemium crédible face à KoboToolbox) et **monétisation par la valeur ajoutée** (SIG pro, IA, souveraineté, analyse).

> Les prix concurrents ci-dessous sont des **ordres de grandeur (2025-2026), à vérifier** avant toute communication commerciale ; ils servent au positionnement, pas de référence contractuelle.

## 1. Ce que font les plateformes similaires

| Plateforme | Modèle | Fourchette indicative | Enseignement |
|---|---|---|---|
| **KoboToolbox** | Freemium ; serveur communautaire gratuit + plans payants | Gratuit ; plans payants ~ dizaines €/mois selon quotas | Le gratuit est la porte d'entrée du secteur ONG ; on ne peut pas ne pas avoir de free tier crédible |
| **ODK** | Open source self-hosted gratuit + hébergement cloud (ODK Cloud) | Cloud ~ dizaines à centaines €/mois selon soumissions | Le self-hosted gratuit fidélise les techniques ; l'hébergement géré se monétise |
| **Survey123 / ArcGIS** | Licence **par utilisateur nommé** + crédits ArcGIS | Élevé (centaines €/utilisateur/an) | Le per-named-user est un **repoussoir** pour les ONG à beaucoup d'enquêteurs → à éviter |
| **CommCare** | Paliers Community/Standard/Pro/Advanced/Enterprise | ~ centaines €/mois en montée | La segmentation par fonctionnalités marche ; la tarification opaque frustre |
| **Fulcrum** | Abonnement **par utilisateur/mois** | ~ 20-45 €/utilisateur/mois | Bon produit mais coûteux à l'échelle terrain |
| **QField / QFieldCloud** | Freemium (tiers gratuits + payants) | Gratuit → ~ 10-40 €/mois | Le SIG open source se monétise par le cloud de sync, pas par l'app |
| **Mergin Maps** | Freemium par stockage/collaborateurs | Gratuit → paliers €/mois | Idem : sync + stockage comme levier |

**Trois leçons décisives :**
1. Un **free tier crédible** est obligatoire dans ce marché (Kobo/ODK ont habitué le secteur au gratuit).
2. La tarification **par utilisateur nommé pénalise le terrain** (beaucoup d'enquêteurs) → nous facturons autrement (voir §3).
3. La **valeur premium** que personne ne vend aujourd'hui : SIG pro sans licence Esri + IA native + analyse intégrée + **souveraineté (auto-hébergement)**.

## 2. Principe de tarification (notre différenciation)

- **Pas de facturation par enquêteur.** Les agents collecteurs (le rôle le plus nombreux) sont **illimités ou très généreux** sur tous les plans. On facture sur les **sièges de gestion** (chefs de projet, superviseurs, analystes), le **volume de soumissions**, le **stockage médias** et l'**usage IA** — des axes qui suivent la valeur, pas la taille de l'équipe terrain. C'est un argument commercial frontal contre Survey123/Fulcrum.
- **Freemium → valeur.** Le gratuit permet un vrai projet ; on paie pour l'échelle, le SIG avancé, l'IA au-delà d'un quota, et l'entreprise/souveraineté.
- **Transparence.** Grille publique (sauf Enterprise sur devis), à l'opposé de l'opacité reprochée à CommCare.

## 3. Plans SaaS (proposition)

Montants **indicatifs** à valider par étude de marché et coûts réels (IA, stockage, tuiles).

| Plan | Cible | Prix indicatif | Inclus (points clés) | Limites |
|---|---|---|---|---|
| **Communauté (Free)** | Découverte, petits projets, étudiants | 0 € | 1 organisation, collecteurs illimités, collecte offline, form builder, export CSV/GeoJSON, **format .md structuré** (import/export déterministe, 0 € de coût IA), génération de template .md, **BYO key IA/tuiles** possible, tuiles par défaut sans clé, **quota IA de découverte** (ex. 20 générations/mois) | 1-2 sièges gestion, X soumissions/mois, stockage limité (~1 Go), SIG de base, compression photo forcée, purge automatique |
| **Pro** | Consultant, petite équipe, chercheur | ~ 29-49 €/mois | Tout Free + plus de soumissions/stockage, quota IA élargi, XLSForm import/export, exports avancés | Sièges gestion limités, SIG avancé partiel |
| **Équipe / ONG** | ONG, labo, bureau d'études | ~ 149-299 €/mois | **SIG avancé complet** (placettes, transects, géofencing), **contrôle qualité IA**, analyse, plus de sièges, support prioritaire | Quotas généreux, add-ons au-delà |
| **Enterprise** | Gouvernements, bailleurs, grands programmes | Sur devis | **Auto-hébergement / souveraineté**, SSO, API publique, SLA, quotas sur mesure, IA dédiée, DPA | — |

**Réductions** : tarif **ONG/académique** (le cœur de cible), engagement annuel (~2 mois offerts), programmes bailleurs (licences multi-projets). **Sponsored free** pour ONG vérifiées (adossé à des subventions le cas échéant).

## 4. Sources de revenus complémentaires

| Source | Description | Version |
|---|---|---|
| **Add-ons à l'usage** | Crédits IA au-delà du quota (génération, contrôle qualité, rapports), tuiles satellite premium, stockage additionnel, SMS/notifications | V1 (IA) → V2 |
| **Licence auto-hébergée** | Abonnement annuel par déploiement (paliers selon sièges/volume) pour le mode souverain ([20_DEPLOIEMENT](20_DEPLOIEMENT.md)) | ENT |
| **Services professionnels** | Onboarding, conception de formulaires, formation des équipes, intégrations sur mesure, analyse de données à la demande | dès V1 (manuel) |
| **Support & SLA** | Paliers de support (communautaire → prioritaire → dédié 24/7) | V1→ENT |
| **Marketplace** | Modèles de formulaires sectoriels et connecteurs (partage de revenus avec les auteurs) | V3 |
| **Partenariats bailleurs/intégrateurs** | Revente via intégrateurs SIG/M&E, licences-cadres bailleurs | ENT |

**Note sur les coûts variables (marge)** : l'IA et les tuiles satellite sont des **coûts marginaux réels** ([07_AI §4](07_AI.md), [09 §9](09_ARCHITECTURE.md)). Les quotas et add-ons IA doivent couvrir ces coûts avec marge ; l'IA n'est jamais « illimitée » sur les plans bas. Le stockage médias et la bande passante sont provisionnés par plan. **Structure de coûts détaillée (infrastructure, IA à l'usage, installation auto-hébergée, TCO client) : [23_COUTS](23_COUTS.md).**

### Leviers free tier (coût marginal ~0)

Le plan gratuit doit être généreux sans saigner les marges. Les leviers identifiés :

1. **Génération .md déterministe par défaut** — le plan free utilise le format .md structuré (FORM-MD-01) parsé sans IA. L'IA reste disponible via un quota limité ou en payant. **Coût : 0 € par import.**
2. **BYO key (Bring Your Own Key)** — l'utilisateur gratuit peut brancher sa propre clé API Anthropic (IA) et sa propre clé de tuiles satellite. Le coût variable est **chez lui**, pas chez nous. Applicable aussi à l'auto-hébergé.
3. **Tuiles sans clé par défaut** — fonds OSM/satellite gratuits intégrés (OpenFreeMap, EOX Sentinel-2). Aucun coût de licence par utilisateur.
4. **Plafonds free stricts** — stockage limité (~1 Go), soumissions/mois plafonnées, compression photo forcée (max 2048 px), purge automatique des médias anciens.
5. **Auto-hébergement open-core** — le cœur de collecte est open source. L'infrastructure est à la charge du client, coût nul pour nous.
6. **Sponsored free pour ONG vérifiées** — comptes gratuits renforcés pour les ONG éligibles, adossés à des subventions ou partenariats bailleurs.

**Résultat** : un free tier généreux qui coûte quasi rien à opérer, même avec des milliers d'utilisateurs.

## 5. Logique d'acquisition (funnel)

1. **Free** — capter les utilisateurs frustrés de Kobo/ODK (import XLSForm pour migrer sans ressaisie, [18_XLSFORM](18_XLSFORM.md)) ; l'effet « wow » de la génération IA en démonstration.
2. **Pro/Équipe** — conversion quand le projet grandit (volume, SIG avancé, contrôle qualité IA, besoin d'analyse).
3. **Enterprise** — tiré par la **souveraineté** (auto-hébergement) et la conformité (gouvernements, bailleurs, données sensibles) : c'est le segment à plus forte valeur et le moins servi par les concurrents.

## 6. Indicateurs à suivre

Conversion free→payant, revenu net par organisation (ARPA), rétention (NRR), coût IA/stockage par organisation vs revenu, part du self-hosted dans le CA, coût d'acquisition (CAC) vs valeur vie (LTV). Ces métriques conditionnent l'ajustement des quotas et des prix après les pilotes.

> **À trancher avant lancement commercial** : les montants exacts, l'unité de volume (soumissions/mois vs stockage), et le périmètre précis du free tier. Ce document fixe la **structure** ; les chiffres se calent sur les coûts réels observés en V1 et une étude de prix auprès des pilotes.

## 7. Open-source vs propriétaire — modèle adopté : **open-core**

**Décision prise (V0).** Modèle open-core : cœur open source + fonctions premium propriétaires. Cette décision répond au risque R5 ([24_RISQUES_ET_LACUNES](24_RISQUES_ET_LACUNES.md)).

### 7.1 Licence

| Couche | Licence | Justification |
|---|---|---|
| **Cœur** : collecte offline, form-engine, moteur de sync, app mobile, app web de base, exports | **AGPL-3.0** | Protège contre la reprise SaaS par un tiers sans contribution. Quiconque modifie le code et le rend accessible en réseau (SaaS) DOIT publier ses modifications. Les ONG/gouvernements qui l'installent en interne ne sont pas impactées (pas de redistribution commerciale). |
| **`packages/shared`** : types, schémas zod, constantes | **MIT** | Permet aux intégrateurs (Power BI, R, Python, QGIS) d'utiliser nos types sans contrainte AGPL. Favorise l'interopérabilité ouverte ([P10](17_PRINCIPES_CONCEPTION.md)). |
| **Fonctions premium** : IA, SIG avancé (placettes, transects, tuiles serveur), analyse statistique, Enterprise (SSO, audit, support) | **Propriétaire** | Finance le développement. Distribué uniquement dans les plans Pro/Team/Enterprise et auto-hébergé. |

**Note** : si l'AGPL s'avère être un frein à l'adoption constaté sur le terrain (retours utilisateurs), on pourra relicencier le cœur en MIT — beaucoup plus facile que l'inverse.

### 7.2 Contenu open vs premium

| Module | Open (AGPL) | Premium (propriétaire) |
|---|---|---|
| Collecte offline (mobile) | ✅ Tout | — |
| Form-engine (tous types questions, logique, validation, calculs) | ✅ Tout | — |
| Moteur de synchronisation | ✅ Tout | — |
| Builder web (édition visuelle) | ✅ Tout | — |
| Export XLSForm, .md structuré | ✅ Tout | — |
| Table des soumissions, carte points, dashboard basique | ✅ Tout | — |
| Exports CSV, GeoJSON | ✅ Tout | — |
| **IA** (génération formulaires, contrôle qualité, chat, rapports) | ❌ | ✅ Fonctions IA complètes ; quota de découverte dans le SaaS free |
| **SIG avancé** (placettes, transects, buffers, géofencing) | ❌ | ✅ Modules SIG spécialisés |
| **Analyse statistique** (ANOVA, régression, tableaux croisés) | ❌ | ✅ Moteur d'analyse |
| **Import XLSForm round-trip**, import Word/PDF | ❌ | ✅ Import avancé |
| OpenRosa interop | ❌ | ✅ INTEROP-01 |
| SSO, audit log complet, API publique, webhooks | ❌ | ✅ Enterprise |
| Auto-hébergement packagé (Docker/Helm) | ❌ | ✅ Licence Enterprise (le cœur AGPL reste téléchargeable et auto-installable sans licence ; le support et l'empaquetage sont premium) |

### 7.3 Cohérence souveraineté

Le cœur open + l'auto-hébergement ([20_DEPLOIEMENT](20_DEPLOIEMENT.md)) donnent aux clients sensibles une garantie que ni Kobo (fonctions limitées) ni Esri (fermé) n'offrent ensemble : ils peuvent auditer le code qui traite leurs données, et l'installer sur leur propre infrastructure, sans aucune dépendance vers notre cloud.

### 7.4 Rythme d'ouverture

Le cœur sera ouvert dès la première version stable (V0-M5, premier projet terrain). Pas d'ouverture « à l'avance » pendant le développement solo — le temps de stabiliser l'API et les interfaces avant de les figer dans le contrat open source.
