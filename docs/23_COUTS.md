# 23 — Coûts (infrastructure, IA, auto-hébergement, TCO client)

Modèle de coûts de la plateforme : ce que **nous** dépensons pour opérer le SaaS, ce que coûte l'**IA** à l'usage, ce que coûte une **installation auto-hébergée** chez un client, et le **coût total de possession (TCO)** côté client par plan. Sert à fixer les prix ([21_MONETISATION](21_MONETISATION.md)) avec marge et à conseiller les clients Enterprise.

> **Tous les montants sont indicatifs (ordres de grandeur début 2026) et à vérifier** avant tout devis ou communication. Les tarifs cloud et IA évoluent ; recalibrer sur les coûts réels observés dès la V1.

### Leviers de réduction des coûts sur le free tier

Le plan gratuit doit rester viable économiquement. Les leviers identifiés (détaillés dans [21_MONETISATION](21_MONETISATION.md)) :

| Levier | Impact coût | Détail |
|---|---|---|
| **Génération .md déterministe** | **0 €/import** (vs 0,10–0,30 $/import IA) | Le format .md structuré (FORM-MD-01) est parsé sans LLM. L'IA n'est pas nécessaire pour importer un questionnaire bien formé. |
| **BYO key IA** | Coût IA transféré au client | L'utilisateur branche sa propre clé Anthropic. Zéro coût variable pour nous sur ses appels IA. |
| **BYO key tuiles** | Coût tuiles transféré au client | L'utilisateur fournit sa propre clé de fournisseur satellite. Le défaut sans clé est gratuit. |
| **Compression photo forcée** | Stockage médias réduit ~3× | 2048 px par défaut, configurable vers le bas sur le free. |
| **Plafonds stricts** | Coûts bornés | 1 Go stockage, X soumissions/mois, purge automatique des médias anciens (> 90 jours). |
| **Purge automatique** | Stockage contenu | Les médias de plus de 90 jours sur le free sont purgés (les données texte restent). |

**Résultat** : un utilisateur free qui utilise le .md structuré, apporte sa clé IA et utilise les tuiles par défaut coûte **~0 €/mois** au-delà du stockage de base (~quelques centimes).

## 1. Coûts d'infrastructure SaaS (ce que nous opérons)

Coûts mensuels de notre plateforme, par palier de charge. Hébergement UE.

| Poste | Fournisseur (défaut) | Petite charge (pilotes) | Charge moyenne | Charge élevée |
|---|---|---|---|---|
| Base de données | Supabase (Postgres+PostGIS managé) | ~25 €/mois (Pro) | ~100–300 € | 500 €+ (dédié) |
| API + workers | conteneurs (Fly.io/Render/VPS) | ~20–50 € | ~150–400 € | 800 €+ (scalé) |
| Redis (files, cache) | managé ou conteneur | ~10 € | ~30–80 € | 150 €+ |
| Stockage médias | S3/R2/Supabase Storage | ~0,015–0,02 €/Go/mois | idem × volume | idem × volume |
| Bande passante | égress cloud | ~0,01–0,09 €/Go | idem | idem |
| Tuiles satellite | fournisseur (voir §5) | variable | variable | variable |
| Observabilité | Sentry, logs, métriques | ~0–30 € | ~50–150 € | 300 €+ |
| **Total hors médias/IA/tuiles** | | **~80–150 €/mois** | **~500–1 500 €/mois** | **plusieurs k€/mois** |

Le **stockage médias domine** à l'échelle : une soumission avec 3 photos compressées (~500 Ko chacune) ≈ 1,5 Mo. 100 000 soumissions ≈ 150 Go ≈ ~3 €/mois de stockage + égress au téléchargement. Levier : compression par défaut ([05_MOBILE §2.7](05_MOBILE.md)), purge locale, quotas par plan.

## 2. Coûts de l'IA (à l'usage)

L'IA est un **coût marginal réel** ([07_AI §4](07_AI.md)) : chaque appel consomme des tokens facturés par Anthropic. Modèles par tâche (config `ai.config.ts`) et **tarifs API Claude (par million de tokens, à vérifier)** :

