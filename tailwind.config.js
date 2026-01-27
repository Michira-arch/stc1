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
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    },
    plugins: [],
}
