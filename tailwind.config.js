const { platformSelect } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: "var(--color-primary)",
          "primary-foreground": "var(--color-primary-fg)",
          secondary: "var(--color-secondary)",
          "secondary-foreground": "var(--color-secondary-fg)",
          accent: "var(--color-accent)",
        },
      },
      fontFamily: {
        "plus-jakarta-sans": platformSelect({
          ios: "PlusJakartaSans-Regular",
          android: "PlusJakartaSansRegular",
          default: "PlusJakartaSansRegular",
        }),
        "plus-jakarta-sans-medium": platformSelect({
          ios: "PlusJakartaSans-Medium",
          android: "PlusJakartaSansMedium",
          default: "PlusJakartaSansMedium",
        }),
        "plus-jakarta-sans-bold": platformSelect({
          ios: "PlusJakartaSans-Bold",
          android: "PlusJakartaSansBold",
          default: "PlusJakartaSansBold",
        }),
      },
    },
  },
  plugins: [],
};
