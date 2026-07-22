# 08 — SIG (Système d'Information Géographique)

Spécification des fonctionnalités géospatiales. Fondations : **PostGIS** (serveur, SRID 4326, calculs métriques via geography ou reprojection UTM locale), **MapLibre GL JS** (web), **MapLibre React Native** (mobile), **Turf.js** (calculs légers côté client, partagés dans `packages/shared/geo`). Aucun composant sous licence Esri/Google requis : par défaut, fonds **sans clé API** (plan vecteur OSM, satellite libre EOX Sentinel-2 cloudless, relief AWS Terrain), avec un **registre de fournisseurs configurable** permettant d'ajouter des fournisseurs premium (clé du client) ou des sources personnalisées — voir [§2b](#2b-fonds-de-carte--fournisseurs-de-tuiles-du-gratuit-au-premium).

## 1. Types de données géographiques

| Type | Usage | Stockage |
|---|---|---|
| Point | réponse GPS d'une question, position de soumission | réponse dans `data` JSON + colonne `geom` dénormalisée sur `submissions` (1er point) |
| LineString | transects, traces de parcours, réponses « ligne » (V2) | `geo_features` |
| Polygon | parcelles, zones de projet, géofences, réponses « polygone » (V2) | `geo_features` |
| Couches de référence | fichiers importés (villages, routes, limites admin.) | `geo_features` groupées par `layer` |

Toutes les géométries transitent en **GeoJSON** dans l'API et sont stockées en `geometry(Geometry, 4326)` avec index GiST ([10_DATABASE.md](10_DATABASE.md)).

## 2. Fonctionnalités

### GIS-01/02 — Cartes de base (V1)
Carte web et mobile : fonds OSM / satellite / terrain (sélecteur), points de soumissions avec clustering, couleur par statut ou formulaire, filtres, popup → détail. Échelle, position courante, recherche de lieu (geocoding Nominatim, online only). Affichage superposé de toutes les couches du projet : plantations, parcelles, placettes, transects, buffers, points GPS, itinéraires.

### GIS-13 — Visualisation temps réel de l'équipe (V2)
Sur la carte, l'utilisateur voit **en temps réel** (selon ses permissions) : ses propres collectes **et celles des autres membres** du projet, les **superpositions** de géométries, les **doublons potentiels** (points très proches — voir AI-04) et les **erreurs de géolocalisation** signalées (points aberrants, hors zone). Codage visuel dédié (couleur/icône) et filtres par membre. Sur mobile, la vue des autres membres suppose une synchronisation récente (dégradable hors ligne : dernières positions connues).

### GIS-14 — Mesures et manipulation interactives (V2)
Outils de carte (web et mobile) : **dessiner** des points, lignes, polygones, **placettes circulaires et carrées** ; créer **automatiquement des buffers** ; **mesurer** distances et surfaces à la volée ; **calculer automatiquement les superficies** (injectées comme réponses — GIS-11). En cas d'erreur détectée (placette hors parcelle, point aberrant), le système **propose automatiquement un meilleur positionnement** (recentrage dans le polygone, accroche à la géométrie de référence) que l'utilisateur accepte ou ajuste.

### GIS-03 — Cartes offline (V2)
Côté web : définition d'une zone (rectangle/polygone) + niveaux de zoom → job serveur de préparation d'un paquet **PMTiles** (raster satellite et/ou vecteur OSM) avec taille estimée avant génération. Côté mobile : téléchargement du paquet par projet, gestion dans Paramètres (taille, suppression), utilisation transparente hors ligne par MapLibre. Limites par plan (surface × zoom).

