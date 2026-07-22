# 03 — Catalogue des fonctionnalités

Catalogue exhaustif, priorisé par version (V1 = MVP, V2, V3, ENT = Enterprise, IA+ = version IA avancée — voir [12_ROADMAP.md](12_ROADMAP.md)). Chaque fonctionnalité implémentée doit référencer son ID.

## 1. Collecte (mobile)

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| COL-01 | Formulaires dynamiques | Rendu de tous les types de questions du form-engine, groupes et sections, questions répétables | V1 |
| COL-02 | Logique conditionnelle | Affichage/masquage en temps réel selon les réponses ; sauts de sections | V1 |
| COL-03 | Validation à la saisie | Contraintes min/max/regex/obligatoire avec messages personnalisés | V1 |
| COL-04 | GPS point | Capture avec précision affichée, seuil minimal configurable, moyenne sur n mesures | V1 |
| COL-05 | GPS trace & polygone | Enregistrement de lignes (parcours) et polygones (parcelles) par marche ou pointage carte | V2 |
| COL-06 | Photos | Capture ou galerie, compression configurable, tampon date/GPS optionnel sur l'image | V1 |
| COL-07 | Audio | Enregistrement avec pause/reprise, limite de durée configurable | V1 |
| COL-08 | Vidéo | Capture avec limite de durée et de résolution | V2 |
| COL-09 | Signature | Tracé au doigt, export PNG | V1 |
| COL-10 | QR / code-barres | Scan comme réponse ; pré-remplissage d'un formulaire depuis un QR | V2 |
| COL-11 | NFC | Lecture de tags NFC (identification d'actifs, badges) | V3 |
| COL-12 | OCR | Extraction de texte depuis photo (documents, plaques, compteurs) | V3 |
| COL-13 | Scan de documents | Détection des bords, redressement, multi-pages → PDF | V2 |
| COL-14 | Pièces jointes | Tout fichier (PDF, etc.) avec limite de taille par projet | V2 |
| COL-15 | Dessin / annotation | Dessin libre et annotation sur photo | V3 |
| COL-16 | Brouillons & reprise | Sauvegarde auto, reprise après crash, brouillons multiples par formulaire | V1 |
| COL-17 | Saisie vocale | Dictée native du clavier (V1) ; remplissage vocal assisté par IA (IA+) | V1 / IA+ |
| CONSENT-01 | Consentement des enquêtés | Écran de consentement multilingue, requis/enregistré, refus = issue valide, traçabilité ([25](25_ETHIQUE_CONSENTEMENT.md)) | V0 (simple) / V1 (complet) |
| CONSENT-02 | Minimisation & champs sensibles | Marquage sensible → exclusion export/IA, chiffrement champ, GPS flou, protections mineurs/santé | V0 (marquage) / V2 |

## 2. Synchronisation & offline

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| SYN-01 | Offline-first complet | Auth locale ≥ 30 j, collecte et logique 100 % hors ligne | V1 |
| SYN-02 | File de synchronisation | Statuts par soumission, envoi auto ou manuel, ordre FIFO | V1 |
| SYN-03 | Reprise sur erreur | Upload des médias par chunks avec reprise ; retry avec backoff exponentiel | V1 |
| SYN-04 | Idempotence | UUID client ; zéro doublon serveur quel que soit le nombre de tentatives | V1 |
| SYN-05 | Sync descendante | Nouvelles versions de formulaires, assignations, rejets, référentiels | V1 |
| SYN-06 | Sync intelligente | Priorisation (données avant médias), fenêtres wifi-only, compression | V2 |
| SYN-07 | Données de référence | Listes externes (villages, bénéficiaires) téléchargées et interrogeables hors ligne | V2 |

## 3. IA

Détail : [07_AI.md](07_AI.md).

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| AI-01 | Génération de formulaires | Description en langage naturel → brouillon de formulaire complet | V1 |
| AI-02 | Amélioration de formulaire | Suggestions : questions manquantes, contraintes, reformulations, traductions | V2 |
| AI-03 | Contrôle qualité | Détection d'anomalies et d'incohérences sur les soumissions entrantes, signalements | V2 |
| AI-04 | Détection de doublons | Similarité multi-champs (noms flous, GPS proches, réponses identiques) | V2 |
| AI-05 | Traduction automatique | Traduction des labels de formulaires ; assistance multilingue | V2 |
| AI-06 | Résumé IA | Synthèse en langage naturel d'un lot de soumissions ou d'une période | V2 |
| AI-07 | Chat avec les données | Questions en langage naturel → réponses chiffrées + graphiques sourcés | V3 |
| AI-08 | Rapports IA | Génération de rapports structurés (bailleurs) à partir d'un modèle + données | V3 |
| AI-09 | Assistant de collecte | Aide contextuelle à l'enquêteur (clarification de questions, exemples) | IA+ |
| AI-10 | Analyse prédictive | Tendances, recommandations d'échantillonnage, alertes précoces | IA+ |

## 4. SIG

Détail : [08_GIS.md](08_GIS.md).

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| GIS-01 | Carte des soumissions | Points sur fond OSM/satellite, clustering, filtres, popup détail | V1 |
| GIS-02 | Fonds de carte multiples & registre de fournisseurs | Plan/satellite/relief ; défaut **sans clé API** ; ajout de fournisseurs à clé (client) ou d'API/URL custom (BYO) | V1 |
| GIS-03 | Cartes offline | Téléchargement de zones (MBTiles/PMTiles) pour usage terrain sans réseau | V2 |
| GIS-04 | Placettes | Génération de placettes (cercle/carré, rayon paramétrable) sur grille ou aléatoire dans un polygone ; navigation vers la placette | V2 |
| GIS-05 | Transects | Définition de lignes de parcours, points d'arrêt réguliers, suivi de progression | V2 |
| GIS-06 | Buffers | Zones tampons autour de points/lignes/polygones, calculs d'inclusion | V2 |
| GIS-07 | Géofencing | Alerte/blocage si la collecte sort d'une zone autorisée ; vérification placette-dans-parcelle | V2 |
| GIS-08 | Tracking GPS | Trace des parcours des équipes (opt-in, RGPD), replay sur carte | V3 |
| GIS-09 | Import SIG | Shapefile, GeoJSON, KML, GPX → couches de projet | V2 |
| GIS-10 | Export SIG | GeoJSON (V1), Shapefile, KML (V2) | V1/V2 |
| GIS-11 | Calculs automatiques | Surface, périmètre, distance, altitude ; injectés comme réponses calculées | V2 |
| GIS-12 | Éditeur de couches web | Dessin et édition de polygones/lignes/points de référence côté web | V2 |
| GIS-13 | Visualisation temps réel équipe | Voir ses collectes et celles des autres membres, superpositions, doublons, erreurs de géolocalisation | V2 |
| GIS-14 | Mesures & manipulation | Dessin, mesure de distances/surfaces, buffers auto, repositionnement assisté | V2 |
| GIS-15 | Intégration Planet/NICFI | Fond satellite haute résolution Planet (SkySat/Scope) en add-on. Programme NICFI gratuit pour ONG forêts (mosaïque mensuelle). Radar Sentinel-1 via Sentinel Hub intégré par défaut en socle gratuit | V2 |

## 5. Web — gestion & analyse

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| WEB-01 | Form builder drag & drop | Édition visuelle, aperçu live fidèle mobile, i18n des labels | V1 |
| WEB-02 | Versionnement de formulaires | Publication immuable, historique, diff entre versions | V1 |
| WEB-03 | Gestion des équipes | Invitations, rôles, assignations par formulaire | V1 |
| WEB-04 | Table des soumissions | Tri, filtres, recherche, pagination serveur, vue détail | V1 |
| WEB-05 | Workflow d'approbation | Approbation/rejet avec motif, boucle de correction vers le mobile | V1 |
| WEB-06 | Dashboard projet | Compteurs, courbes temporelles, répartitions par question | V1 |
| WEB-07 | Dashboards personnalisés | Widgets configurables, filtres croisés, partage par lien | V3 |
| WEB-08 | Exports | CSV, XLSX, GeoJSON (V1) ; SPSS, Stata, PDF (V3) ; API d'export (ENT) | V1+ |
| WEB-09 | Rapports planifiés | Envoi périodique par email (dashboard PDF, exports) | V3 |
| WEB-10 | Modèles de formulaires | Bibliothèque de modèles sectoriels réutilisables | V2 |

## 6. Moteur de formulaires & XLSForm

Détail : [18_XLSFORM.md](18_XLSFORM.md).

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| FORM-01 | Moteur de calcul instantané | Variables, formules, agrégations (somme, moyenne, min, max, %, indicateurs) mises à jour en temps réel | V1 |
| FORM-02 | Listes dynamiques / cascades | `choice_filter`, listes en cascade (région→commune), select_from_file | V2 |
| FORM-XLS-01 | Export XLSForm | FormSchema → .xlsx conforme, réimportable dans Kobo/ODK | V1 |
| FORM-XLS-02 | Import XLSForm + round-trip | Migration sans perte depuis Kobo/ODK | V2 |
| FORM-XLS-03 | Édition avancée (expressions) | Accès direct relevant/constraint/calculation, vue source | V2 |
| FORM-XLS-04 | Import Word / PDF par IA | Extraction d'un questionnaire depuis .docx/.pdf → brouillon | V2 |
| FORM-MD-01 | Format .md structuré de questionnaire | Import/export d'un questionnaire en Markdown structuré, parse déterministe sans IA. Génération .md par défaut sur le free tier (0 € de coût IA) | V1 |
| INTEROP-01 | Compatibilité OpenRosa | Endpoints `formList`, `form.xml`, `submission` au standard OpenRosa pour interop avec ODK Collect, KoboCollect, Enketo. Soumissions marquées `source: 'openrosa'` | V2 |

## 7. Analyse & rapports

Détail : [19_ANALYSE.md](19_ANALYSE.md).

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| ANA-01 | Statistiques terrain offline | Compteurs et indicateurs métier calculés en temps réel sur mobile, sans réseau | V1 |
| ANA-02 | Statistiques descriptives | n, moyenne, médiane, écart-type, quartiles, distributions | V1/V3 |
| ANA-03 | Tableaux croisés | Croisement de variables, comptages, % | V3 |
| ANA-04 | Stats avancées | Corrélations, régression linéaire, ANOVA, séries temporelles | V3 |
| ANA-05 | Rapports IA | Résumé exécutif, indicateurs, interprétation, recommandations, rapports technique/scientifique/mission | V2/V3 |
| ANA-06 | Exports statistiques | SPSS (.sav), Stata (.dta), PDF avec métadonnées | V3 |

## 8. Plateforme & Enterprise

| ID | Fonctionnalité | Description | Version |
|---|---|---|---|
| PLT-01 | Multi-tenant & RBAC configurable | Organisations isolées, 8 rôles à permissions configurables, rôle affiné par projet | V1 |
| PLT-01b | Multi-projets simultanés (mobile) | Travailler sur plusieurs projets à la fois sans en supprimer aucun | V1 |
| PLT-02 | Audit log | Journal immuable des actions sensibles | V1 (socle) / ENT (UI complète) |
| PLT-03 | API publique | API REST documentée (OpenAPI) avec clés d'API et scopes ; intégrations Power BI/R/Python/QGIS/ArcGIS | ENT |
| PLT-04 | Webhooks | Notifications sortantes (nouvelle soumission, approbation…) | ENT |
| PLT-05 | SSO | SAML / OIDC | ENT |
| PLT-06 | Auto-hébergement | Distribution Docker/Helm, licence Enterprise | ENT |
| PLT-07 | Rétention & RGPD | Politiques de rétention, anonymisation, export/suppression sur demande | V2/ENT |

## Récapitulatif par version

- **V1 (MVP)** : COL-01→04, 06, 07, 09, 16, 17a · SYN-01→05 · AI-01 · GIS-01, 02, 10a · WEB-01→06, 08a · FORM-01, FORM-XLS-01 · ANA-01, 02a · PLT-01, 01b, 02a
- **V2** : COL-05, 08, 10, 13, 14 · SYN-06, 07 · AI-02→06, AI-09 · GIS-03→07, 09, 10b, 11, 12, 13, 14 · WEB-10 · FORM-02, FORM-XLS-02→04 · ANA-05a · PLT-07a
- **V3** : COL-11, 12, 15 · AI-07, 08 · GIS-08 · WEB-07, 08b, 09 · ANA-02b, 03, 04, 05b, 06
- **ENT** : PLT-03→06, 02b, 07b
- **IA+** : AI-10, COL-17b
