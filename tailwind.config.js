/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#09090b", // Zinc-950 base
                foreground: "#fafafa", // Zinc-50 text
                primary: {
                    DEFAULT: "#bef264", // Lime-300
                    foreground: "#1a2e05", // Lime-950 text on primary
                },
                secondary: {
                    DEFAULT: "#a855f7", // Purple-500
                    foreground: "#fafafa",
                },
                card: {
                    DEFAULT: "#18181b", // Zinc-900
                    foreground: "#fafafa",
                },
                border: "#27272a", // Zinc-800
                input: "#27272a",
                ring: "#bef264", // Focus ring matching primary
            },
            borderRadius: {
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.25rem",
            },
        },
    },
    plugins: [],
}
