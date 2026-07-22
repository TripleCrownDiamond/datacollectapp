# 02 — PRD (Product Requirements Document)

## 1. Objectifs

| Objectif | Mesure de succès (V1) |
|---|---|
| Réduire drastiquement le temps de création d'un formulaire | < 30 min pour un formulaire de 40 questions (vs plusieurs jours en XLSForm) |
| Garantir zéro perte de données terrain | 0 soumission perdue, y compris crash, batterie vide, 30 jours offline |
| Rendre la collecte rapide et agréable | Temps moyen par soumission réduit de 30 % vs outil précédent du client |
| Donner une visibilité temps réel aux décideurs | Dashboard et carte à jour < 1 min après synchronisation |
| Qualité des données à la source | > 90 % des soumissions sans erreur détectée a posteriori |

## 2. Périmètre du MVP (V1)

**Inclus :**

- Multi-tenant : organisations, projets, membres, 4 rôles (owner, admin, editor, collector).
- Form builder web : édition manuelle (drag & drop) + génération par IA + aperçu live.
- Types de questions V1 : texte, nombre, décimal, date, heure, choix unique, choix multiple, GPS (point), photo, audio, signature, note/section, calcul.
- Logique conditionnelle (afficher/masquer), contraintes de validation, questions répétables (groupes repeat).
- App mobile offline-first : téléchargement de projets/formulaires, collecte, brouillons, file de sync, historique.
- Synchronisation bidirectionnelle robuste (formulaires ↓, soumissions ↑) avec reprise sur erreur.
- Web : table des soumissions (tri, filtre, détail), carte des points collectés, dashboard basique (compteurs, graphiques simples), export CSV/XLSX/GeoJSON.
- IA V1 : génération de formulaire à partir d'une description en langage naturel.
- i18n : interface FR/EN ; formulaires multilingues (labels traduisibles).

**Exclus du MVP (versions ultérieures, voir [12_ROADMAP.md](12_ROADMAP.md)) :**

- Vidéo, NFC, OCR, scan de documents, dessin, QR code (V2).
- SIG avancé : placettes, transects, buffers, géofencing, import Shapefile, cartes offline (V2).
- Contrôle qualité IA, détection de doublons, chat avec les données, rapports IA (V2/V3).
- SSO, auto-hébergement, API publique, audit avancé (Enterprise).
- Assistant vocal, prédictions (Version IA).

## 3. User stories et critères d'acceptation

Priorité : **P0** = bloquant MVP, **P1** = MVP souhaité, **P2** = post-MVP.

### Épopée A — Comptes et organisations

| ID | En tant que… | Je veux… | Critères d'acceptation | Prio |
|---|---|---|---|---|
| A1 | visiteur | créer un compte et une organisation | email + mot de passe (≥ 12 car.), vérification email, l'org est créée avec moi comme owner | P0 |
| A2 | admin | inviter des membres par email avec un rôle | invitation par lien, expiration 7 j, le rôle s'applique à la connexion | P0 |
| A3 | admin | changer le rôle ou désactiver un membre | un membre désactivé ne peut plus se connecter ni synchroniser ; ses données restent | P0 |

### Épopée B — Projets et formulaires

| ID | En tant que… | Je veux… | Critères d'acceptation | Prio |
|---|---|---|---|---|
| B1 | admin/editor | créer un projet (nom, description, langues, statut) | statuts : draft / active / archived ; seuls les projets active sont téléchargeables au mobile | P0 |
| B2 | editor | construire un formulaire par glisser-déposer | tous les types V1, réordonnancement, duplication, aperçu live fidèle au rendu mobile | P0 |
| B3 | editor | générer un formulaire en décrivant mon besoin à l'IA | brouillon généré < 60 s, toujours éditable, jamais publié automatiquement | P1 |
| B4 | editor | définir logique conditionnelle et contraintes | conditions sur toute réponse antérieure ; opérateurs =, ≠, <, >, contient, est vide ; contraintes min/max/regex avec message d'erreur personnalisé | P0 |
| B5 | editor | publier des versions de formulaire | publication = version immuable n+1 ; les soumissions référencent leur version ; les collecteurs reçoivent la dernière version à la sync | P0 |
| B6 | editor | assigner un formulaire à des membres | seuls les assignés (ou tout le projet si « tous ») le voient au mobile | P1 |

