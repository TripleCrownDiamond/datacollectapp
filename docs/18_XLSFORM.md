# 18 — Compatibilité XLSForm

**Objectif : compatibilité XLSForm à 100 %.** L'éditeur doit prendre en charge l'intégralité des fonctionnalités du standard XLSForm, en import comme en export, avec édition visuelle ET édition avancée. C'est un vecteur d'adoption majeur ([14_COMPETITIVE_ANALYSIS](14_COMPETITIVE_ANALYSIS.md)) : migrer depuis KoboToolbox/ODK sans ressaisie, et coexister avec l'écosystème existant.

> **Impact architecture.** Cette exigence élargit le périmètre de `packages/form-engine` : le modèle interne `FormSchema` ([10_DATABASE §5](10_DATABASE.md)) doit être un **sur-ensemble** de XLSForm (tout XLSForm exprimable en FormSchema et réciproquement pour le sous-ensemble supporté par le terrain). Deux nouveaux modules : `packages/form-engine/xlsform` (parse/serialize) et l'évaluateur d'expressions XPath/XLSForm.

## 1. Portée fonctionnelle (100 %)

| Domaine XLSForm | Détail à supporter |
|---|---|
| **Types de questions** | text, integer, decimal, range, select_one, select_multiple, select_one_from_file, rank, geopoint, geotrace, geoshape, date, time, dateTime, image, audio, video, file, barcode, note, calculate, acknowledge, hidden, start/end/today/deviceid/username (métadonnées) |
| **Relevances** | colonne `relevant` — affichage conditionnel via expressions |
| **Contraintes** | `constraint` + `constraint_message`, `required` + `required_message` |
| **Calculs** | `calculation` — expressions, variables, agrégations |
| **Valeurs par défaut** | `default` (statique et dynamique/calculée) |
| **Répétitions** | `begin_repeat`/`end_repeat`, `repeat_count`, référence aux occurrences (`indexed-repeat`) |
| **Groupes** | `begin_group`/`end_group`, groupes `field-list` (une page) |
| **Sauts conditionnels** | via `relevant` (le standard XLSForm n'a pas de « goto » : les sauts sont des relevances) |
| **Expressions** | opérateurs, fonctions XPath ODK (`if`, `coalesce`, `regex`, `string-length`, `selected`, `count`, `sum`, `max`, `min`, `pulldata`, `once`, `jr:choice-name`…) |
| **Variables** | référence à toute question antérieure par `${name}` |
| **Validations** | contraintes dures (bloquantes) et messages personnalisés multilingues |
| **Listes dynamiques** | `choice_filter` (cascades : région → département → commune), `select_from_file` |
| **Apparences** | colonne `appearance` (minimal, likert, quick, map, multiline, autocomplete…) mappées aux composants UI |
| **Multilingue** | colonnes `label::fr`, `hint::en`, `constraint_message::…`, `media::image::…` |
| **Feuilles** | `survey`, `choices`, `settings` (+ `entities` pour ODK Entities — V3, optionnel) |

## 2. Modèle : XLSForm ↔ FormSchema

L'application **stocke et exécute** son propre `FormSchema` (JSON) ; XLSForm est un format d'**échange**. Le mapping est bidirectionnel et documenté dans `form-engine/xlsform/mapping.md`.

| XLSForm | FormSchema |
|---|---|
| ligne `survey` `type=integer name=age label::fr=Âge` | `{ "type": "integer", "name": "age", "label": {"fr": "Âge"} }` |
| `relevant=${sexe}='f'` | `relevance` (arbre de conditions, voir §3) |
| `constraint=. >= 0 and . <= 120` | `constraints` + expression |
| `calculation=${a} + ${b}` | `formula` |
| feuille `choices` (list_name, name, label) | `options[]` de la question ou liste réutilisable |
| `choice_filter=region=${region}` | `choiceFilter` |
| `appearance=map` | `params.appearance` |

Règles :
- Les `name` (variables) sont préservés à l'identique dans les deux sens (clé d'interopérabilité).
- Une fonctionnalité XLSForm non représentable telle quelle sur le terrain (ex. rendu très spécifique) est conservée sans perte à l'import (round-trip) même si son UI est simplifiée.
- **Round-trip garanti** : importer un XLSForm puis le réexporter produit un fichier fonctionnellement équivalent (test automatisé sur un corpus de formulaires réels Kobo/ODK).

## 3. Évaluateur d'expressions

Le cœur technique. Un moteur d'évaluation d'expressions XLSForm/XPath (ODK) dans `form-engine`, **pur TypeScript, sans dépendance UI**, utilisé par le mobile, le web (aperçu) et l'API (validation serveur).

