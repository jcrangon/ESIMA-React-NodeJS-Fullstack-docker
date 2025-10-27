// src/db/postgres.ts
import { PrismaClient, type Prisma } from "@prisma/client";

/** Détection d'env + logs */
const isProd = process.env.NODE_ENV === "production";
const prismaLog: Prisma.LogLevel[] = isProd
  ? ["warn", "error"]
  : ["info", "warn", "error"]; // pas "query" car on trace via $extends

const prismaOptions: Prisma.PrismaClientOptions = {
  log: prismaLog,
  errorFormat: isProd ? "minimal" : "pretty",
};

/** Singleton (hot-reload safe) */
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

function createBaseClient() {
  return new PrismaClient(prismaOptions);
}

const base = globalThis.__prisma__ ?? createBaseClient();
if (!isProd) globalThis.__prisma__ = base;

/**
 * Remplace le middleware $use par un Query Extension ($extends)
 * → Compatible Node, Edge, Accelerate/Data Proxy
 */
export const prisma = base.$extends({
  query: {
    $allModels: {
      $allOperations: async ({ model, operation, args, query }) => {
        const start = Date.now();
        try {
          const result = await query(args);
          const ms = Date.now() - start;

          if (!isProd) {
            const size =
              Array.isArray(result) ? ` items=${result.length}` :
              result && typeof result === "object" ? " item=1" : "";
            console.log(`[prisma] ${model}.${operation} (${ms} ms)${size}`);
          }
          return result;
        } catch (e) {
          const ms = Date.now() - start;
          console.error(`[prisma] ${model}.${operation} FAILED after ${ms} ms`);
          throw e;
        }
      },
    },
  },
});

/** Arrêt propre (graceful) */
async function gracefulExit(signal: string) {
  try {
    console.log(`[prisma] Received ${signal}. Closing DB connections...`);
    await prisma.$disconnect();
  } catch (err) {
    console.error("[prisma] Error during disconnect:", err);
  } finally {
    // Laisse le process s'arrêter naturellement
  }
}

process.on("SIGINT", () => void gracefulExit("SIGINT"));
process.on("SIGTERM", () => void gracefulExit("SIGTERM"));

/** Hook beforeExit — certaines versions résolvent mal la surcharge TS → cast local */
type PrismaWithBeforeExit = PrismaClient & {
  $on(event: "beforeExit", listener: () => Promise<void> | void): void;
};
(base as PrismaWithBeforeExit).$on("beforeExit", async () => {
  if (!isProd) console.log("[prisma] beforeExit ⇒ disconnect");
  await prisma.$disconnect();
});

/**
 * ────────────────────────────────────────────────────────────────
 * 🎓 Résumé pédagogique détaillé
 * ────────────────────────────────────────────────────────────────
 * ✅ Pourquoi $extends au lieu de $use ?
 *    - Dans Edge/Data Proxy/Accelerate, le middleware $use n’est pas disponible.
 *    - Les Query Extensions ($extends) offrent un hook universel ($allModels/$allOperations)
 *      qui marche partout, y compris Edge.
 *
 * ✅ Ce que trace le logger :
 *    - Le couple modèle/opération (ex: User.findMany), la durée en ms,
 *      et une idée de la taille du résultat (items=…).
 *    - On n’active pas le log "query" natif pour éviter le doublon et protéger les logs.
 *
 * ✅ Singleton & hot-reload :
 *    - On garde une seule connexion via globalThis.__prisma__ pour éviter la saturation en dev.
 *
 * ✅ Arrêt propre :
 *    - SIGINT/SIGTERM + beforeExit ferment proprement les connexions (Docker/K8s/CLI).
 * ────────────────────────────────────────────────────────────────
 */