### Épopée C — Collecte mobile

| ID | En tant que… | Je veux… | Critères d'acceptation | Prio |
|---|---|---|---|---|
| C1 | collector | me connecter puis travailler hors ligne | après 1re connexion, l'app fonctionne sans réseau ; session locale ≥ 30 jours | P0 |
| C2 | collector | télécharger mes projets et formulaires | téléchargement explicite avec taille estimée ; état « à jour / mise à jour disponible » | P0 |
| C3 | collector | remplir un formulaire avec logique et validation | logique évaluée en temps réel ; impossible de finaliser avec des contraintes violées ; erreurs affichées sous le champ en langage clair | P0 |
| C4 | collector | capturer photo, audio, signature, GPS | photo compressée (max configurable, défaut 2048 px) ; GPS avec précision affichée et seuil configurable ; capture possible sans réseau | P0 |
| C5 | collector | sauvegarder un brouillon à tout moment | sauvegarde auto toutes les 30 s et à chaque changement d'écran ; reprise exacte après crash ou redémarrage | P0 |
| C6 | collector | finaliser et mettre en file de synchronisation | soumission finalisée = non modifiable localement (sauf rejet) ; visible dans « En attente » | P0 |
| C7 | collector | synchroniser automatiquement au retour du réseau | sync auto en arrière-plan si activée ; reprise des uploads interrompus (médias par chunks) ; jamais de doublon serveur (idempotence par UUID) | P0 |
| C8 | collector | voir mon historique et les statuts | statuts : brouillon / finalisée / en cours d'envoi / synchronisée / rejetée ; compteurs par formulaire | P0 |

### Épopée D — Exploitation des données (web)

| ID | En tant que… | Je veux… | Critères d'acceptation | Prio |
|---|---|---|---|---|
| D1 | admin/editor | voir les soumissions en table | colonnes = questions ; tri, filtres (date, auteur, statut, valeur), pagination serveur, recherche | P0 |
| D2 | admin/editor | voir le détail d'une soumission | toutes les réponses, médias lisibles, métadonnées (auteur, dates, GPS, version du formulaire, appareil) | P0 |
| D3 | admin/editor | voir les points collectés sur une carte | fond OSM + satellite ; clustering ; popup → détail ; filtre par formulaire/date | P0 |
| D4 | admin/editor | approuver ou rejeter une soumission | rejet avec motif ; la soumission rejetée redevient éditable côté mobile pour son auteur | P1 |
| D5 | tout membre web | voir un dashboard par projet | compteurs (soumissions, collecteurs actifs), courbe temporelle, répartition par question à choix ; à jour < 1 min après sync | P1 |
| D6 | admin/editor | exporter les données | CSV, XLSX, GeoJSON ; les repeats exportés en tables liées ; médias en zip optionnel | P0 |

## 4. Parcours utilisateurs clés

**Parcours 1 — Du besoin au terrain (Aïcha) :** inscription → création projet → description du besoin à l'IA → ajustement du formulaire dans le builder → aperçu → publication v1 → invitation de 10 collecteurs → suivi du dashboard. **Objectif : < 1 h.**

**Parcours 2 — Journée de collecte (Moussa) :** connexion (la veille, en ville) → téléchargement du projet → terrain sans réseau : 25 soumissions avec photos et GPS → retour en zone couverte → sync auto → notification « 25/25 synchronisées ».

