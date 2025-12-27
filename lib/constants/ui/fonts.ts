import { isIOS } from "@/lib/utils/platformUtil";

export const fontFamilies = {
  PLUS_JAKARTA_SANS: {
    normal: isIOS() ? "PlusJakartaSans-Regular" : "PlusJakartaSansRegular",
    medium: isIOS() ? "PlusJakartaSans-Medium" : "PlusJakartaSansMedium",
    bold: isIOS() ? "PlusJakartaSans-Bold" : "PlusJakartaSansBold",
  },
};





