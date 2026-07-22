# 01 — Vision

## Vision

Devenir la référence mondiale de la collecte de données terrain en rendant la collecte **aussi simple qu'une conversation** : n'importe quelle organisation décrit son besoin, l'IA construit le formulaire, les équipes collectent hors ligne avec une précision cartographique professionnelle, et les décisions se prennent sur des données propres, analysées automatiquement.

## Mission

Donner aux ONG, chercheurs, entreprises et administrations — en particulier dans les contextes à faible connectivité — des outils de collecte de données modernes, fiables et intelligents, sans expertise technique requise.

Notre objectif n'est **pas** de reproduire KoboToolbox, ODK Collect ou Survey123, mais de concevoir la plateforme de collecte de données **la plus simple, la plus intelligente et la plus performante** pour les agents de terrain, les superviseurs, les chercheurs, les ONG, les entreprises et les administrations.

## La double exigence de chaque fonctionnalité

Toute fonctionnalité du produit doit servir **au moins un** de ces deux buts, sans jamais dégrader l'autre :

1. **réduire le temps de collecte** ;
2. **améliorer automatiquement la qualité des données**.

C'est le filtre appliqué à chaque décision produit. L'**intelligence artificielle n'est pas une fonctionnalité secondaire** : elle accompagne l'utilisateur pendant **toute** la collecte (génération de formulaires, contrôle qualité en temps réel, assistant de terrain) — tout en restant un copilote qui propose sans jamais imposer ([P6](17_PRINCIPES_CONCEPTION.md)).

Ces buts se déclinent en 10 principes de conception non négociables : voir [17_PRINCIPES_CONCEPTION.md](17_PRINCIPES_CONCEPTION.md).

## Valeurs

| Valeur | Traduction concrète |
|---|---|
| **Terrain d'abord** | Chaque décision produit est jugée à l'aune de l'agent de terrain sous la pluie, sans réseau, avec 12 % de batterie |
| **Simplicité radicale** | Prise en main < 15 min ; aucune fonctionnalité ne justifie de complexifier le parcours de collecte |
| **Fiabilité des données** | Aucune donnée collectée ne doit jamais être perdue ; la qualité est contrôlée à la saisie, pas après |
| **Souveraineté** | Les données appartiennent au client : export complet à tout moment, auto-hébergement possible (version Enterprise) |
| **IA utile, jamais imposée** | L'IA accélère et fiabilise ; tout fonctionne sans elle |

## Pourquoi ce produit existe

La collecte de données terrain est dominée par des outils conçus il y a 10–15 ans autour du standard XLSForm. Ils sont robustes mais :

- **la création de formulaires est technique** (Excel + syntaxe XLSForm, ou builders limités) et lente ;
- **l'expérience utilisateur est datée**, la formation des enquêteurs coûte cher ;
- **le SIG est soit rudimentaire** (un point GPS par question) **soit verrouillé** dans l'écosystème Esri à licences coûteuses ;
- **le contrôle qualité est a posteriori** : les erreurs sont découvertes des semaines après, quand le terrain est inaccessible ;
- **l'analyse est externe** : export CSV, puis Excel/R/Power BI — une rupture de chaîne pour les équipes non techniques ;
- **aucune IA native** : pas de génération de formulaires, pas d'assistance à la saisie, pas d'analyse automatique.

## Limites des solutions existantes (synthèse)

Analyse détaillée : [14_COMPETITIVE_ANALYSIS.md](14_COMPETITIVE_ANALYSIS.md).

| Solution | Limite principale |
|---|---|
| KoboToolbox | UX datée, SIG minimal, analyse quasi absente, pas d'IA |
| ODK Collect | Écosystème puissant mais fragmenté et technique (XLSForm, serveur à gérer) |
| Survey123 / ArcGIS Field Maps | Excellent SIG mais coût des licences Esri, écosystème fermé, complexité |
| CommCare | Orienté santé, courbe d'apprentissage forte, tarification opaque |
| Fulcrum | Bon produit mais cher, SIG moyen, pas d'IA native |
| QField / Mergin Maps | Très bon SIG mais requiert la maîtrise de QGIS ; faible sur les formulaires/enquêtes |

