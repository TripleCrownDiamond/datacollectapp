# 19 — Plateforme d'analyse & rapports IA

Ce document couvre deux capacités liées : l'**analyse statistique** intégrée à la plateforme web, et les **rapports IA**. Principe cardinal ([07_AI §3](07_AI.md), [17_PRINCIPES_CONCEPTION P7](17_PRINCIPES_CONCEPTION.md)) : **tous les chiffres présentés proviennent d'un calcul déterministe vérifiable** ; l'IA interprète et rédige, elle ne calcule jamais un résultat statistique elle-même.

## 1. Analyse descriptive et exploratoire

Disponible dans l'onglet « Analyse » de chaque projet (web).

| Capacité | Description | Version |
|---|---|---|
| Statistiques descriptives | n, moyenne, médiane, mode, écart-type, min/max, quartiles, distribution par question | V1 (basique) / V3 (complet) |
| Tableaux croisés | croisement de deux variables (comptages, %, moyennes), avec filtres | V3 |
| Graphiques | barres, camembert, histogramme, courbes, nuage de points, boîtes à moustaches | V1 (basique) / V3 |
| Cartes interactives | exploration spatiale, filtres croisés carte ↔ table | V1–V2 ([08_GIS](08_GIS.md)) |
| Séries temporelles | évolution d'indicateurs dans le temps, agrégation par jour/semaine/mois | V3 |
| Tableaux de bord personnalisables | widgets configurables, filtres partagés, partage par lien | V3 (WEB-07) |

## 2. Analyse statistique avancée

| Méthode | Usage | Version |
|---|---|---|
| Corrélations | matrice de corrélation (Pearson/Spearman) entre variables numériques | V3 |
| Régression linéaire | simple et multiple, coefficients, R², p-values, diagnostics | V3 |
| ANOVA | comparaison de moyennes entre groupes (one-way, two-way) | V3 |
| Statistiques descriptives par groupe | agrégats segmentés (par village, par enquêteur, par période) | V3 |
| **ACP & clustering** (ANA-07) | analyse en composantes principales, partitionnement (k-means/hiérarchique) — typologies de ménages, de parcelles | V3+ |

**Architecture de calcul.** Les statistiques descriptives simples sont calculées en SQL (PostgreSQL, y compris fonctions d'agrégation et fenêtrage). Les analyses avancées (régression, ANOVA, corrélations) sont exécutées par un **moteur statistique serveur** dédié — job asynchrone ([09_ARCHITECTURE §4](09_ARCHITECTURE.md)) s'appuyant sur une bibliothèque éprouvée (option privilégiée : microservice Python `scipy`/`statsmodels`/`pandas` appelé par l'API ; alternative : bibliothèque JS pour les cas simples). Chaque résultat expose sa **méthode, ses hypothèses et ses limites** ; jamais de conclusion sans les diagnostics associés.

**Honnêteté statistique (garde-fous).**
- Toujours afficher `n` et signaler les échantillons trop petits.
- Ne jamais présenter une corrélation comme une causalité (mention explicite).
- Signaler les valeurs manquantes et la façon dont elles sont traitées.
- Les p-values et intervalles de confiance sont accompagnés d'un avertissement d'interprétation.

## 3. Rapports IA

À partir des données collectées (et des analyses ci-dessus), l'IA produit des documents structurés. Elle **assemble et rédige** ; les chiffres, tableaux et graphiques viennent des calculs déterministes (§1–2).

| Type de rapport | Contenu |
|---|---|
| Résumé exécutif | synthèse en 1 page : chiffres clés, faits saillants, alertes |
| Principaux indicateurs | tableau d'indicateurs suivis avec évolution |
| Interprétation des résultats | lecture en langage naturel des analyses, sourcée sur les chiffres |
| Recommandations | pistes d'action, explicitement identifiées comme suggestions IA |
| Rapport technique | document complet : méthodologie, résultats, annexes |
| Rapport scientifique (v1) | structure académique (intro, méthodes, résultats, discussion) — brouillon à retravailler |
| Rapport de mission | compte rendu terrain : couverture, difficultés, qualité des données |

**Règles.** Tout rapport IA : (a) marque clairement les passages générés par IA ; (b) cite les chiffres avec leur source (requête/analyse) ; (c) est un **brouillon** soumis à relecture humaine avant tout partage externe ; (d) exportable en Markdown → PDF/DOCX ([anthropic-skills docx/pdf] côté génération de fichiers). Voir cas d'usage AI-06/AI-08 dans [07_AI](07_AI.md).

## 4. Chat avec les données

Question en langage naturel → réponse chiffrée + graphique. Architecture **text-to-SQL contraint** détaillée dans [07_AI §2 (AI-07)](07_AI.md) : le LLM génère une requête sur des **vues en lecture seule**, exécutée avec un rôle SQL restreint (SELECT, timeout, limite de lignes) ; les chiffres viennent de l'exécution, jamais du modèle ; la requête reste inspectable. (V3)

## 5. Ouverture & intégrations (P10)

La plateforme est **ouverte** : toute donnée analysable l'est aussi via API et exports, pour brancher les outils existants du client.

| Outil / format | Voie | Version |
|---|---|---|
| CSV, XLSX, GeoJSON | export direct ([11_API §12](11_API.md)) | V1 |
| SPSS (.sav), Stata (.dta) | export avec métadonnées (labels de variables et de valeurs) | V3 |
| PDF | rapports et dashboards | V3 |
| QGIS / ArcGIS | GeoJSON (V1), Shapefile/KML (V2) réimportables sans avertissement | V1–V2 ([08_GIS](08_GIS.md)) |
| Power BI | connecteur via l'API REST / export planifié | ENT |
| R, Python | accès via l'**API publique** (clés à scopes) + packages d'exemple documentés | ENT ([11_API §14](11_API.md)) |
| Webhooks | notification de nouvelle donnée vers un système tiers | ENT |

Les métadonnées de formulaire (labels, types, listes de choix) sont exposées avec les données pour que les outils tiers reconstruisent les variables correctement (essentiel pour SPSS/Stata/R).

## 6. Tests

- Validation des calculs statistiques contre des jeux de référence (résultats connus de `scipy`/R) — tolérance numérique définie.
- Rapports IA : vérifier qu'aucun chiffre présenté n'est absent de la couche de calcul (traçabilité), et que les sorties invalides sont rejetées ([07_AI §3](07_AI.md)).
- Exports SPSS/Stata : réouverture dans le logiciel cible avec labels corrects (test manuel documenté + fixtures).
