import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });

  // _next();  // ❌ Ne pas appeler _next() ici après avoir envoyé une réponse
}

/// ============================================================================
/// 📘 Résumé pédagogique complet — Comprendre le middleware `errorHandler`
/// ----------------------------------------------------------------------------
/// 🔹 1. Son rôle
/// Ce middleware est **spécial** dans Express :
/// il sert à intercepter les erreurs remontées par d’autres middlewares
/// ou routes (par `throw`, `next(err)`, ou erreurs async).
///
/// Express détecte un middleware d’erreur grâce à sa signature **à 4 paramètres :**
///   `(err, req, res, next)`
///
/// 🔹 2. Fonctionnement
/// Lorsqu’une erreur est propagée dans Express :
///
/// - Express **saute** tous les middlewares classiques
///   (`(req, res, next)`) et **appelle directement**
///   ceux qui ont la signature `(err, req, res, next)`.
///
/// - Ici, `errorHandler` reçoit l’objet `err` (souvent une `Error` ou un objet personnalisé).
///
/// - Il :
/**    1️⃣ affiche l’erreur côté console (utile pour le debug)
 *     2️⃣ envoie une réponse JSON structurée au client avec :
 *         - un code HTTP (500 par défaut)
 *         - un message explicite
 */
///
/// Exemple de réponse JSON :
/**     {
 *        "error": "Invalid token"
 *     }
 */
///
/// 🔹 3. Le rôle du `_next()`
///
/// À la fin du middleware, tu appelles `_next()`.  
/// 👉 **Mais ici, cet appel est inutile et même potentiellement dangereux.**
///
/// Pourquoi ?
/// - En Express, dès que tu envoies une réponse avec `res.json()` ou `res.send()`,
///   la requête est **considérée comme terminée**.
/// - Appeler `_next()` après `res.json()` demande à Express de continuer la
///   chaîne de middlewares alors que la réponse est déjà envoyée.
/// - Cela peut entraîner une erreur du type :
/**     Error: Can't set headers after they are sent to the client */
///
/// Donc, **on ne doit pas appeler `_next()` ici**, sauf dans un cas particulier
/// (ex : tu veux chaîner plusieurs gestionnaires d’erreur successifs, ce qui est rare).
///
/// ✅ La bonne version est donc :
///
/// ```ts
/// export function errorHandler(
///   err: any,
///   _req: Request,
///   res: Response,
///   _next: NextFunction
/// ) {
///   console.error(err);
///   res.status(err.status || 500).json({
///     error: err.message || "Internal Server Error",
///   });
/// }
/// ```
///
/// 🔹 4. Où l’utiliser
/// - Ce middleware doit être **le dernier** déclaré dans ton app Express :
///
/// ```ts
/// import express from "express";
/// import { errorHandler } from "./middlewares/errorHandler";
///
/// const app = express();
///
/// // ... routes et autres middlewares
///
/// app.use(errorHandler); // <-- toujours à la fin !
/// ```
///
/// 🔹 5. Objectif pédagogique
///
/// Ce middleware illustre plusieurs notions importantes :
///
/// 1️⃣ **Le chaînage de middlewares dans Express**
///     → comment `next()` permet de propager une requête ou une erreur.
///
/// 2️⃣ **La gestion centralisée des erreurs**
///     → plutôt que de gérer les erreurs dans chaque route, on les centralise.
///
/// 3️⃣ **Les statuts HTTP**
///     → distinction entre les erreurs contrôlées (400, 401, 404) et les erreurs
///       serveur (500).
///
/// 4️⃣ **La différence entre middlewares "classiques" et "d’erreurs"**
///     → signature `(req, res, next)` vs `(err, req, res, next)`.
///
/// ----------------------------------------------------------------------------
/// En résumé :
/**
 * Ce middleware `errorHandler` agit comme un **pare-feu final** de ton application :
 *  - il capte toute erreur non gérée,
 *  - logue les détails côté serveur,
 *  - et renvoie au client une réponse JSON claire et uniforme.
 *
 * ➤ Pédagogiquement, il démontre :
 *   • le flux de propagation d’erreurs dans Express,
 *   • la logique des statuts HTTP,
 *   • et la bonne pratique de **ne pas appeler `_next()`** après avoir envoyé
 *     une réponse.
 */
/// ============================================================================
