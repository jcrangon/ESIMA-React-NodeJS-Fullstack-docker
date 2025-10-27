export const theme = {
  colors: {
    // 🎨 Couleurs principales
    primary: "#4F67FF",          // Bleu néon moderne
    secondary: "#2ECC71",        // Accent vert

    // 🌑 Thème sombre
    background: "#1E1F25",       // Fond sombre (base)
    backgroundAlt: "#2A2C33",    // Fond secondaire (cartes, sections)

    // ✍️ Textes
    text: "#E8ECF2",             // Texte blanc doux
    textMuted: "#9AA0AB",        // Texte désactivé / labels

    // 🧩 Surfaces et contrastes
    surface: "#2D3039",          // Éléments UI
    border: "#3B3F4A",           // Bords discrets

    // 🔥 États interactifs
    success: "#2ECC71",
    warning: "#F1C40F",
    danger: "#E74C3C",
    info: "#3498DB",

    // ✨ Hover / Focus / Sélection
    primaryHover: "#6B7EFF",
    focus: "#6C78FF",
    selection: "rgba(79, 103, 255, 0.25)",

    // 🧪 Ombres
    shadow: "rgba(0, 0, 0, 0.35)",
  },

  // 🔤 Typographies
  fonts: {
    main: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    mono: "Menlo, Monaco, Consolas, 'Courier New', monospace",
  },

  // 📏 Rythme (espacements)
  spacing: (factor: number) => `${factor * 8}px`,
  radius: "10px",
  transition: "all 0.3s ease",
} as const;


export type ThemeType = typeof theme;

/// ============================================================================
/// 📘 Résumé pédagogique — Thème UI centralisé avec styled-components
/// ----------------------------------------------------------------------------
/// 🔹 Rôle du fichier
/// Ce fichier définit un **thème global** utilisé par styled-components.
/// Il réunit toutes les **valeurs de design** réutilisables de l’application :
/**
 ✅ Couleurs
 ✅ Polices
 ✅ Espacements
 ✅ Effets interactifs (hover, focus…)
 ✅ Ombres / surfaces / contrastes
*/
///
/// 🔹 Pourquoi un thème centralisé ?
/**
 ✔ Cohérence graphique automatique dans toute l’application
 ✔ Maintenance facilitée → modifier ici modifie toute l’interface
 ✔ Permet le **dark/light mode** simplement en changeant d’objet thème
 ✔ Evite le code dupliqué (anti-D.R.Y)
*/
///
/// 🔹 Typage automatique
/// `as const` → crée des types précis et immuables  
/// `ThemeType = typeof theme` → récupère automatiquement la signature du thème  
/// `styled.d.ts` → fusionne ce type avec `DefaultTheme`
///
/// Résultat : dans un styled-component :
/**
  ${({ theme }) => theme.colors.primary } ✅ auto-complété et typé
  theme.colors.primmary ❌ → erreur immédiate (sécurité)
*/
///
/// 🔹 Utilisation dans l’app
/// Avec ThemeProvider :
/**
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>
*/
///
/// ----------------------------------------------------------------------------
/// ✅ Conclusion : fondation solide pour une UI moderne, scalable et typée.
/// ============================================================================