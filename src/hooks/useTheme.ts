import { useState, useEffect, useCallback } from "react";

export const useTheme = () => {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        const saved = localStorage.getItem("theme");
        if (saved === "dark") return true;
        if (saved === "light") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    const toggle = useCallback(() => setIsDark((prev) => !prev), []);

    return { isDark, toggle };
};
