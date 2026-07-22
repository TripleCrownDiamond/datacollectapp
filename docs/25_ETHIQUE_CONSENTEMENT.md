# 25 — Éthique « do no harm », consentement des enquêtés & conformité

Une plateforme de collecte terrain manipule des données sur des **personnes enquêtées** (bénéficiaires, patients, réfugiés, ménages) — pas seulement sur ses utilisateurs. GPS + photos + identités de populations vulnérables : une fuite ou un mauvais usage peut mettre des gens **en danger physique**. Cette responsabilité (« do no harm », principe fondateur du secteur humanitaire) est traitée ici comme **une exigence produit et un différenciateur commercial**, pas comme une clause juridique.

> Distinction clé : le RGPD et [26_SECURITE](26_SECURITE_MODELE_MENACE.md) protègent surtout **l'organisation utilisatrice**. Ce document protège **les personnes enquêtées** — l'angle que Kobo/Esri traitent mal et que nous en faisons un argument de vente.

## 1. Principes

1. **Ne pas nuire.** Aucune fonctionnalité ne doit augmenter le risque pour une personne enquêtée. En cas de doute, l'option la plus protectrice gagne.
2. **Minimisation.** On ne collecte que ce qui est nécessaire au projet. L'outil aide activement à réduire les champs sensibles superflus.
3. **Consentement éclairé.** La personne enquêtée sait ce qui est collecté, pourquoi, par qui, et peut refuser — tracé dans la soumission.
4. **Souveraineté des personnes.** Droit à l'information, à la rectification, à l'effacement — y compris pour les enquêtés, pas seulement les utilisateurs.
5. **Protection renforcée** pour mineurs et données de santé.

## 2. Module de consentement (fonctionnalité produit)

**ID : CONSENT-01** ([03_FEATURES](03_FEATURES.md)). Un type d'écran de consentement intégrable au formulaire :

- Texte de consentement multilingue (paramétrable par projet), affiché **avant** la collecte des données personnelles.
- Modes : **consentement requis** (bloque la suite si refus), **enregistré** (capture accepté/refusé + horodatage + méthode), avec option **signature** ou **consentement oral** (case cochée par l'enquêteur attestant la lecture).
- Le **refus** est une issue valide : la soumission est close proprement, sans données personnelles, comptée dans les statistiques de non-consentement.
- Traçabilité : le statut de consentement est stocké dans `submissions.meta` (jamais falsifiable côté serveur).

## 3. Minimisation & champs sensibles

- **Marquage des champs sensibles** dans le form builder (identité, santé, GPS précis, photo de personne…). Un champ marqué sensible :
  - est **exclu par défaut** des exports partagés et des envois à l'IA ([07_AI §1](07_AI.md)) ;
  - peut être **chiffré au niveau champ** (V2) ;
  - déclenche un **rappel de minimisation** à la conception (« ce champ est-il vraiment nécessaire ? »).
- **Anonymisation / pseudonymisation** (V2) : générer un identifiant pseudonyme, dissocier les identifiants directs, floutage optionnel des visages sur photos (exploratoire).
- **GPS flou** : option pour arrondir/décaler la position enregistrée (protéger la localisation exacte de personnes) quand la précision fine n'est pas nécessaire.

## 4. Mineurs & données de santé

- Champ « âge » relié à une **règle de protection** : si mineur, exiger le consentement d'un tuteur (écran dédié) et restreindre les champs collectés selon la config projet.
- Données de santé : catégorie sensible par défaut (chiffrement champ en V2, exclusion IA, accès restreint aux rôles autorisés — [10_DATABASE §6](10_DATABASE.md)).

## 5. Rétention & effacement (côté enquêtés)

- Politique de **rétention paramétrable** par projet (durée de conservation, purge automatique).
- Procédure d'**effacement d'un enquêté** sur demande (recherche par identifiant, suppression logique + purge, journalisée dans l'audit log).
- Registre des traitements exportable (RGPD).

## 6. Conformité juridique (à produire avant la première vente)

Documents contractuels manquants, à rédiger (modèles) :

| Document | Rôle | Échéance |
|---|---|---|
| Conditions Générales d'Utilisation (CGU) | cadre d'usage | avant bêta publique |
| Politique de confidentialité | information des personnes | avant bêta publique |
| DPA (accord de sous-traitance) | exigé par les clients Enterprise/bailleurs | avant 1er client payant |
| Mentions sous-traitants | hébergeur UE, fournisseur LLM (opt-out) | avec la politique de confidentialité |
| Politique de rétention & effacement | opérationnalise §5 | V1 |

## 7. Argument commercial

Bien traité, ce chapitre devient un **différenciateur frontal** face à Kobo (minimal) et Esri (orienté entreprise, pas do-no-harm) : « la seule plateforme de collecte pensée pour protéger **les personnes enquêtées**, pas seulement vos données ». À mettre en avant dans la [présentation client](22_PRESENTATION.md) et l'[analyse concurrentielle](14_COMPETITIVE_ANALYSIS.md).

## 8. Impact roadmap

- **V0** : minimisation de base (marquage sensible → exclusion export/IA), texte de consentement simple dans le formulaire.
- **V1** : module de consentement complet (CONSENT-01), rétention paramétrable, effacement enquêté, CGU/confidentialité/DPA.
- **V2** : chiffrement au niveau champ, pseudonymisation, GPS flou, floutage visages (exploratoire), protections mineurs avancées.
