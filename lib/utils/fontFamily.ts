import { fontFamilies } from "../constants/ui/fonts";

export const getFontFamily = (
  isLTR: boolean,
  weight: "normal" | "medium" | "bold"
) => {
  // Using Plus Jakarta Sans for both LTR and RTL
  const selectedFontFamily = fontFamilies.PLUS_JAKARTA_SANS;
  return selectedFontFamily[weight];
};