**Le créneau vacant : un outil qui combine la robustesse offline d'ODK, le SIG de QField, une UX grand public, et une couche IA native.** Personne ne l'occupe.

## Proposition de valeur

1. **Formulaires en langage naturel** — « Crée-moi un questionnaire d'inventaire forestier avec placettes de 20 m » → formulaire complet, éditable, en 30 secondes.
2. **Offline-first réel** — collecte, cartes satellite et logique de formulaire 100 % fonctionnelles sans réseau ; synchronisation intelligente et reprise sur erreur.
3. **SIG professionnel intégré** — placettes, transects, buffers, géofencing, import/export Shapefile/GeoJSON/KML, sans licence tierce.
4. **Qualité à la source** — validation, détection d'erreurs et de doublons par IA au moment de la saisie.
5. **De la donnée à la décision** — dashboards automatiques, chat avec les données, rapports générés par IA.

## Personas

### 1. Aïcha — Coordinatrice M&E dans une ONG (persona principal)
- Gère 5 projets, 40 enquêteurs, des bailleurs exigeants. Utilise KoboToolbox aujourd'hui.
- **Douleurs** : semaines perdues à créer/tester des formulaires, données sales à nettoyer, rapports manuels.
- **Succès** : créer un formulaire en une heure, données propres à 95 %, rapport bailleur généré en un clic.

### 2. Moussa — Enquêteur / agent de terrain
- Smartphone Android milieu de gamme, zones sans réseau, journées de 8 h de collecte.
- **Douleurs** : apps lentes, pertes de données, ressaisies, GPS imprécis.
- **Succès** : formulaire fluide, jamais de perte, dictée vocale, fin de journée sans reprise de saisie.

### 3. Dr. Keita — Chercheur (agronomie / foresterie)
- Protocoles scientifiques : placettes, transects, mesures répétées, exports vers R/QGIS.
- **Douleurs** : outils d'enquête sans SIG sérieux, outils SIG sans formulaires sérieux ; il en utilise deux.
- **Succès** : un seul outil, placettes générées automatiquement, export GeoJSON/CSV propre.

### 4. Mme Diallo — Directrice de programme / cliente décideuse
- Ne collecte pas ; décide, rapporte aux bailleurs, arbitre les budgets.
- **Douleurs** : aucune visibilité temps réel, dépend d'un analyste pour chaque question.
- **Succès** : dashboard en direct, poser une question en français aux données et obtenir la réponse.

### 5. Ibrahim — Administrateur SI (Enterprise)
- **Douleurs** : conformité (RGPD, souveraineté), gestion des accès, intégrations.
- **Succès** : SSO, rôles fins, audit trail, auto-hébergement ou hébergement régional.

## Cas d'utilisation

1. **Enquêtes socio-économiques** (ONG, administrations) : ménages, marchés, bénéficiaires.
2. **Inventaire forestier et agroforesterie** : placettes, mesures dendrométriques, suivi de plantations, vérification que les placettes restent dans les parcelles.
3. **Suivi agricole** : parcelles (polygones), rendements, intrants, campagnes saisonnières.
4. **Suivi-évaluation de projets** (M&E) : indicateurs, baselines, endlines, échantillonnage.
5. **Santé communautaire** : recensements, campagnes de vaccination, suivi de cohortes.
6. **Inspection et audit** : infrastructures, chantiers, conformité, avec photos géolocalisées horodatées.
7. **Recherche scientifique** : biodiversité, transects d'observation, données environnementales.

## Vision à 5 ans

| Horizon | Ambition |
|---|---|
| An 1 | MVP solide (V1) : collecte offline + form builder IA + carte + dashboard. Premiers projets pilotes ONG/recherche. |
| An 2 | V2 : SIG avancé complet, contrôle qualité IA, exports pro. Traction dans les secteurs foresterie/agriculture/M&E. |
| An 3 | V3 + Enterprise : auto-hébergement, SSO, API publique, marketplace de modèles de formulaires. |
| An 4 | Couche IA prédictive : recommandations d'échantillonnage, détection d'anomalies inter-projets, analyse d'images terrain (comptage, mesures). |
| An 5 | Standard de fait pour la collecte terrain intelligente ; écosystème d'intégrations (Power BI, QGIS, ERP bailleurs) ; communauté de modèles sectoriels. |
