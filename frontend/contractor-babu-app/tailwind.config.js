/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#ffffff',
                foreground: '#0f172a',
                primary: {
                    DEFAULT: '#4F46E5', // Indigo 600 - Modern & Professional
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#F1F5F9', // Slate 100
                    foreground: '#0F172A', // Slate 900
                },
                destructive: {
                    DEFAULT: '#EF4444', // Red 500
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#F8FAFC', // Slate 50
                    foreground: '#64748B', // Slate 500
                },
                accent: {
                    DEFAULT: '#EEF2FF', // Indigo 50
                    foreground: '#4338CA', // Indigo 700
                },
                card: {
                    DEFAULT: '#ffffff',
                    foreground: '#020817',
                },
                popover: {
                    DEFAULT: '#ffffff',
                    foreground: '#020817',
                },
                border: '#E2E8F0', // Slate 200
                input: '#E2E8F0',
                ring: '#4F46E5',
            }
        },
    },
    plugins: [],
}
