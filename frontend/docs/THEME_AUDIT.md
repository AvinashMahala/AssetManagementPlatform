# Theme Audit Report

**Date:** December 18, 2025
**Status:** Action Required

## Overview
This audit identifies hardcoded hex color values in the codebase. These should be replaced with CSS variables or theme tokens to ensure consistency and ease of theming.

## Findings

### Hardcoded Hex Values
The following files contain hardcoded hex values that should be refactored:

1.  **`frontend/src/pages/meters/components/MeterList/MeterList.scss`**
    - Defines local CSS variables with hex values (e.g., `--meter-primary: #059669`).
    - **Recommendation:** Move these to a global theme file or use existing global variables.

2.  **`frontend/src/pages/meters/components/MeterDetail/MeterAnalytics.tsx`**
    - Hardcoded colors in Recharts components (e.g., `stroke="#8884d8"`, `fill="#82ca9d"`).
    - **Recommendation:** Define these colors in a constants file or use theme tokens.

3.  **`frontend/src/pages/files-page-enhanced/FilesPageEnhanced.scss`**
    - Defines local CSS variables (e.g., `--files-primary: #6366f1`).
    - **Recommendation:** Standardize these colors in the global theme.

4.  **`frontend/src/pages/TemplateEditor.tsx`**
    - Contains a hardcoded theme object: `styling: { theme: { primary: '#2563eb', ... } }`.
    - **Recommendation:** Extract this object to a configuration file or use the application's theme context.

5.  **`frontend/src/pages/leases/LeaseListPageEnhanced.scss`**
    - Defines local CSS variables (e.g., `--lease-primary: #059669`).
    - **Recommendation:** Standardize in global theme.

## Action Plan
1.  Create or update `src/styles/_theme.scss` or `src/styles/variables.css` with these colors.
2.  Replace hardcoded values with the new variables.
3.  For JS/TS files, use a theme hook or constants file.
