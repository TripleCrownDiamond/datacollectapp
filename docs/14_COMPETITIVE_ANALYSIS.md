# 14 — Analyse concurrentielle

Analyse des 8 solutions dominantes de collecte de données terrain. Synthèse stratégique en fin de document. (État du marché : début 2026 — à rafraîchir semestriellement.)

## 1. KoboToolbox

Référence du secteur humanitaire/ONG, open source, gratuit (financé par dons), basé sur l'écosystème ODK/XLSForm.

- **Avantages** : gratuit, très répandu (standard de fait des ONG), robuste offline, communauté énorme, formulaires XLSForm puissants, hébergement humanitaire (serveurs UNOCHA/KoboToolbox).
- **Inconvénients** : UX web et mobile datées, form builder limité (le sérieux passe par Excel/XLSForm), SIG minimal (points, affichage basique), analyse quasi inexistante (export → Excel), pas d'IA, performances erratiques sur gros projets.
- **Notre différenciation** : mêmes garanties offline avec une UX moderne, builder IA vs XLSForm, SIG professionnel intégré, analyse native. Cible : leurs utilisateurs frustrés qui n'ont pas le budget Esri.

## 2. ODK Collect (+ ODK Central)

L'infrastructure open source d'origine (dont Kobo dérive) ; très utilisée en recherche et santé publique.

- **Avantages** : extrêmement robuste et éprouvé, standard XLSForm/XForms, self-hosting documenté, communauté technique forte, API propre (Central).
- **Inconvénients** : expérience fragmentée (Collect + Central + XLSForm + pyxform), technique (il faut un profil dev/data), UI utilitaire, SIG limité, aucune analyse ni IA, coût caché en compétences.
- **Notre différenciation** : le tout-en-un qui ne requiert aucun profil technique ; import XLSForm prévu (V2, outil de migration) pour capter leur base installée.

## 3. ArcGIS Survey123

L'outil d'enquête d'Esri, intégré à ArcGIS Online.

- **Avantages** : SIG excellent (écosystème Esri complet), formulaires solides, analyse cartographique puissante, support entreprise.
- **Inconvénients** : coût des licences élevé et complexe (par utilisateur nommé), enfermement dans l'écosystème Esri, courbe d'apprentissage, offline correct mais configuration lourde, inadapté aux budgets ONG.
- **Notre différenciation** : 80 % de leur valeur SIG (placettes, buffers, offline, imports) sans licence Esri ni dépendance ; export standard (GeoJSON/Shapefile) vers QGIS/ArcGIS pour coexister.

## 4. ArcGIS Field Maps

L'app terrain SIG d'Esri (édition de couches, inspection, tracking).

- **Avantages** : édition SIG terrain la plus complète du marché, tracking, cartes offline soignées.
- **Inconvénients** : mêmes coûts/enfermement Esri ; orienté « édition de couches SIG », faible sur les formulaires d'enquête complexes ; réservé aux organisations déjà Esri.
- **Notre différenciation** : nous prenons le problème par l'enquête (formulaires riches) en ajoutant le SIG, là où Field Maps fait l'inverse ; pour les non-clients Esri, il n'est simplement pas une option.

## 5. CommCare (Dimagi)

Plateforme de collecte orientée programmes de santé (case management).

- **Avantages** : gestion de cas/bénéficiaires dans la durée (suivi longitudinal), robuste offline, éprouvé à très grande échelle en santé mobile.
- **Inconvénients** : complexe (concepts de case management omniprésents), UX chargée, tarification opaque et vite coûteuse, SIG faible, builder daté.
- **Notre différenciation** : simplicité pour les cas généraux ; notre gestion de données de référence (SYN-07) couvre le suivi simple de bénéficiaires sans imposer le paradigme case management. Le case management complet n'est pas notre bataille (V1–V3).

## 6. Fulcrum

Solution commerciale (SaaS) d'inspection et collecte géolocalisée.

- **Avantages** : bon builder, UX propre, workflows d'inspection, API correcte.
- **Inconvénients** : cher (par utilisateur/mois), SIG moyen (points/lignes simples), pas d'IA significative, peu implanté hors Amérique du Nord, offline parfois fragile.
- **Notre différenciation** : positionnement prix adapté aux ONG/recherche, SIG supérieur (placettes, transects), IA native, hébergement UE.

## 7. QField (+ QFieldCloud)

Compagnon mobile open source de QGIS.

- **Avantages** : puissance SIG inégalée en open source (tout projet QGIS embarquable), offline sérieux, communauté SIG fidèle, gratuit/abordable.
- **Inconvénients** : exige la maîtrise de QGIS (profil SIG obligatoire), formulaires rudimentaires (pas un outil d'enquête), pas de gestion d'équipe/workflow d'enquête, pas d'analyse ni d'IA.
- **Notre différenciation** : l'inverse du même créneau — nous apportons les formulaires/équipes/analyse aux besoins SIG, sans exiger QGIS ; interopérabilité (exports propres vers QGIS) plutôt que concurrence frontale chez les experts SIG.

## 8. Mergin Maps

Alternative à QField (Lutra Consulting), sync de projets QGIS.

- **Avantages** : sync de projets QGIS simple et fiable, versionnage des données, open source, tarifs raisonnables.
- **Inconvénients** : mêmes limites que QField (dépendance QGIS, formulaires faibles, pas d'analyse/IA), écosystème plus petit.
- **Notre différenciation** : identique à QField.

## Synthèse stratégique

| | Formulaires | Offline | SIG | Analyse | IA | UX | Prix ONG |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| KoboToolbox | ●●● | ●●● | ● | ● | — | ● | ●●● |
| ODK | ●●● | ●●● | ● | ● | — | ● | ●●(compétences) |
| Survey123 / Field Maps | ●●● | ●● | ●●● | ●●● | ● | ●● | ● |
| CommCare | ●●● | ●●● | ● | ●● | ● | ● | ● |
| Fulcrum | ●● | ●● | ●● | ●● | ● | ●●● | ● |
| QField / Mergin | ● | ●●● | ●●● | ● | — | ●● | ●●● |
| **TerraCollect (cible)** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** |

**Lecture du marché** : deux mondes qui ne se rejoignent pas — les outils d'enquête (Kobo/ODK/CommCare) sans SIG ni analyse, et les outils SIG (Esri/QField) sans enquête accessible. Personne n'a d'IA native. **Notre pari : occuper l'intersection avec l'IA comme accélérateur, au prix des outils open source.**

**Vecteurs d'adoption** : (1) import XLSForm pour migrer depuis Kobo/ODK sans re-saisie (V2) ; (2) exports GeoJSON/Shapefile irréprochables pour coexister avec QGIS/ArcGIS ; (3) génération IA comme démonstration « wow » en avant-vente.
