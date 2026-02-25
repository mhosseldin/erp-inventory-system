/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        // Primary navy — sidebar, main headings, trust elements
        navy: {
          DEFAULT: "#1E3A5F",
          50: "#EFF4FA",
          100: "#D5E4F0",
          200: "#AECAE2",
          300: "#7CAECF",
          400: "#4D8FBB",
          500: "#2D6FA3",
          600: "#1E3A5F", // ← brand navy
          700: "#172D4A",
          800: "#102036",
          900: "#081422",
          950: "#040A12",
        },

        accent: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE", // ← accent-light (highlight backgrounds)
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB", // ← accent default
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },

        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
          text: "#166534",
        },

        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          text: "#991B1B",
        },

        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          text: "#92400E",
        },

        neutral: {
          DEFAULT: "#6B7280",
          light: "#F3F4F6",
        },

        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          border: "#E2E8F0",
        },
      },

      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "'Cascadia Code'",
          "'Fira Code'",
          "'Courier New'",
          "monospace",
        ],
      },

      fontSize: {
        "page-title": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        "section-title": [
          "1.125rem",
          { lineHeight: "1.75rem", fontWeight: "600" },
        ],
        "table-header": [
          "0.75rem",
          { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.05em" },
        ],
        body: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        secondary: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        kpi: ["1.875rem", { lineHeight: "2.25rem", fontWeight: "700" }],
      },

      spacing: {
        sidebar: "16rem", // w-64 = 256 px fixed sidebar
        "content-pad": "1.5rem", // p-6 on all content wrappers
      },

      borderRadius: {
        card: "0.5rem", // rounded-lg for cards
        badge: "9999px", // fully-pill badges
        btn: "0.375rem", // rounded-md for buttons
      },

      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        "card-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        dropdown:
          "0 10px 15px -3px rgb(0 0 0 / 0.10), 0 4px 6px -4px rgb(0 0 0 / 0.10)",
        sidebar: "2px 0 12px 0 rgb(0 0 0 / 0.15)",
      },

      transitionDuration: {
        DEFAULT: "150ms",
        fast: "100ms",
        slow: "300ms",
      },

      zIndex: {
        sidebar: "40",
        topbar: "30",
        dropdown: "50",
        drawer: "60",
        modal: "70",
        toast: "80",
      },
    },
  },

  plugins: [],
};
