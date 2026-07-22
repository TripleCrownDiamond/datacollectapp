# 12 — Roadmap

Découpage par versions. Les IDs renvoient au [catalogue de fonctionnalités](03_FEATURES.md) ; l'ordre de construction interne est détaillé dans [00_GUIDE_AGENT.md §2](00_GUIDE_AGENT.md). Les durées se recalent à la fin de chaque jalon.

> ⚠️ **Réalité d'exécution (solo, vibecode assisté par IA).** Le projet est construit par **une seule personne**. Les durées ci-dessous supposaient une petite équipe : **en solo, compter ~2× à 3×**. La contrainte n'est pas la technique mais le temps. Deux règles ([24_RISQUES_ET_LACUNES](24_RISQUES_ET_LACUNES.md)) : (1) **livrer d'abord le V0 « Socle fiable »** avant toute fonctionnalité différenciante ; (2) le **cœur sensible** (sync, auth, crypto) se **spécifie et se teste**, il ne se vibecode pas à l'aveugle. Et **avant de coder** : 10–15 entretiens de découverte terrain.

## Version 0 — « Socle fiable » (le vrai premier jalon)

**Objectif : prouver « zéro perte de données en collecte offline » sur UN projet terrain réel.** C'est le MVP défendable ; tout le reste attend.

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| V0-M1 — Fondations | Monorepo, CI (avec scan de secrets + `pnpm audit`), docker-compose/Supabase, `shared` | build/test verts, staging vide |
| V0-M2 — Backend cœur | Auth + RBAC (**tests d'isolation**), orgs, projets, formulaires versionnés, soumissions, attachments par chunks, **moteur de sync** | e2e verts ; **tests d'injection de pannes** sur la sync ([09 §6](09_ARCHITECTURE.md)) |
| V0-M3 — Form-engine (parallèle) | Types de base, logique conditionnelle, calculs, validation | couverture complète ; parité aperçu web |
| V0-M4 — Web | Auth, projets, **builder manuel** + aperçu, table soumissions, carte points, export CSV/GeoJSON | un formulaire de 20 questions se crée et se publie |
| V0-M5 — Mobile | Auth offline, téléchargement projets, saisie + GPS + photo, brouillons résilients, file de sync | **parcours complet en mode avion + kill de l'app** (critères 1 et 2 du [PRD §8](02_PRD.md)) |
| V0-M6 — Pilote | Consentement simple + marquage champs sensibles ([25](25_ETHIQUE_CONSENTEMENT.md)), quick-wins sécurité ([26 §5](26_SECURITE_MODELE_MENACE.md)), i18n FR/EN | **1 vrai projet terrain** en production, retours collectés |

**Sortie V0 :** le socle est prouvé fiable sur le terrain. C'est le fondement non négociable ; on n'ajoute rien tant qu'il n'est pas solide.

## Version 1 — Différenciateurs « collecter sans risque » (après V0)

**Objectif : une ONG remplace KoboToolbox pour un projet réel.**

> La V0 a déjà livré le socle (backend, form-engine, web, mobile). La V1 s'appuie sur cette base et ajoute les différenciateurs qui ne mettent pas en péril la fiabilité.

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| V1-M1 — IA + .md structuré (2 sem.) | AI-01 (génération de formulaires), parseur .md structuré (FORM-MD-01) + export .md, export XLSForm (FORM-XLS-01) | formulaire généré par IA éditable, formulaire importé depuis .md structuré |
| V1-M2 — Équipe & workflow (2 sem.) | Module de consentement complet (CONSENT-01), workflow approbation/rejet (WEB-05), 8 rôles configurables (PLT-01), multi-projets (PLT-01b), statistiques terrain offline (ANA-01) | rejet + correction + re-sync fonctionnel ; consentement capturé et tracé |
| V1-M3 — Polissage & juridique (3 sem.) | i18n FR/EN, accessibilité, audit log de base (PLT-02a), CGU/confidentialité/DPA, rétention paramétrable, Sentry, docs utilisateur | Bêta privée : 3 organisations pilotes |

**Sortie V1 :** pilotes réels convertis, différenciation IA en place, base juridique prête pour la vente.

> **Comparaison V0 vs V1 :** la V0 (Socle fiable, jalons V0-M1 à V0-M6) est le *prérequis* — collecte offline, sync robuste, builder manuel. La V1 (jalons V1-M1 à V1-M3) ajoute les *différenciateurs* : IA, .md structuré, consentement, rôles, workflow, conformité juridique. On ne commence la V1 qu'une fois la V0 prouvée sur le terrain.

## Version 2 — « SIG pro + qualité + interopérabilité » (~4 mois après V1)

**Objectif : gagner les cas d'usage foresterie/agriculture/M&E exigeants et capter la base Kobo/ODK.**

- SIG : cartes offline (GIS-03), placettes (GIS-04), transects (GIS-05), buffers (GIS-06), géofencing (GIS-07), import/export Shapefile-KML (GIS-09/10), calculs de surface (GIS-11), éditeur de couches (GIS-12), visualisation temps réel équipe (GIS-13), mesures & repositionnement (GIS-14), GPS lignes/polygones (COL-05).
- Qualité & IA terrain : contrôle qualité temps réel (AI-03), doublons (AI-04), **assistant IA de terrain** (AI-09), workflow d'approbation enrichi.
- Formulaires : **import XLSForm + round-trip** (FORM-XLS-02), **édition avancée/expressions** (FORM-XLS-03), **import Word/PDF par IA** (FORM-XLS-04), listes dynamiques/cascades (FORM-02), suggestions IA (AI-02), traduction (AI-05), modèles (WEB-10), résumé IA (AI-06, ANA-05a).
- Interopérabilité : **endpoints OpenRosa** (INTEROP-01) — formList, form.xml, submission — pour capter les utilisateurs ODK/Kobo sans migration immédiate.
- Collecte : vidéo (COL-08), QR (COL-10), scan documents (COL-13), pièces jointes (COL-14), données de référence offline (SYN-07), sync intelligente (SYN-06).
- Plateforme : temps réel web (websockets/SSE), rétention RGPD (PLT-07a).

**Sortie V2 :** conversion des pilotes en payants ; référence sectorielle foresterie ; outil de migration Kobo/ODK.

## Version 3 — « de la donnée à la décision » (~4 mois après V2)

- Analyse : statistiques descriptives complètes (ANA-02), tableaux croisés (ANA-03), **stats avancées — corrélations, régression, ANOVA, séries temporelles** (ANA-04), dashboards personnalisés (WEB-07), rapports planifiés (WEB-09), **exports SPSS/Stata/PDF** (ANA-06).
- IA : chat avec les données (AI-07), rapports IA complets (AI-08, ANA-05b).
- Collecte avancée : NFC (COL-11), OCR (COL-12), dessin/annotation (COL-15).
- SIG : tracking GPS (GIS-08), tuiles vectorielles serveur généralisées.
- Perf & échelle : partitionnement si nécessaire ([10_DATABASE.md §8](10_DATABASE.md)).

## Version Enterprise (chevauche V3, tirée par la demande)

- SSO SAML/OIDC (PLT-05), audit log UI complète (PLT-02b), **API publique + clés à scopes et intégrations Power BI/R/Python** (PLT-03, [11_API §14](11_API.md)), webhooks (PLT-04), Super Administrateur multi-org.
- Auto-hébergement : distribution Docker Compose/Helm, doc d'exploitation, licence (PLT-06).
- Conformité : SQLCipher mobile, antivirus médias, DPA, hébergement régional au choix.

## Version IA+ (continue, après V2)

- Remplissage vocal conversationnel (COL-17b), analyse prédictive et alertes précoces (AI-10), analyse d'images terrain (comptage/mesure — exploration), positionnement assisté avancé ([15_INNOVATIONS.md](15_INNOVATIONS.md)).

## Risques principaux et parades

| Risque | Impact | Parade |
|---|---|---|
| Sync défaillante sur terrain réel | Perte de confiance fatale | Tests d'injection de pannes dès M2 ; pilotes précoces en conditions réelles ; télémétrie de sync |
| Qualité des formulaires générés par IA décevante | Différenciateur affaibli | Évals continues ([07_AI.md §5](07_AI.md)) ; l'édition manuelle reste excellente sans IA |
| Coûts de tuiles satellite | Marge / fonctionnalité clé | Décision fournisseur avant M4 ; fallback OSM ; quotas par plan |
| Périmètre V1 qui gonfle | Retard du MVP | Toute addition passe par un arbitrage PRD documenté ; « Won't V1 » ferme |
| App stores (délais de review) | Retards mobiles | EAS + OTA pour le JS ; builds natifs rares et anticipés |