### GIS-04 — Placettes (V2)
Outil web sur un polygone de référence (parcelle importée ou dessinée) :
- **Grille systématique** : maille (ex. 100 m × 100 m), point de départ, orientation.
- **Aléatoire** : n placettes, distance minimale entre placettes.
- Forme : cercle (rayon paramétrable, ex. 20 m) ou carré (côté).
- Contrainte : placettes entièrement incluses dans le polygone (`ST_Contains` sur le buffer de la placette) — les placettes en bord sont repositionnées ou signalées.
Chaque placette = `geo_feature` (centre + géométrie générée + numéro). Assignation à des collecteurs ; au mobile : liste + carte, **navigation vers la placette** (cap, distance, alerte d'arrivée < seuil), statut (à faire / en cours / faite) lié aux soumissions qui la référencent (`plot_id` injecté dans la soumission).

### GIS-05 — Transects (V2)
Lignes dessinées ou importées (GPX) ; points d'arrêt générés à intervalle régulier (ex. tous les 200 m) ; au mobile : suivi de progression le long du transect, écart latéral affiché, soumission rattachée au point d'arrêt.

### GIS-06 — Buffers (V2)
Création de zones tampons (distance paramétrable) autour de points/lignes/polygones (`ST_Buffer` sur geography). Usages : zones d'exclusion, aires d'influence, contrôle « la mesure est-elle à moins de X m du point de référence ».

### GIS-07 — Géofencing (V2)
Zones autorisées/interdites par formulaire (polygones). Au mobile, à la capture GPS : vérification d'inclusion (Turf, hors ligne) → selon config : avertissement, justification obligatoire, ou blocage. Cas d'usage clé (foresterie) : **vérifier que chaque placette mesurée est bien dans la plantation** ; signalement côté web des soumissions hors zone (flag qualité).

### GIS-08 — Tracking GPS (V3)
Enregistrement opt-in du parcours des collecteurs pendant les sessions de collecte (intervalle configurable, batterie maîtrisée), replay sur carte web. **RGPD** : activation explicite par le collecteur, visibilité limitée aux admins du projet, rétention courte configurable.

### GIS-09/10 — Import / Export (V1–V2)
- **Import (V2)** : GeoJSON, Shapefile (zip), KML, GPX → couche de projet nommée (parsing serveur : gdal/ogr2ogr en job asynchrone, reprojection auto vers 4326, rapport d'erreurs). Limite de taille et de nombre d'entités par plan.
- **Export** : GeoJSON (V1) ; Shapefile, KML (V2). L'export des soumissions joint les réponses aplaties comme propriétés des entités.

### GIS-11 — Calculs automatiques (V2)
Fonctions disponibles dans les formules `calculate` du form-engine : `area(polygon)` (m²/ha), `perimeter`, `distance(a, b)`, `length(line)` — calculées hors ligne (Turf) et recalculées/validées côté serveur (PostGIS) à la sync. Altitude : valeur GPS brute V1.

### GIS-12 — Éditeur de couches web (V2)
Dessin/édition de points, lignes, polygones sur la carte web (mapbox-gl-draw compatible MapLibre), attributs simples, sauvegarde en `geo_features`.

## 2b. Fonds de carte : fournisseurs de tuiles (du gratuit au premium)

MapLibre accepte **n'importe quelle source de tuiles** (XYZ raster, WMTS, style vectoriel MVT). On construit un **registre de fournisseurs configurable par déploiement** (`map_providers`) : chaque déploiement/organisation choisit ses fonds parmi une liste, avec trois modes d'accès — **(a) sans clé**, **(b) préconfiguré + clé collée par l'admin**, **(c) URL/API custom (BYO)**.

### Matrice des fournisseurs (indicatif — vérifier les CGU commerciales avant prod)

| Palier | Fournisseur / techno | Type | Clé API | Rés. / fraîcheur | Offline | Notes |
|---|---|---|---|---|---|---|
| **Gratuit, sans clé** | **OpenFreeMap** | vecteur (rues/plan) | ❌ | vecteur OSM | via style | hébergé, gratuit, sans quota strict ; alternative à OSM raster pour la prod |
| | **Protomaps / PMTiles** (auto-hébergé) | vecteur | ❌ | vecteur OSM | ✅ natif (1 fichier) | **recommandé pour l'offline** : planète OSM en un `.pmtiles`, coût = stockage, zéro appel par tuile |
| | **VersaTiles** | vecteur | ❌ | vecteur OSM | via style | open source, auto-hébergeable |
| | **EOX Sentinel-2 cloudless** | WMTS satellite | ❌ | ~10 m, mosaïque annuelle | via cache | satellite libre sans clé, idéal fond satellite par défaut |
| | **NASA GIBS** | WMTS satellite | ❌ | quotidien, rés. moyenne | via cache | imagerie récente libre (suivi environnemental) |
| | **AWS Terrain Tiles** (Terrarium) | raster relief/altitude | ❌ | mondial | via cache | ombrage/relief et altitude, open data |
| | OSM raster (`tile.openstreetmap.org`) | raster plan | ❌ | plan OSM | ❌ (interdit) | **usage lourd/commercial interdit par la CGU** → dev/démo seulement |
| **Gratuit avec clé (préconfiguré, plan gratuit)** | **MapTiler** | vecteur + satellite | ✅ | satellite ~1–15 m | ✅ (payant) | free tier généreux ; satellite + vecteur en un seul fournisseur |
| | **Stadia Maps** | vecteur | ✅ | plan/relief | via style | free tier ; styles soignés |
| | **Thunderforest** | raster | ✅ | outdoor/cyclo/paysage | via cache | utile foresterie/terrain |
| | **Mapbox** | vecteur + satellite | ✅ (token) | satellite haute rés | ✅ (CGU) | free tier ; au-delà, payant (voir premium) |
| | **Bing Maps** | raster satellite | ✅ | satellite | selon CGU | free tier limité |
| **Payant (haute valeur)** | **Mapbox / MapTiler** au-delà du free tier | vecteur + satellite | ✅ | haute rés | ✅ | facturation à la requête/MAU |
| | **Esri ArcGIS World Imagery** (premium) | raster satellite | ✅ | haute rés | selon CGU | écosystème Esri |
| | **Google Maps** | raster/vecteur | ✅ | très bon | ❌ (offline restreint) | cher, CGU restrictives sur le cache offline |
| | **Planet** (recommandé) | satellite VHR | ✅ | 50 cm (SkySat) / 3,7 m (Scope) | après cache | revisite quotidienne → trouées nuages zones tropicales ; **programme NICFI** gratuit pour ONG forêts (mosaïque mensuelle) |
| | **Maxar** | satellite VHR | ✅ | ≤ 30 cm | après cache | résolution maximale, coût élevé, pas de programme ONG — alternative premium pour besoins ponctuels |
| | **Airbus OneAtlas** | satellite VHR | ✅ | 50 cm | après cache | bonne couverture, programme ONG restreint — alternative |
| **Socle radar gratuit (intégré défaut)** | **Sentinel Hub** (Sinergise) | radar (S-1) + optique (S-2) | ❌ (données libres) | 10 m (S-2) / radar S-1 | **Indispensable zones tropicales** : le radar Sentinel-1 traverse les nuages. API OGC/WMS compatible MapLibre. Intégré par défaut comme couche complémentaire. |
| **Auto-hébergé / propre** | OpenMapTiles, TileServer GL | vecteur | ❌ | vecteur OSM | ✅ | pile self-hosted (souveraineté) |
| | Imagerie du client (drone, satellite acheté) | raster (MBTiles/PMTiles/COG) | ❌ | selon source | ✅ | import de fonds propriétaires du client |

### Configuration (`map_providers`)

Chaque entrée : `id`, `label`, `kind` (`raster`|`wmts`|`vector_style`), `urlTemplate` ou `styleUrl`, `apiKey?` (chiffrée, jamais exposée au client mobile — proxifiée par l'API si nécessaire), `attribution`, `minZoom`/`maxZoom`, `license`/`termsUrl`, `default` (booléen). Trois modes :

- **(a) Sans clé** — activés par défaut : plan vecteur (OpenFreeMap/Protomaps), satellite (EOX Sentinel-2 cloudless), relief (AWS Terrain). Prise en main immédiate, zéro configuration, zéro coût par requête.
- **(b) Préconfiguré + clé** — le fournisseur est déjà décrit (URL, attribution, CGU) ; l'admin **colle sa propre clé** dans les paramètres de l'organisation pour l'activer (MapTiler, Mapbox, Stadia…). Le coût est porté par le client via son propre compte fournisseur.
- **(c) API/URL custom (BYO)** — l'admin ajoute **n'importe quelle** source XYZ/WMTS/style JSON (serveur interne, fournisseur régional, imagerie propre). Souveraineté et flexibilité totales.

### Offline (cartes terrain)

Découplé du fournisseur en ligne : les zones offline ([GIS-03](#gis-03--cartes-offline-v2)) sont préparées en **PMTiles** (recommandé : un fichier, portable, servi localement par MapLibre) ou MBTiles, depuis une source dont la CGU autorise le cache (OSM/EOX/Terrain, imagerie du client). Les fournisseurs à CGU restrictives (Google, certains Esri/Mapbox) ne sont pas mis en cache offline.

### Impact coûts

Détail et arbitrage dans [23_COUTS §5](23_COUTS.md). Résumé :

- **Défaut sans clé = 0 € par requête** : OpenFreeMap (plan), EOX Sentinel-2 cloudless (satellite), AWS Terrain (relief).
- **Socle radar gratuit** : Sentinel Hub (Sentinel-1) intégré par défaut — traverse les nuages, indispensable zones tropicales.
- **Add-on premium** : **Planet** (SkySat/Scope) comme fournisseur premium de référence — programme NICFI gratuit pour ONG forêts, ou BYO clé client.
- Les fonds premium sont soit sur la **clé du client** (mode b), soit un **add-on payant** répercuté.
- Génération de cartes offline limitée par plan (surface × zoom).

Voir la matrice complète en [tableau §2b](#2b-fonds-de-carte--fournisseurs-de-tuiles-du-gratuit-au-premium).

## 3. Performance

- Carte web : clustering serveur au-delà de 50 000 points — endpoint de tuiles vectorielles `GET /projects/:id/tiles/:z/:x/:y.mvt` (`ST_AsMVT`, V2) ; V1 : GeoJSON paginé + clustering client (supercluster) jusqu'à 50 000.
- Index GiST sur toutes les colonnes géométriques ; requêtes spatiales avec bbox systématique.
- Mobile : sources GeoJSON locales générées depuis SQLite ; rendu fluide jusqu'à 5 000 entités locales.

## 4. Tests

- Unitaires (Turf partagé) : génération de placettes (grille/aléatoire, inclusion), inclusion géofence, calculs de surface (tolérance vs valeurs PostGIS de référence < 0,5 %).
- Intégration API : import Shapefile/GeoJSON de fixtures (y compris géométries invalides → rapport d'erreurs propre), exports réimportables dans QGIS sans avertissement.
- E2E : parcours placettes — import parcelle, génération de 20 placettes, assignation, collecte mobile simulée dans/hors placette, flags géofence corrects.
