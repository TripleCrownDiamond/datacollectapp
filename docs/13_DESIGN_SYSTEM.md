# 13 — Design system

Système de design partagé web (Tailwind + shadcn/ui) et mobile (composants RN maison alignés sur les mêmes tokens). Les tokens vivent dans `packages/shared/design-tokens.ts` (source unique) et sont consommés par la config Tailwind et le thème RN.

## 1. Principes visuels

Sobre, dense en information sans être chargé, lisible en plein soleil (mobile) : contrastes forts, hiérarchie typographique nette, couleur réservée au sens (statuts, actions), jamais décorative au détriment de la lisibilité.

## 2. Couleurs

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#0F766E` (teal 700) | `#2DD4BF` | actions principales, liens, focus |
| `primary-foreground` | `#FFFFFF` | `#042F2E` | texte sur primary |
| `background` / `surface` | `#FFFFFF` / `#F8FAFC` | `#0B1220` / `#111827` | fonds |
| `foreground` | `#0F172A` | `#E5E7EB` | texte principal |
| `muted` | `#64748B` | `#94A3B8` | texte secondaire |
| `border` | `#E2E8F0` | `#1F2937` | séparateurs |
| `success` | `#15803D` | `#4ADE80` | synchronisée, approuvée |
| `warning` | `#B45309` | `#FBBF24` | en attente, précision GPS limite |
| `danger` | `#B91C1C` | `#F87171` | rejetée, erreurs, zone dangereuse |
| `info` | `#1D4ED8` | `#60A5FA` | envoi en cours, notes |

