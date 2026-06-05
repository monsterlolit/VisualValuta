import React from "react";
import { IconRefreshCw, IconSun, IconMoon, IconTrendingUp } from "./icons";
import { SOURCES } from "../constants";
import type { CurrencySource } from "../types/currency";

interface HeaderProps {
    source: CurrencySource;
    setSource: (source: CurrencySource) => void;
    isDark: boolean;
    toggleDark: () => void;
    isInverseMode: boolean;
    setIsInverseMode: (isInverseMode: boolean) => void;
}

const SOURCE_HINTS: Record<CurrencySource, string> = {
    "ЦБ РФ": "Официальные курсы Банка России. Все валюты, включая рубль.",
    ЕЦБ: "Курсы Европейского центрального банка. Отображение относительно евро.",
    Мосбиржа:
        "Биржевые курсы валютных пар к рублю на MOEX (основная площадка CETS).",
};

export const Header: React.FC<HeaderProps> = ({
    source,
    setSource,
    isDark,
    toggleDark,
    isInverseMode,
    setIsInverseMode,
}) => (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-4 transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                <IconTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Курсы валют
            </h1>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsInverseMode(!isInverseMode)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    {isInverseMode
                        ? "Режим: 1 валюта = X RUB"
                        : "Режим: 1 RUB = X валюты"}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400">
                    <IconRefreshCw className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleDark}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                >
                    {isDark ? (
                        <IconSun className="w-5 h-5" />
                    ) : (
                        <IconMoon className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SOURCES.map((src) => (
                <button
                    key={src}
                    onClick={() => setSource(src)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        source === src
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                >
                    {src}
                </button>
            ))}
        </div>

        <div className="mt-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
            <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                <span className="font-semibold">💡 {source}:</span>{" "}
                {SOURCE_HINTS[source]}
            </p>
        </div>
    </header>
);