- Parseur d'expressions → AST → évaluateur avec contexte (réponses courantes, occurrence de repeat, métadonnées).
- Fonctions ODK implémentées progressivement (V1 : le sous-ensemble courant `if`, `coalesce`, comparaisons, arithmétique, `selected`, `count`, `sum` ; V2 : `regex`, `pulldata`, `indexed-repeat`, `jr:choice-name`, `once` ; V3 : le reste).
- Détection des cycles et des références avant (rejetées à la publication).
- Recalcul **instantané** des `calculate` à chaque changement (voir [module de calcul, §4](#4-calculs-automatiques)).

## 4. Calculs automatiques

Le moteur de formulaire supporte, avec mise à jour **instantanée** à chaque saisie :

- calculs et variables (`calculate`, `${var}`) ;
- formules arithmétiques et logiques ;
- agrégations sur les groupes répétables : `count`, `sum`, `min`, `max`, moyenne, pourcentages ;
- indicateurs composés et statistiques descriptives locales (ex. superficie totale d'un ménage = somme des parcelles) ;
- calculs géo injectés comme réponses : `area`, `perimeter`, `distance`, `length` ([08_GIS §2 GIS-11](08_GIS.md)).

Ces calculs alimentent aussi les **statistiques terrain temps réel** ([05_MOBILE](05_MOBILE.md)) et sont revalidés côté serveur à la synchronisation.

## 5. Éditeur : visuel + avancé

Deux modes dans le form builder web ([06_WEB §2.5](06_WEB.md)) :

- **Édition visuelle** (défaut) : drag & drop, panneaux de propriétés, constructeur de conditions et de contraintes sans écrire d'expression. Cible : utilisateurs non techniques.
- **Édition avancée** : accès direct aux expressions (relevant, constraint, calculation, choice_filter), vue « source » du formulaire, import/collage de feuilles `choices` volumineuses. Cible : data managers venant de XLSForm.
- **Bascule sans perte** entre les deux modes ; l'aperçu live (form-engine) reflète les deux.

## 6. Import / Export

| Opération | Route | Détail |
|---|---|---|
| Import XLSForm | `POST /forms/import/xlsform` | upload `.xlsx` → parse → FormSchema → brouillon ; rapport d'erreurs ligne par ligne si non conforme |
| Export XLSForm | `GET /forms/:id/export/xlsform` | FormSchema → `.xlsx` conforme (réimportable dans Kobo/ODK) |
| Import Word/PDF | `POST /ai/form-generation` | via IA ([07_AI §2](07_AI.md)) : extraction du questionnaire → FormSchema (brouillon, à valider) |

L'import Word/PDF passe par l'IA (structure non normée) ; l'import XLSForm est **déterministe** (pas d'IA — le format est spécifié). Ces routes complètent [11_API §6](11_API.md).

## 7. Tests (exigence forte)

- **Corpus de conformité** : un jeu de formulaires XLSForm réels (Kobo, ODK, Survey123) + la suite de tests XLSForm de référence, importés puis exportés (round-trip), avec assertions structurelles.
- **Évaluateur d'expressions** : table de cas (expression, contexte, résultat attendu) alignée sur le comportement ODK.
- **Parité d'exécution** : un même formulaire produit les mêmes valeurs calculées et les mêmes relevances sur mobile, web et serveur (fixtures partagées).
- **Non-régression** : tout ajout de fonction ODK ajoute ses cas au corpus.

## 7b. Migration réelle depuis Kobo/ODK (levier d'adoption n°1)

Importer un XLSForm **ne suffit pas** à faire basculer une ONG : elle a aussi des **données déjà collectées**. Le vrai « switch sans douleur » importe **formulaires ET soumissions**.

| Élément | Source | Cible |
|---|---|---|
| Formulaire | export XLSForm (Kobo/ODK) | FormSchema (import déterministe, §6) |
| Soumissions | export CSV/JSON de Kobo/ODK Central | `submissions.data` (mapping par nom de variable) |
| Médias | pièces jointes exportées | `attachments` (ré-upload, liens reconstitués) |
| Données de référence | fichiers `select_from_file` | `reference_data` |

Contraintes : conserver les identifiants et horodatages d'origine (traçabilité), rapport de mapping (champs non appariés signalés, jamais silencieux), idempotence de l'import. **Feature ID : FORM-XLS-05** (migration de données). Assistant d'import guidé côté web. C'est un argument commercial de premier plan — à mettre en avant dans l'[analyse concurrentielle](14_COMPETITIVE_ANALYSIS.md).

## 8. Positionnement roadmap

- **V0/V1** : FormSchema comme sur-ensemble, évaluateur (sous-ensemble courant), édition visuelle, **export** XLSForm.
- **V2** : **import** XLSForm avec round-trip garanti + **migration des données Kobo/ODK** (FORM-XLS-05), édition avancée, fonctions ODK étendues, listes dynamiques/cascades, import Word/PDF par IA.
- **V3** : couverture 100 % des fonctions ODK restantes, ODK Entities (optionnel).

> Feature IDs associés : **FORM-XLS-01** (export), **FORM-XLS-02** (import + round-trip), **FORM-XLS-03** (édition avancée/expressions), **FORM-XLS-04** (import Word/PDF IA) — voir [03_FEATURES](03_FEATURES.md).