Règles : contraste AA minimum dans les deux thèmes ; les statuts combinent toujours couleur + icône + libellé ([04_UX.md §6](04_UX.md)) ; couleurs de données cartographiques/graphiques : palette catégorielle dédiée 8 teintes accessible (définie dans les tokens, distincte des couleurs d'UI).

## 3. Typographie

- Police : **Inter** (web et mobile ; fallback system-ui). Chiffres tabulaires (`tnum`) dans les tables et compteurs.
- Échelle : 12 (caption) · 14 (body-sm) · 16 (body, base mobile) · 18 (h4) · 20 (h3) · 24 (h2) · 30 (h1). Interlignage 1,5 corps de texte.
- Mobile : respect du font scaling système jusqu'à 200 % sans casse de layout.

## 4. Espacements, rayons, élévation

- Grille d'espacement : multiples de 4 px (4/8/12/16/24/32/48).
- Rayons : 8 px (composants), 12 px (cartes), plein (pills/badges).
- Élévation : bordures + ombres légères (`shadow-sm`) ; pas d'ombres lourdes ; le dark mode remplace l'ombre par la variation de surface.

## 5. Iconographie

**Lucide** (web via lucide-react, mobile via lucide-react-native) — cohérent, open source, 24 px par défaut, stroke 2. Icônes de statut réservées : `FileEdit` brouillon, `Clock` en attente, `UploadCloud` envoi, `CheckCircle2` synchronisée/approuvée, `XCircle` rejetée, `MapPin` GPS, `Sparkles` IA.

## 6. Composants

Base shadcn/ui (web) : Button, Input, Select, Checkbox, RadioGroup, DatePicker, Dialog, Sheet, Tabs, Table, Badge, Toast, Tooltip, Card, DropdownMenu. Extensions produit (web + équivalents mobiles) :

| Composant | Usage / règles |
|---|---|
| `StatusBadge` | statut de soumission — couleur + icône + libellé, mapping unique partagé |
| `SyncIndicator` | état de sync global (n en attente, progression, dernière sync) |
| `QuestionField` | wrapper de champ de formulaire : label, hint, erreur, marqueur requis/IA — un rendu par type de question |
| `FormNavigation` | barre de progression pas-à-pas (page n/N), boutons Suivant/Précédent, swipe gestuel, indicateur de section active |
| `ConsentScreen` | écran de consentement plein écran : texte multilingue, cases acceptation/refus, signature canvas, mode oral ; états : lecture, accepté, refusé. En-tête avec compteur et timer de relecture |
| `GpsCapture` | jauge de précision temps réel, seuil, carte miniature, bouton forcer avec justification |
| `MediaThumb` | vignette photo/audio/signature avec états (local, uploading %, stored, failed) |
| `MapView` | wrapper MapLibre : fonds, clustering, couches, légende |
| `StatCard`, `TimeSeriesChart`, `BreakdownChart` | dashboard (Recharts, tokens de palette data) |
| `EmptyState` | illustration légère + action principale — jamais d'écran vide muet |
| `LoadingSkeleton` | état de chargement : rects animés (shimmer) calqués sur la structure de la page (carte, liste, détail). Pas de spinner seul sans contexte. Respecte `prefers-reduced-motion` (fade uniquement, pas de shimmer) |
| `ErrorBanner` | bannière d'erreur multiligne : icône, titre, message détaillé, action de fermeture/retry. Plusieurs niveaux : `network` (sync échouée), `validation` (champs en erreur avec liens), `server` (erreur API avec code lisible) |
| `ConfirmDangerDialog` | actions destructives : saisie nominative requise, timer de confirmation 3 s avant activation |

Chaque composant : states **default/hover/focus/disabled/loading/error** documentés, focus visible (anneau `primary` 2 px), navigation clavier, min 48 dp tactile mobile.

### 6.1 États de formulaire (ErrorBanner + QuestionField)

La gestion des erreurs de formulaire suit une hiérarchie claire :

| Niveau | Composant | Exemple |
|---|---|---|
| **Champ** | `QuestionField` avec message inline sous le champ | *« L'âge doit être entre 0 et 120 »* |
| **Page** | `ErrorBanner` en haut de la page | *« 3 champs obligatoires sont vides »* avec liens cliquables |
| **Formulaire** | `ErrorBanner` persistante | *« Impossible de finaliser : corrigez les erreurs ci-dessous »* |
| **App** | `ErrorBanner` globale (Toast style) | *« Connexion perdue. Les données seront synchronisées plus tard. »* |

Les messages d'erreur sont toujours en langage clair, jamais de codes techniques (voir §9).

### 6.2 États de chargement (LoadingSkeleton)

| Contexte | Type de skeleton | Comportement |
|---|---|---|
| Liste de soumissions | 6 lignes alternées (50 % / 75 % de largeur) | shimmer jusqu'à 2 s, puis affichage normal ou EmptyState |
| Carte | Rectangle plein écran 16:9 gris | spinner overlay + texte *« Chargement de la carte… »* |
| Détail soumission | 4 lignes texte + 1 carré média | apparition progressive (stagger 50 ms) |
| Dashboard | 3 StatCard squelettes + graphique vide | shimmer, puis transition douce vers les données |

## 7. Animations

Discrètes et fonctionnelles uniquement : transitions 150–200 ms ease-out (apparition de questions conditionnelles, toasts, dialogs), progression de sync animée, aucun mouvement décoratif. Respect de `prefers-reduced-motion` (web) et du réglage système (mobile).

## 8. Responsive & dark mode

- Web : breakpoints Tailwind standard ; layouts testés desktop (≥ 1280), tablette (768), mobile lecture (375). Le builder exige ≥ 1024 (message dédié en-dessous).
- Dark mode : web `class` strategy + préférence système par défaut ; mobile suit le système avec override dans Paramètres. Tous les composants sont validés dans les deux thèmes (checklist PR).

## 9. Ton rédactionnel (UX writing)

Français clair, vouvoiement, phrases courtes, jamais de jargon technique dans les erreurs utilisateur (« Impossible d'envoyer pour le moment. Nouvel essai automatique dans 2 min. » — pas « HTTP 503 »). Termes canoniques (glossaire i18n unique) : *formulaire, soumission, brouillon, finaliser, synchroniser, placette, transect*. Les clés i18n vivent dans `packages/shared/i18n`.
