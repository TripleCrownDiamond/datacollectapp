# 16 — Glossaire

Termes utilisés dans le produit et la documentation, expliqués simplement. Destiné aux clients et aux nouveaux arrivants ; les termes marqués 🔧 sont plutôt techniques.

## Termes produit

| Terme | Définition |
|---|---|
| **Organisation** | Votre espace privé sur la plateforme : vos membres, vos projets, vos données. Deux organisations ne voient jamais les données l'une de l'autre. |
| **Projet** | Un ensemble cohérent de collecte : ses formulaires, son équipe, ses cartes, son tableau de bord (ex. « Inventaire forestier 2026 »). |
| **Formulaire** | Le questionnaire que remplissent les équipes terrain : questions, photos, GPS, logique. |
| **Version (de formulaire)** | Photographie figée d'un formulaire au moment de sa publication. Chaque réponse indique la version utilisée — indispensable pour analyser correctement. |
| **Soumission** | Un formulaire rempli une fois par un enquêteur (aussi appelé « réponse » ou « enregistrement »). |
| **Brouillon** | Soumission en cours de saisie, modifiable, sauvegardée automatiquement sur le téléphone. |
| **Finaliser** | Déclarer une soumission terminée : elle est vérifiée puis mise en file d'envoi. |
| **Synchronisation** | Échange automatique entre le téléphone et la plateforme : les soumissions montent, les nouveautés (formulaires, décisions) descendent. |
| **Approbation / Rejet** | Contrôle qualité humain : un responsable valide une soumission ou la renvoie à son auteur avec un motif, pour correction. |
| **Rôles** | **Owner** (propriétaire de l'organisation) · **Admin** (gère équipes et projets) · **Editor** (crée les formulaires, exploite les données) · **Collector** (collecte sur le terrain, ne voit que ses propres soumissions). |
| **Logique conditionnelle** | Règles qui affichent ou masquent des questions selon les réponses précédentes (ex. « Si enceinte = oui, afficher les questions de suivi »). |
| **Contrainte** | Règle de validité d'une réponse (ex. âge entre 0 et 120), vérifiée pendant la saisie. |
| **Groupe répétable** | Bloc de questions répété autant de fois que nécessaire (ex. un bloc par membre du ménage). |
| **Données de référence** | Listes préchargées consultables hors ligne (villages, bénéficiaires, espèces…). |

## Termes cartographiques (SIG)

| Terme | Définition |
|---|---|
| **SIG** | Système d'Information Géographique : tout ce qui touche aux cartes et aux données localisées. |
| **Point / Ligne / Polygone** | Les trois formes de base : un lieu précis / un tracé (piste, transect) / une surface (parcelle, zone). |
| **Fond de carte** | L'image de fond : plan (OSM), satellite ou relief. |
| **Carte offline** | Zone de carte téléchargée à l'avance pour être consultée sans réseau sur le terrain. |
| **Placette** | Petite surface d'échantillonnage (cercle ou carré, ex. rayon 20 m) où l'on effectue des mesures — standard en foresterie et agronomie. |
| **Transect** | Ligne de parcours le long de laquelle on observe ou mesure à intervalles réguliers. |
| **Buffer (zone tampon)** | Zone à une distance donnée autour d'un point, d'une ligne ou d'une surface (ex. « à moins de 500 m de la rivière »). |
| **Géofencing** | Alerte ou blocage quand une collecte se fait hors d'une zone autorisée. |
| **Précision GPS** | Marge d'erreur de la position, en mètres. L'application peut exiger une précision minimale avant d'enregistrer. |
| **GeoJSON / Shapefile / KML / GPX** 🔧 | Formats de fichiers standards pour échanger des données cartographiques avec d'autres logiciels (QGIS, ArcGIS, Google Earth). |

## Termes techniques

| Terme | Définition |
|---|---|
| **Offline-first** 🔧 | Conçu pour fonctionner d'abord sans internet ; la connexion n'est utile que pour synchroniser. |
| **Multi-tenant** 🔧 | Une même plateforme héberge plusieurs organisations avec une isolation totale des données. |
| **Idempotence** 🔧 | Garantie qu'un envoi répété (à cause d'une coupure réseau) ne crée jamais de doublon. |
| **API** 🔧 | Interface qui permet aux applications (et à vos outils, en version Enterprise) de dialoguer avec la plateforme. |
| **Chiffrement** 🔧 | Protection des données : illisibles pour quiconque les intercepte, en transit comme au stockage. |
| **RGPD** | Règlement européen sur la protection des données personnelles ; la plateforme fournit les outils de conformité (export, suppression, rétention). |
| **SSO** 🔧 | Connexion via le compte d'entreprise existant (Google Workspace, Microsoft…) — version Enterprise. |
| **Auto-hébergement** 🔧 | Installation de la plateforme sur vos propres serveurs — version Enterprise. |
| **XLSForm** 🔧 | Format Excel utilisé par KoboToolbox/ODK pour définir des formulaires ; un outil de migration est prévu (V2). |
| **LLM / IA générative** 🔧 | Technologie d'intelligence artificielle utilisée pour générer les formulaires, détecter les incohérences et répondre en langage naturel. Sur cette plateforme, l'IA propose, l'humain valide, et tous les chiffres affichés proviennent de calculs vérifiables. |