**Parcours 3 — Contrôle (Aïcha) :** table des soumissions → filtre du jour → détection d'une valeur aberrante → rejet avec motif → Moussa voit la soumission rejetée à sa prochaine sync → correction → re-sync → approbation.

## 5. Règles métier

1. **Immuabilité des versions** : une version publiée de formulaire n'est jamais modifiée ; toute correction crée une nouvelle version. Une soumission référence toujours la version exacte utilisée.
2. **Propriété des soumissions** : une soumission appartient à son auteur jusqu'à synchronisation ; après sync elle appartient au projet. Seul l'auteur peut corriger une soumission rejetée.
3. **Suppression** : jamais physique pour les données métier (soft delete + audit). La suppression d'un projet est réservée à l'owner et exige une confirmation nominative.
4. **Idempotence de la sync** : chaque soumission porte un UUID client ; le serveur ignore les re-soumissions d'un UUID déjà accepté (réponse 200 idempotente).
5. **Conflits** : une soumission finalisée n'est modifiable que par son auteur et une seule révision à la fois → le protocole (voir [09_ARCHITECTURE.md §6](09_ARCHITECTURE.md)) évite les conflits par conception ; en cas de conflit résiduel, les deux versions sont conservées et signalées, jamais d'écrasement silencieux.
6. **Rôles** : 8 rôles (Super Administrateur, Administrateur, Chef de projet, Superviseur, Contrôleur qualité, Agent collecteur, Analyste, Observateur) à **permissions configurables** par organisation. Un agent collecteur ne voit que ses propres soumissions. Matrice complète et modèle de données : [10_DATABASE.md §6](10_DATABASE.md).
7. **Quotas médias** : taille max par pièce jointe configurable par projet (défaut 25 Mo) ; compression photo activée par défaut.
8. **IA** : aucune action IA n'écrit directement en production — l'IA propose, l'humain valide (formulaires générés = brouillons ; contrôles qualité = signalements).

## 6. Contraintes

- **Matériel cible mobile** : Android 8+ (API 26), 2 Go RAM, 100 Mo de stockage app hors médias ; iOS 15+. Performance fluide sur matériel bas de gamme = exigence, pas optimisation.
- **Réseau** : tout doit fonctionner en 2G intermittente ; payloads de sync compressés ; médias envoyés séparément des données par chunks avec reprise.
- **Volumes V1** : 10 000 soumissions/projet, 200 questions/formulaire, 50 collecteurs simultanés/projet — sans dégradation.
- **Sécurité & conformité** : chiffrement en transit (TLS 1.2+) et au repos ; données locales mobiles chiffrées ; RGPD (export et suppression sur demande, registre des traitements) ; hébergement UE par défaut.
- **Langues** : interface FR/EN dès la V1 ; architecture i18n extensible.

## 7. Priorisation (MoSCoW — V1)

- **Must** : A1–A3, B1–B2, B4–B5, C1–C8, D1–D3, D6, exports CSV/GeoJSON.
- **Should** : B3 (IA), B6, D4, D5, export XLSX.
- **Could** : mode sombre mobile, dictée texte native, tuiles satellite en cache local.
- **Won't (V1)** : tout le périmètre listé « Exclus du MVP » en §2.

## 8. Critères d'acceptation globaux de la V1

1. Le parcours 2 (journée de collecte) réussit en mode avion de bout en bout, y compris après un kill de l'app en cours de saisie.
2. 1 000 soumissions avec 3 photos chacune se synchronisent sans intervention sur une connexion instable simulée (coupures aléatoires), sans doublon ni perte.
3. Un utilisateur non technique crée et publie un formulaire de 20 questions avec logique conditionnelle en moins de 30 minutes sans documentation.
4. L'export CSV/GeoJSON réimporté dans Excel/QGIS est correct (encodage, types, coordonnées).
5. Tous les endpoints V1 de [11_API.md](11_API.md) sont couverts par des tests e2e verts.
