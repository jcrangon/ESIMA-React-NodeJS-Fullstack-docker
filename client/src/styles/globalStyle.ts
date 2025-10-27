import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.main};
    -webkit-font-smoothing: antialiased;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.selection};
  }
`;

/// ============================================================================
/// 📘 Résumé pédagogique — GlobalStyle dans styled-components
/// ----------------------------------------------------------------------------
/// 🔹 Objectif du fichier
/// Ce fichier applique des **styles globaux** à l’ensemble de l’application.
/// Il remplace le traditionnel `src/index.css` dans un projet React.
///
/// 🔹 Pourquoi utiliser `createGlobalStyle` ?
/// — Permet de définir le style global **directement dans l’univers styled-components**
/// — Tout le design devient **centralisé** et régi par le thème
/// — Les styles sont injectés une seule fois, au démarrage de l’app
/// — Les valeurs du **thème typé** sont accessibles ici (ex : theme.colors.text)
///
/// 🔹 Styles importants ici
/// - `box-sizing: border-box;` ➝ Mise en page plus cohérente  
/// - `margin: 0;` ➝ Supprime le margin par défaut du `body`  
/// - `-webkit-font-smoothing` ➝ Texte net sur écrans modernes  
/// - `::selection` ➝ Personnalisation de la couleur de sélection du texte
///
/// 🔹 Activation du style global
/// Le composant doit être placé **une seule fois** au sommet de l’arbre React :
/**
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <App />
  </ThemeProvider>
*/
/// Ainsi, toute l'UI adopte automatiquement le thème.
///
/// ----------------------------------------------------------------------------
/// ✅ Résultat : une apparence homogène, moderne et maintenable à l’échelle.
/// ============================================================================