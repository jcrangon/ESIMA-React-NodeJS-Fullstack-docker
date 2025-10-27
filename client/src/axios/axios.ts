import axios from "axios";
import type { AxiosInstance } from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// --- Instance unique ---
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

/// ============================================================================
/// 📘 Résumé pédagogique — Instance Axios centralisée
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Fournir **une seule instance Axios** partagée dans toute l’application :
/**
 ✅ URL de base automatique (selon .env)
 ✅ Cookies envoyés (authentification sécurisée)
 ✅ Headers JSON par défaut
*/
///
/// 🔹 Pourquoi créer une instance ?
/**
 ✔ Pas besoin de répéter url + headers dans chaque requête
 ✔ Facile d’ajouter :
    - intercepteurs JWT (refresh token)
    - gestion d’erreurs globales
    - loaders automatiques
 ✔ Garantit la **cohérence** des communications backend
*/
///
/// 🔹 Gestion des environnements
/// La base API s’adapte automatiquement via :
/**
 import.meta.env.VITE_API_URL
*/
/// ⚠️ Les variables doivent commencer par `VITE_` pour être accessibles au front.
///
/// En development : `.env.development`  
/// En production : `.env.production`  
///
///
/// 🔹 Paramètre important → `withCredentials: true`
/// Active l’envoi automatique des cookies HTTP-only avec chaque requête :  
/**
 ✅ indispensable pour une authentification sécurisée par cookies
*/
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat : une communication backend propre, maintenable et sécurisée
/// ============================================================================