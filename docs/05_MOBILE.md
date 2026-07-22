# 05 — Application mobile

Spécification de `apps/mobile`. Stack : **React Native via Expo** (dev build, pas Expo Go pour la prod), TypeScript strict, SQLite (expo-sqlite) + Drizzle ORM, MapLibre React Native, Zustand (état), TanStack Query (réseau). Le rendu et la logique des formulaires viennent exclusivement de `packages/form-engine`.

## 1. Architecture locale

```
mobile/src/
├── app/            # écrans (expo-router)
├── components/     # UI réutilisable (voir 13_DESIGN_SYSTEM.md)
├── db/             # schéma SQLite + migrations + DAO
├── sync/           # moteur de synchronisation (file, workers, reprise)
├── media/          # capture, compression, stockage fichiers
├── form/           # pont form-engine ↔ composants de saisie
└── services/       # api client, auth, localisation, permissions
```

### Base SQLite locale (miroir partiel du serveur)

| Table | Contenu |
|---|---|
| `session` | tokens (access/refresh chiffrés via SecureStore), user, organisation, expiration locale (30 j) |
| `projects` | projets téléchargés (id, nom, langues, statut, updated_at) |
| `forms` | formulaires + version courante + schéma JSON complet |
| `submissions` | soumissions locales : `uuid`, `form_id`, `form_version`, `data` (JSON), `status` (draft/finalized/uploading/synced/rejected), `rejection_reason`, timestamps, géo résumée |
| `attachments` | fichiers liés : uuid, submission_uuid, question_id, chemin local, taille, mime, `upload_status`, `uploaded_bytes` (reprise par chunk) |
| `sync_queue` | opérations à envoyer (FIFO), tentatives, prochaine échéance (backoff) |
| `reference_data` | listes de référence téléchargées (V2) |
| `map_tiles_meta` | zones de cartes offline (V2) |

