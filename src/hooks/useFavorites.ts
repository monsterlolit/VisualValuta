import { useState, useEffect } from "react";

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("currency_favorites");
            return saved ? JSON.parse(saved) : ["USD", "EUR"];
        }
        return ["USD", "EUR"];
    });

    useEffect(() => {
        localStorage.setItem("currency_favorites", JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (code: string) => {
        setFavorites((prev) =>
            prev.includes(code)
                ? prev.filter((c) => c !== code)
                : [...prev, code],
        );
    };

    return { favorites, toggleFavorite };
};
