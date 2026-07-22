# 26 — Sécurité : modèle de menace & plan

La sécurité n'est pas un chapitre parmi d'autres : la plateforme stocke la **localisation de personnes vulnérables**, des photos, des identités. Une compromission peut nuire physiquement à des gens. Ce document pose le **modèle de menace**, les **contrôles par couche**, et un **plan réaliste pour un développeur solo** (on ne peut pas tout faire d'un coup — on priorise ce qui protège vraiment).

Complémentaire : [09_ARCHITECTURE §7](09_ARCHITECTURE.md) (contrôles techniques), [25_ETHIQUE_CONSENTEMENT](25_ETHIQUE_CONSENTEMENT.md) (protection des enquêtés).

## 1. Actifs à protéger (par ordre de sensibilité)

1. **Données des enquêtés** : GPS précis, photos, identités, santé — le plus sensible.
2. **Comptes & tokens** : accès aux données de toute une organisation.
3. **Médias** stockés (S3) : photos géolocalisées.
4. **Clés** : LLM, S3, base, signature JWT.
5. **Disponibilité** : perte de données terrain = perte de confiance fatale.

## 2. Acteurs de menace

| Acteur | Motivation | Exemple |
|---|---|---|
| Attaquant opportuniste | vol de données, rançon | endpoint API non protégé, dépendance vulnérable |
| Acteur ciblé | nuire à des populations (localisation) | ciblage d'ONG en zone de conflit |
| Insider / appareil perdu | accès aux données locales | téléphone d'enquêteur volé |
| Fuite involontaire | mauvaise config | bucket S3 public, secret commité |
| Injection via données | exécution/altération | payload malveillant dans une réponse, prompt injection IA |

## 3. Surfaces d'attaque & contrôles par couche

| Couche | Menaces | Contrôles (V0 → +) |
|---|---|---|
| **Mobile** | vol d'appareil, extraction du stockage | tokens en SecureStore ; **verrou app** optionnel ; SQLCipher (ENT/V2) ; purge des soumissions synchronisées |
| **Transit** | interception | TLS 1.2+ obligatoire, HSTS, certificate pinning (V2) |
| **API** | accès non autorisé, IDOR, brute force | JWT + **RBAC vérifié à chaque requête**, scoping `organization_id` **et** filtrage par ressource, rate limiting auth+sync, verrouillage progressif |
| **Validation** | injection, payload malveillant | zod sur tout entrant, revalidation form-engine, taille/type des médias, jamais de SQL concaténé |
| **Base** | fuite, sur-exposition | chiffrement au repos, moindre privilège, **rôle SQL lecture seule** pour l'IA/analyse ([07_AI §2](07_AI.md)), audit log immuable |
| **Stockage médias** | bucket public, URL devinable | buckets **privés**, URLs présignées courtes (15 min), clés d'objet non devinables, chiffrement SSE |
| **IA** | prompt injection, fuite de données | données minimisées + champs sensibles exclus, sorties structurées validées, rôle SQL restreint pour le chat-données |
| **Secrets / CI** | fuite de clés | env uniquement, jamais commité, scan de secrets en CI, rotation documentée |
| **Dépendances** | supply chain | `pnpm audit` + Dependabot en CI, lockfile, revue des ajouts |

## 4. Ce qu'on ne vibecode pas à l'aveugle

Cohérent avec [24 §6](24_RISQUES_ET_LACUNES.md). Le code généré par IA doit être **relu ligne à ligne** (et testé) sur : **auth/JWT/refresh, RBAC/scoping multi-tenant, chiffrement, presigned URLs, moteur de sync**. Ce sont les points où une erreur silencieuse = fuite. Écrire des **tests d'isolation inter-tenants et inter-rôles** dès le premier module protégé.

## 5. Plan réaliste (solo)

### Quick wins V0 (peu de coût, gros impact)
- [ ] TLS partout ; secrets en env ; `.env.example` sans valeurs.
- [ ] Scan de secrets + `pnpm audit` en CI (bloquant sur critique).
- [ ] Buckets privés + URLs présignées courtes ; clés d'objet non devinables.
- [ ] RBAC + scoping `organization_id` avec **tests d'isolation** (le test le plus rentable du projet).
- [ ] Rate limiting sur `/auth` et `/sync`.
- [ ] Tokens mobiles en SecureStore ; déconnexion purge les tokens.

### V1
- [ ] Audit log immuable des actions sensibles (UI de consultation minimale).
- [ ] Verrou app mobile optionnel ; purge configurable.
- [ ] Politique de **divulgation de vulnérabilités** (`SECURITY.md` : comment signaler, délai de réponse).
- [ ] Revue de sécurité avant bêta publique (peut être un audit externe ponctuel).

### V2 / ENT
- [ ] SQLCipher mobile, certificate pinning, chiffrement au niveau champ ([25 §3](25_ETHIQUE_CONSENTEMENT.md)).
- [ ] **Pentest externe** avant montée en charge / clients gouvernementaux.
- [ ] Antivirus médias, hébergement régional au choix.

## 6. Sauvegardes & continuité

- Sauvegardes **PITR** (WAL) en production ; **test de restauration** mensuel documenté (une sauvegarde non testée n'existe pas).
- Plan de continuité minimal : que faire en cas de perte d'un composant (base, stockage). Objectif : la garantie P9 (« aucune perte ») tient même en incident.

## 7. Réponse à incident (minimal)

Même solo, définir à l'avance : détecter (logs/Sentry/alertes), contenir (révoquer clés/tokens, isoler), notifier (obligations RGPD : 72 h ; informer les organisations concernées, et les enquêtés si risque élevé — lien [25](25_ETHIQUE_CONSENTEMENT.md)), corriger, documenter. Un `INCIDENT.md` d'une page suffit pour démarrer.