Règles : écritures locales **transactionnelles** ; `uuid` v7 générés à la création (clé d'idempotence serveur) ; les médias vivent sur le filesystem, la base ne stocke que les chemins.

## 2. Écrans

### 2.1 Splash / démarrage
Logo, chargement de la session locale. Routage : session valide → Accueil ; sinon → Authentification. Aucun appel réseau bloquant : si le refresh token est expiré mais des données locales non synchronisées existent, accès en **mode lecture + sync** (l'utilisateur peut synchroniser après re-login, jamais de perte).

### 2.2 Authentification
Email + mot de passe → `POST /auth/login`. Erreurs claires (identifiants, réseau). Après login : stockage sécurisé des tokens, téléchargement du profil et de la liste des projets. Lien « Mot de passe oublié » (web). Multi-organisation : sélecteur si l'utilisateur appartient à plusieurs orgs.

### 2.3 Téléchargement des projets
Liste des projets actifs assignés avec taille estimée (formulaires + référentiels + médias de formulaire). Téléchargement explicite par projet ; barre de progression ; état « À jour / Mise à jour disponible » (comparaison `updated_at`). Un projet téléchargé est utilisable 100 % hors ligne.

### 2.4 Accueil & multi-projets
- **Sélecteur de projet actif** en haut : l'utilisateur travaille sur **plusieurs projets simultanément** (contrairement à KoboCollect qui impose un projet à la fois). Chaque projet conserve **ses** formulaires, cartes, statistiques, brouillons et file de synchronisation. Changer de projet actif ne supprime ni ne réinitialise jamais les autres.
- Carte « Reprendre » : dernier brouillon ou dernier formulaire utilisé (1 tap → saisie).
- Liste des formulaires du projet actif, avec compteurs par statut (brouillons / en attente / synchronisées).
- Bandeau d'état de sync (n en attente, dernière sync, bouton synchroniser).
- Bandeau « Soumissions rejetées » si applicable (accès direct à la correction).
- Accès aux **statistiques terrain** du projet (voir 2.12).

### 2.5 Carte (SIG au cœur de la collecte)
La carte est un élément **central**, pas un module annexe ([P8](17_PRINCIPES_CONCEPTION.md)) — détail dans [08_GIS](08_GIS.md). Fonds satellite / vectoriel / **offline** (MapLibre), position courante. Elle affiche : points GPS des soumissions (locales et synchronisées), plantations, parcelles, placettes, transects, buffers, itinéraires. L'utilisateur visualise en temps réel **ses** collectes et — selon ses permissions — celles des **autres membres du projet**, ainsi que les **superpositions, doublons potentiels et erreurs de géolocalisation** signalés. Tap sur un élément → fiche résumé → détail. Manipulation avancée (dessin de polygones/lignes/placettes, mesures, buffers automatiques, vérification placette-dans-plantation, repositionnement assisté) : voir [08_GIS §2](08_GIS.md). V2 : couches projet importées, zones offline, géofences.

### 2.5b Assistant IA de terrain
Pendant la collecte (fonction en ligne, dégradable — [P6](17_PRINCIPES_CONCEPTION.md)), l'agent peut **dialoguer avec l'IA** : « Ai-je oublié une question ? », « Pourquoi cette réponse est-elle incohérente ? », « Résume ce questionnaire », « Vérifie la cohérence des superficies ». L'IA répond en s'appuyant sur les réponses en cours ; elle **propose**, l'agent décide. Le contrôle qualité en temps réel (orthographe, valeurs improbables, GPS suspect, photo floue…) est décrit en [07_AI §2 (AI-03/AI-09)](07_AI.md).

### 2.5c Consentement (CONSENT-01)

Écran de consentement intégrable en début ou au point d'entrée du formulaire (configurable dans le form builder) :

- **Texte de consentement** multilingue, paramétrable par projet. Affiché en plein écran avant la première question personnelle.
- **Modes** :
  - *Requis* : l'utilisateur ne peut pas passer à la suite si refus. Le refus clôt proprement la soumission (statut `refused`, aucune donnée personnelle enregistrée, compté dans les stats de non-consentement).
  - *Enregistré* : capture accepté/refusé + horodatage + méthode (signature ou oral).
- **Signature** : composant canvas dédié (tracé au doigt, export PNG) — optionnel, activable par le form builder.
- **Consentement oral** : case à cocher attestant que l'enquêteur a lu le texte à l'enquêté et que celui-ci a accepté — alternative à la signature pour les contextes à faible littératie.
- **Refus** : la soumission est close avec le statut `refused` ; zéro donnée personnelle enregistrée ; compteur visible dans les statistiques du projet (taux de non-consentement).
- **Traçabilité** : le statut `consent_status`, la méthode, l'horodatage et la signature (si présente) sont stockés dans `submissions.meta` et ne sont jamais modifiables après finalisation.

Comportement hors ligne : le texte de consentement est téléchargé avec le formulaire (pas de appel réseau nécessaire). La signature et le statut sont stockés localement et synchronisés à la prochaine sync.

### 2.6 Formulaire (flux de saisie)
- Rendu piloté par le schéma JSON via `form-engine` : chaque question → composant de saisie dédié ; logique/validation/calculs évalués par le moteur à chaque changement.
- Deux modes d'affichage (préférence utilisateur) : pas-à-pas (défaut) ou liste complète. Barre de progression, sommaire des sections, bouton « Enregistrer et quitter » toujours visible.
- **Navigation pas-à-pas** : boutons Suivant/Précédent, swipe gestuel, indicateur de page (n/N), transition 150 ms ease-out.
- Sauvegarde auto : à chaque réponse (débounce 500 ms) + toutes les 30 s → table `submissions` (status `draft`).
- Finalisation : validation complète par le moteur ; si erreurs → liste cliquable des champs en erreur avec messages ; si OK → statut `finalized`, ajout à `sync_queue`, retour Accueil avec confirmation.

Composants de saisie V1 : TextInput (texte/nombre/décimal avec clavier adapté), DatePicker/TimePicker natifs, choix unique (radio / liste recherchable si > 10 options), choix multiple (checkboxes), GPS (voir 2.8), Photo (voir 2.7), Audio (enregistreur pause/reprise), Signature (canvas), **Consentement** (voir 2.5c), Note (affichage), Calcul (lecture seule).

### 2.7 Caméra / médias
Capture via expo-camera ou import galerie (si autorisé par le formulaire). Pipeline : capture → compression (côté long max 2048 px, qualité 80 %, configurable projet) → EXIF GPS/date optionnels selon config → stockage app-privé → enregistrement `attachments`. Aperçu, reprise, suppression avant finalisation.

### 2.8 GPS
Écran de capture : carte centrée, jauge de précision en temps réel, seuil requis affiché (config projet, défaut ≤ 10 m), bouton « Enregistrer » actif quand le seuil est atteint (moyenne glissante sur 5 mesures), option « forcer » avec justification si le formulaire l'autorise. Localisation activée uniquement pendant la capture (batterie).

### 2.9 Synchronisation (écran Envois)
- Onglets **En attente** / **Historique**.
- En attente : liste FIFO, progression par soumission (données puis médias, % par fichier), erreurs éventuelles avec cause lisible et heure du prochain essai.
- Historique : soumissions synchronisées/rejetées, filtre par formulaire ; les rejetées portent le motif et un bouton « Corriger » (repasse en éditable, une seule révision à la fois).
- Paramètres rapides : sync auto on/off, wifi seulement, médias différés.

Moteur de sync (`sync/`) : worker unique séquentiel ; pour chaque soumission → `POST /sync/submissions` (idempotent par uuid) puis upload de chaque attachment par chunks (`PUT /attachments/:uuid/chunks/:n`, reprise via `uploaded_bytes`) puis confirmation. Backoff exponentiel (1 min → 2 → 4 → … max 1 h) ; déclencheurs : retour réseau (NetInfo), ouverture app, manuel, tâche de fond périodique (expo-background-task, best effort). Sync descendante à chaque session : delta `GET /sync/updates?since=` (formulaires, assignations, rejets).

### 2.10 Historique
Intégré à l'écran Envois (onglet Historique) — voir 2.9.

### 2.11 Gestion des brouillons
Aucune donnée ne doit jamais être perdue ([P9](17_PRINCIPES_CONCEPTION.md)). Le système offre :
- **enregistrement automatique** continu (à chaque réponse + toutes les 30 s) ;
- **enregistrement manuel** (« Enregistrer et quitter » toujours visible) ;
- **renommage** d'un brouillon (libellé lisible, ex. « Ménage Diallo — village Ndiaye ») ;
- **commentaires/notes** libres attachés au brouillon (ex. « revenir mesurer la parcelle 3 ») ;
- **reprise ultérieure** exacte (reprise à la dernière section, réponses et médias intacts, y compris après crash ou redémarrage) ;
- **synchronisation différée** : un brouillon reste local tant qu'il n'est pas finalisé ; plusieurs brouillons par formulaire sont possibles.

### 2.12 Statistiques terrain (hors ligne)
Même **sans connexion**, l'app calcule et affiche en temps réel des statistiques par projet, à partir des données locales (SQLite) : questionnaires **commencés / terminés / brouillons**, **taux de synchronisation**, et — selon le formulaire — indicateurs métier calculés (ex. nombre de producteurs, nombre de plantations, **superficie totale et moyenne**, **distance parcourue**, **temps moyen par questionnaire**). Ces agrégats réutilisent le moteur de calcul du form-engine ([18_XLSFORM §4](18_XLSFORM.md)) et se recoupent avec le dashboard web après sync.

### 2.13 Paramètres
Profil et organisation, langue (FR/EN), mode d'affichage des formulaires, options de sync, gestion du stockage (taille occupée, purge des soumissions synchronisées > 30 j, gestion des cartes offline V2), à propos/version, déconnexion (bloquée avec avertissement s'il reste des soumissions non synchronisées — confirmation explicite requise).

## 3. Exigences non fonctionnelles mobiles

- Android 8+ / iOS 15+ ; cible de perf : fluide (60 fps perçu) sur 2 Go RAM.
- Démarrage à froid < 3 s sur matériel cible.
- Crash-free > 99,5 % ; les erreurs JS sont capturées (Sentry) et n'interrompent jamais une saisie (error boundaries par écran, brouillon préservé).
- Données locales : SQLite + fichiers dans le stockage privé de l'app ; tokens en SecureStore ; option de chiffrement complet (SQLCipher) en ENT.
- Aucune fonction cœur dépendante de Google Play Services.

## 4. Tests

- Unitaires : DAO SQLite, moteur de sync (idempotence, reprise, backoff — avec serveur mocké), pipeline média.
- Intégration : parcours de saisie complet sur schémas de formulaire de référence (fixtures partagées avec `form-engine`).
- E2E (Maestro) : parcours critique en mode avion — télécharger projet, saisir avec photo+GPS, kill de l'app, reprise du brouillon, finalisation, sync au retour réseau.
