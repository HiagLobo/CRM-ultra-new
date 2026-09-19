/**
 * Paleta única da marca CRM Imobiliário Ultra.
 * No design original cada tela declarava o mesmo objeto (sitePalette,
 * appPalette, donoPalette, recPalette, sobrePalette, buscarPalette, mp).
 * Aqui ficam centralizados — os componentes importam com o alias que usavam,
 * ex.: `import { palette as sitePalette } from "@/lib/palette"`.
 */
export const palette = {
  primary: "#4F46E5",
  dark: "#4338CA",
  deep: "#312E81",
  light: "#6366F1",
  lilac2: "#E0E7FF",
  lilac1: "#EEF2FF",
  ink: "#1C1A22",
  g700: "#4A4754",
  g500: "#807C8A",
  g300: "#D8D5DE",
  g100: "#F2F1F5",
  page: "#FAFAFB",
  white: "#FFFFFF",
  success: "#2E9E5B",
  warning: "#E0A82E",
  error: "#D64545",
  info: "#3E82E0",
  gold: "#E0A82E",
} as const;

export type Palette = typeof palette;
