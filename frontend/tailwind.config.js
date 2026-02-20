/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Inter', 'system-ui', 'sans-serif'], // Unify fonts for cleaner look
            },
            colors: {
                // Enterprise Blue Palette
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb', // Main Brand Color
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                },
                // Slate Grays for Neutral UI
                slate: {
                    50: '#f8fafc',  // Main Background
                    100: '#f1f5f9', // Hover Backgrounds
                    200: '#e2e8f0', // Borders
                    300: '#cbd5e1', // Icons / Disabled
                    400: '#94a3b8', // Secondary Text
                    500: '#64748b', // Body Text (Light)
                    600: '#475569', // Body Text (Main)
                    700: '#334155', // Headings / Strong Text
                    800: '#1e293b',
                    900: '#0f172a', // Primary Text / Dark elements
                    950: '#020617',
                },
                secondary: {
                    // Accent/Action color (e.g. Success/Callouts) - Keeping consistent with Primary for now or specific accents
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22c55e', // Success Green
                    600: '#16a34a',
                }
            },
            boxShadow: {
                'soft': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
                'elevation': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
