// src/db/postgres.ts
import { PrismaClient } from "@prisma/client";

/** Détection d'env + logs */
const isProd = process.env.NODE_ENV === "production";

/** Évite Prisma.LogLevel (pas toujours exporté selon versions) */
type PrismaLogLevel = "query" | "info" | "warn" | "error";
const prismaLog = (isProd ? ["warn", "error"] : ["info", "warn", "error"]) as PrismaLogLevel[];

/** Type des options sans dépendre de Prisma.* */
const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: prismaLog,
  errorFormat: isProd ? "minimal" : "pretty",
};

/** Typage minimal et stable du middleware */
type PrismaMiddlewareParams = { model?: string; action?: string } & Record<string, unknown>;
type PrismaMiddlewareNext = (params: PrismaMiddlewareParams) => Promise<unknown>;

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createClient() {
  const client = new PrismaClient(prismaOptions);

  client.$use(async (params: PrismaMiddlewareParams, next: PrismaMiddlewareNext) => {
    const start = Date.now();
    try {
      const result = await next(params);
      const ms = Date.now() - start;

      if (!isProd) {
        const isObject = result && typeof result === "object";
        let size = "";
        if (Array.isArray(result)) {
          size = ` items=${result.length}`;
        } else if (isObject) {
          size = " item=1";
        }
        const model = params.model ?? "$internal";
        const action = params.action ?? "$op";
        console.log(`[prisma] ${model}.${action} (${ms} ms)${size}`);
      }
      return result;
    } catch (e) {
      const ms = Date.now() - start;
      const model = params.model ?? "$internal";
      const action = params.action ?? "$op";
      console.error(`[prisma] ${model}.${action} FAILED after ${ms} ms`);
      throw e;
    }
  });

  client.$on("beforeExit", async () => {
    if (!isProd) console.log("[prisma] beforeExit ⇒ disconnect");
    await client.$disconnect();
  });

  return client;
}

const prismaBase = globalThis.__prisma__ ?? createClient();
if (!isProd) globalThis.__prisma__ = prismaBase;

export const prisma = prismaBase;

/** Arrêt propre (SIGINT/SIGTERM) */
async function gracefulExit(signal: string) {
  try {
    console.log(`[prisma] Received ${signal}. Closing DB connections...`);
    await prisma.$disconnect();
  } catch (err) {
    console.error("[prisma] Error during disconnect:", err);
  }
}
process.on("SIGINT", () => void gracefulExit("SIGINT"));
process.on("SIGTERM", () => void gracefulExit("SIGTERM"));

/**
 * ────────────────────────────────────────────────────────────────
 * 🎓 Résumé pédagogique détaillé
 * ────────────────────────────────────────────────────────────────
 * ✅ Pourquoi ce fichier existe ?
 *    → Centralise une instance unique de Prisma pour éviter la saturation
 *      des connexions pendant le hot-reload en développement.
 *
 * ✅ Pourquoi un « Singleton » avec globalThis ?
 *    → En dev, lors du rafraîchissement du code (Vite/tsx/watch),
 *      plusieurs PrismaClient seraient créés → trop de connexions Postgres.
 *
 * ✅ À quoi sert le middleware $use ?
 *    → Il intercepte toutes les requêtes Prisma :
 *       - mesure du temps d’exécution
 *       - journalisation par modèle/opération
 *       - meilleur debugging sans logs SQL volumineux
 *
 * ✅ Typage custom
 *    → Certaines versions de Prisma n’exportant pas correctement `Prisma.*`,
 *      on utilise des types génériques robustes et indépendants.
 *
 * ✅ Arrêt propre
 *    → Avant que Node s’arrête (Docker/K8s/CTRL+C),
 *      Prisma ferme proprement les connexions (`beforeExit`, SIGINT, SIGTERM)
 *
 * ✅ Production vs Développement
 *    - Dev : logs détaillés
 *    - Prod : logs réduits (silencieux sauf erreurs)
 * ────────────────────────────────────────────────────────────────
 */