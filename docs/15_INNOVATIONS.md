# 15 — Innovations

Innovations différenciantes, avec faisabilité et version cible. Une « innovation » n'entre en développement que lorsqu'elle est spécifiée dans le document de son domaine ([07_AI.md](07_AI.md), [08_GIS.md](08_GIS.md)…) — cette page est la vue stratégique.

## 1. IA

| Innovation | Description | Faisabilité | Version |
|---|---|---|---|
| Création de formulaires en langage naturel | Description → formulaire complet éditable (types, logique, contraintes, multilingue). Personne ne l'offre nativement. | ✅ Éprouvée (LLM + sortie structurée validée) | V1 |
| Copilote de formulaire | Suggestions continues dans le builder : questions manquantes, contraintes, ambiguïtés, traductions | ✅ | V2 |
| Contrôle qualité automatique | Règles statistiques + analyse sémantique LLM sur chaque lot synchronisé ; file « à vérifier » priorisée | ✅ (hybride déterministe/LLM) | V2 |
| Détection des incohérences | Croisements sémantiques entre réponses (âge/profession, surfaces/rendements) | ✅ | V2 |
| Traduction instantanée | Formulaires multilingues en un clic, structure préservée | ✅ | V2 |
| Chat avec les données | Question en français → SQL contraint sur vues read-only → chiffres exacts + graphique | ✅ avec garde-fous stricts (jamais de chiffre LLM) | V3 |
| Rapports bailleurs automatiques | Modèle + données → rapport structuré, narratif IA identifié, relecture humaine | ✅ | V3 |

## 2. SIG

| Innovation | Description | Faisabilité | Version |
|---|---|---|---|
| Placettes intelligentes | Génération grille/aléatoire dans une parcelle, navigation guidée, statut lié aux soumissions | ✅ (PostGIS + Turf) | V2 |
| Vérification placette-dans-plantation | Géofencing spécifique foresterie : chaque mesure vérifiée dans le polygone cible, hors ligne | ✅ | V2 |
| Détection d'erreurs GPS | Croisement précision/vitesse/saut de position ; flag automatique des points suspects (mock location incluse) | ✅ règles + heuristiques | V2 |
| Positionnement assisté | Guidage temps réel vers un point cible (cap, distance, vibration à l'approche) | ✅ | V2 (avec placettes) |
| Calcul automatique des surfaces | Marche du périmètre ou pointage carte → surface/périmètre injectés dans le formulaire | ✅ | V2 |
| Vue satellite en direct | Imagerie récente (fournisseur payant type Planet) en couche optionnelle | ⚠️ coût élevé — option ENT, à valider par la demande | ENT |

## 3. Terrain

| Innovation | Description | Faisabilité | Version |
|---|---|---|---|
| Hors connexion total | Auth, formulaires, logique, cartes, référentiels : 30 jours sans réseau | ✅ cœur de l'architecture | V1 |
| Synchronisation intelligente | Priorisation données/médias, wifi-only, reprise par chunks, zéro doublon | ✅ | V1–V2 |
| Remplissage vocal | Dictée native (V1) puis conversation IA → champs remplis et confirmés un à un | ✅ / ⚠️ IA vocale : latence et coût à valider | V1 / IA+ |
| Assistant vocal enquêteur | Aide contextuelle mains-libres pendant la collecte (online) | ⚠️ dépend du remplissage vocal | IA+ |
| Alertes automatiques | Seuils configurables (valeur critique collectée → notification admin) ; géofence sortie de zone | ✅ | V2 |

## 4. Analyse

| Innovation | Description | Faisabilité | Version |
|---|---|---|---|
| Dashboards automatiques | Générés depuis le schéma du formulaire, sans configuration | ✅ | V1 (basique) / V3 (personnalisable) |
| Cartes interactives natives | Exploration spatiale sans QGIS : filtres croisés carte/table | ✅ | V1–V2 |
| Recommandations | Suggestions d'action sur les flags qualité et la couverture d'échantillonnage | ⚠️ pertinence à prouver par itérations | IA+ |
| Prédictions | Tendances et alertes précoces inter-périodes (rendements, indicateurs) | ⚠️ exige volume de données ; commencer par des stats simples honnêtes | IA+ |
| Analyse d'images terrain | Comptage/mesure sur photos (arbres, stocks…) via modèles de vision | ⚠️ exploratoire, forte valeur foresterie | IA+ |

## Doctrine

1. **L'innovation ne précède jamais la fiabilité** : rien ne passe avant « zéro perte de données » (V1).
2. **IA = accélérateur vérifiable** : chaque sortie IA est identifiée, traçable, et validée par un humain ou un calcul déterministe.
3. **Les ⚠️ font l'objet d'un spike time-boxé** (prototype + décision documentée en ADR) avant tout engagement roadmap.