| Modèle | Entrée /1M | Sortie /1M | Usage dans le produit |
|---|---|---|---|
| Claude Sonnet | ~3 $ | ~15 $ | génération de formulaires, analyse, rapports |
| Claude Haiku | ~1 $ | ~5 $ | traduction, classification, contrôles courts |

**Coût estimé par opération** (avec prompt caching sur les préambules stables — spec FormSchema — qui réduit fortement l'entrée facturée) :

| Opération | Tokens (ordre de grandeur) | Coût estimé/opération |
|---|---|---|
| Génération de formulaire (AI-01) | ~8 k entrée (mis en cache) + ~3 k sortie | **~0,05–0,10 $** |
| Import Word/PDF → formulaire | ~10–30 k entrée + ~3 k sortie | **~0,10–0,30 $** |
| Contrôle qualité IA / soumission (AI-03, Haiku) | ~1 k entrée + ~0,5 k sortie | **~0,002–0,005 $** (batch 1 000 ≈ 2–5 $) |
| Résumé IA d'un lot (AI-06) | ~15 k entrée + ~2 k sortie | **~0,08 $** |
| Rapport IA (AI-08) | ~20–40 k entrée + ~5 k sortie | **~0,15–0,30 $** |
| Requête « chat avec les données » (AI-07) | ~5 k entrée + ~1 k sortie | **~0,02–0,05 $** |

**Conséquences tarifaires** : les quotas IA des plans ([21_MONETISATION §3](21_MONETISATION.md)) et les crédits à l'usage doivent **couvrir ces coûts avec marge**. L'IA n'est jamais « illimitée » sur les plans bas. En auto-hébergement, l'IA utilise la **clé du client** — le coût IA lui incombe directement, ou l'IA est désactivée.

## 3. Coûts d'installation auto-hébergée (Enterprise)

Deux volets : notre **prestation de déploiement** (facturée) et les **coûts récurrents que le client supporte** sur son infrastructure.

### 3.1 Prestation de déploiement (one-time, facturée par nous)
| Poste | Contenu | Ordre de grandeur |
|---|---|---|
| Installation standard | Docker Compose/Helm, base, stockage, config, vérification | **~2 000–6 000 €** |
| Installation complexe | HA, SSO, intégration SI existant, reprise de données | **~8 000–25 000 €+** (selon périmètre) |
| Formation + accompagnement | admins + formateurs internes | **~1 000–3 000 €/session** |

### 3.2 Coûts récurrents supportés par le client
| Poste | Détail | Ordre de grandeur mensuel |
|---|---|---|
| Serveur / VM | Postgres+PostGIS, API, MinIO, Redis (1 hôte moyen suffit pour démarrer) | **~40–200 €/mois** (VPS) à plus (cloud privé/HA) |
| Stockage | disque/S3 privé selon volume de médias | selon volume (cf. §1) |
| Sauvegardes | PITR, rétention | ~10–50 €/mois |
| IA (optionnelle) | clé LLM du client, coûts §2 à sa charge | selon usage |
| Exploitation | temps admin interne (mises à jour d'images, monitoring) | ~0,2–0,5 j/mois |

### 3.3 Licence auto-hébergée (notre revenu récurrent)
Abonnement annuel par déploiement, par paliers (sièges de gestion / volume), séparé de la prestation d'installation. Détail commercial : [21_MONETISATION §4](21_MONETISATION.md).

## 4. Coût total de possession (TCO) — vue client par plan

Ce que paie un client, tout compris (abonnement + add-ons prévisibles). **Indicatif.**

| Profil client | Plan | Coût mensuel typique | Notes |
|---|---|---|---|
| Consultant / petit projet | Communauté (Free) → Pro | 0 → ~29–49 € | IA au quota ; add-ons IA si dépassement |
| ONG / labo (1 projet actif, ~20 collecteurs) | Équipe/ONG | ~149–299 € | collecteurs illimités ; SIG avancé + contrôle qualité IA inclus |
| Programme multi-projets, gros volumes | Enterprise (cloud) | sur devis | quotas sur mesure, SLA, stockage/IA provisionnés |
| Gouvernement / données sensibles | Enterprise (auto-hébergé) | installation (§3.1) + licence annuelle + coûts infra client (§3.2) | souveraineté totale ; IA sur clé client |

**Add-ons à budgéter (client)** : crédits IA au-delà du quota (§2), stockage médias additionnel, tuiles satellite premium (§5), exports/rapports IA volumineux.

## 5. Coût des fonds de carte (tuiles)

Matrice complète des fournisseurs et modèle de configuration : [08_GIS §2b](08_GIS.md). Vue coûts :

| Palier | Exemples | Coût par requête | Qui paie |
|---|---|---|---|
| **Défaut sans clé** | OpenFreeMap / Protomaps (plan), EOX Sentinel-2 cloudless (satellite), AWS Terrain (relief) | **~0 €** | nous (infra négligeable ; Protomaps = stockage seul) |
| **Préconfiguré + clé client** | MapTiler, Mapbox, Stadia, Bing | free tier puis facturé | **le client** (son compte fournisseur) |
| **Premium haute résolution** | Esri World Imagery premium, **Maxar / Planet** | élevé (abonnement/surface) | add-on payant répercuté (ENT) |
| **Auto-hébergé / propre** | OpenMapTiles self-hosted, imagerie drone/satellite du client (MBTiles/PMTiles) | coût infra du client | le client (souveraineté) |

**Décision prise — Fournisseur premium de référence : Planet (add-on) + Sentinel Hub (socle radar gratuit).**

| Couche | Fournisseur | Coût pour nous | Coût pour le client | Offline |
|---|---|---|---|---|
| Socle satellite libre | EOX Sentinel-2 cloudless | **0 €** (données libres) | 0 € | ✅ via cache |
| Socle radar (zones tropicales) | **Sentinel Hub** (Sentinel-1) | **0 €** (données Copernicus) | 0 € sur le socle ; API avancée en BYO clé | ❌ (online only en socle) |
| Plan vecteur par défaut | OpenFreeMap / Protomaps | **0 €** (~0 € de bande passante) | 0 € | ✅ PMTiles |
| Haute résolution (≤ 1 m) | **Planet** (SkySat/Scope) | Négociable (volume) | **Add-on** : au coût Planet + marge, ou BYO clé client | via cache (selon CGU) |
| ONG forêts (gratuit) | Planet via **NICFI** | **0 €** | 0 € pour ONG éligibles | via cache |

**Stratégie** : le **défaut est gratuit et sans clé** (adoption immédiate, marge protégée). Le radar Sentinel-1 est intégré gratuitement en complément du satellite optique (essentiel pour les zones tropicales — foresterie/agriculture). Planet est l'add-on premium de référence, avec le programme **NICFI** (gratuit pour ONG forêts) comme levier d'adoption. Le client peut aussi BYO sa propre clé Planet ou tout autre fournisseur. Voir la matrice complète dans [08_GIS §2b](08_GIS.md).

La génération de cartes offline est limitée par plan (surface × zoom).

## 6. Unit economics & marge (interne)

- **Coût variable dominant par organisation** : stockage médias + IA + tuiles. Objectif : que chaque plan couvre son coût variable avec une marge brute > 70 % hors gros comptes.
- **Suivi obligatoire** (dès la V1, table `ai_jobs` pour l'IA — [10_DATABASE §4](10_DATABASE.md)) : coût IA/organisation, Go stockés/organisation, égress, vs revenu (ARPA). Ces métriques recalibrent quotas et prix.
- **Leviers de marge** : prompt caching et modèle Haiku pour les tâches courtes ([07_AI §4](07_AI.md)), compression média, purge, quotas, batch pour le contrôle qualité.

> **À trancher avant lancement commercial** : le fournisseur de tuiles satellite (impact direct sur la marge), les seuils exacts de quotas IA/stockage par plan, et la grille de prix de la licence auto-hébergée. Ce document fixe la **structure de coûts** ; les montants se calent sur les coûts réels mesurés en V1.
