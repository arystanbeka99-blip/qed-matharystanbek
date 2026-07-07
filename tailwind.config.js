/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "qed-indigo": "#4F46E5",
        "qed-purple": "#A855F7",
        "qed-coral": "#FF6B4A",
        "qed-gold": "#FFA800",
        "qed-bg": "#F4F6FA",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
