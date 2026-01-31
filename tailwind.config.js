/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                obsidian: {
                    base: '#2E3238', // Reference Ceramic Dark
                    surface: '#2E3238',
                    highlight: '#393d45',
                },
                ceramic: {
                    base: '#e0e5ec',
                    surface: '#e0e5ec',
                },
                accent: {
                    DEFAULT: '#10b981', // Emerald
                    glow: '#00f2ff', // Cyan from reference
                    amber: '#ffaa00', // Amber from reference
                },
                // Marketplace Colors
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: "#354F52",
                secondary: "#2F3E46",
                "market-accent": "#52796F", // Renamed from accent
                info: "#84A98C",
                light: "#CAD2C5",
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            boxShadow: {
                "neu-flat": "9px 9px 16px hsl(var(--shadow-dark)), -9px -9px 16px hsl(var(--shadow-light))",
                "neu-pressed": "inset 9px 9px 16px hsl(var(--shadow-dark)), inset -9px -9px 16px hsl(var(--shadow-light))",
                "neu-icon": "5px 5px 10px hsl(var(--shadow-dark)), -5px -5px 10px hsl(var(--shadow-light))",
                "neu-convex": "9px 9px 16px hsl(var(--shadow-dark)), -9px -9px 16px hsl(var(--shadow-light))",
                "neu-concave": "inset 9px 9px 16px hsl(var(--shadow-dark)), inset -9px -9px 16px hsl(var(--shadow-light))",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "caret-blink": {
                    "0%,70%,100%": { opacity: "1" },
                    "20%,50%": { opacity: "0" },
                },
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "caret-blink": "caret-blink 1.25s ease-out infinite",
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}
