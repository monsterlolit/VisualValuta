import React, { useState, useMemo } from "react";
import { Header } from "./components/Header";
import { Converter } from "./components/Converter";
import { CurrencyItem } from "./components/CurrencyItem";
import { DetailView } from "./components/DetailView";
import {
    IconSearch,
    IconStar,
    IconTrendingUp,
    IconRefreshCw,
} from "./components/icons";
import { useTheme } from "./hooks/useTheme";
import { useIsDesktop } from "./hooks/useIsDesktop";
import { useFavorites } from "./hooks/useFavorites";
import {
    useCurrencyRates,
    type CurrencySource,
} from "./hooks/useCurrencyRates";
import type { CurrencyData } from "./types/currency";

const App: React.FC = () => {
    const { isDark, toggle: toggleDark } = useTheme();
    const isDesktop = useIsDesktop();
    const { favorites, toggleFavorite } = useFavorites();

    const [source, setSource] = useState<CurrencySource>("ЦБ РФ");
    const { currencies, loading, error, refresh, hasRuble } =
        useCurrencyRates(source);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<
        string | null
    >(null);
    const [isInverseMode, setIsInverseMode] = useState(false);

    const filteredCurrencies = useMemo(() => {
        return currencies.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFavorite = showFavoritesOnly
                ? favorites.includes(c.code)
                : true;
            return matchesSearch && matchesFavorite;
        });
    }, [currencies, searchQuery, showFavoritesOnly, favorites]);

    const selectedCurrency = useMemo(
        () => currencies.find((c) => c.code === selectedCurrencyCode),
        [currencies, selectedCurrencyCode],
    );

    const handleCurrencySelect = (currency: CurrencyData) => {
        setSelectedCurrencyCode(currency.code);
    };

    return (
        <>
            <style>{`
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/400.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/500.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/600.css');
        @import url('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/700.css');
        body { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
            <div
                className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <Header
                        source={source}
                        setSource={setSource}
                        isDark={isDark}
                        toggleDark={toggleDark}
                        isInverseMode={isInverseMode}
                        setIsInverseMode={setIsInverseMode}
                    />

                    {isDesktop ? (
                        // Desktop Layout
                        <div className="mt-6">
                            <div className="max-w-3xl mx-auto mb-8">
                                <Converter
                                    currencies={currencies}
                                    isDark={isDark}
                                    hasRuble={hasRuble}
                                    isInverseMode={isInverseMode}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                <div className="lg:col-span-7 xl:col-span-8">
                                    {loading ? (
                                        <div className="h-[500px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="animate-pulse text-gray-500 dark:text-gray-400">
                                                Загрузка курсов...
                                            </div>
                                        </div>
                                    ) : selectedCurrency ? (
                                        <div className="bg-gray-50 dark:bg-gray-950 p-1">
                                            <DetailView
                                                currency={selectedCurrency}
                                                isFavorite={favorites.includes(
                                                    selectedCurrency.code,
                                                )}
                                                onToggleFavorite={
                                                    toggleFavorite
                                                }
                                                isDark={isDark}
                                                isInverseMode={isInverseMode}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-[500px] flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center transition-colors duration-300">
                                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                                                <IconTrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                Выберите валюту
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                                Нажмите на любую валюту из
                                                списка справа, чтобы увидеть
                                                подробный график, аналитику и
                                                динамику изменений.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-5 xl:col-span-4">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                            <div className="relative mb-4">
                                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Найти валюту..."
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-gray-100 transition-all"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setShowFavoritesOnly(
                                                            !showFavoritesOnly,
                                                        )
                                                    }
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                                                        showFavoritesOnly
                                                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    <IconStar
                                                        className={`w-4 h-4 ${showFavoritesOnly ? "fill-yellow-500 text-yellow-600 dark:text-yellow-400" : ""}`}
                                                    />
                                                    {showFavoritesOnly
                                                        ? "Избранные"
                                                        : "Все"}
                                                </button>
                                                <button
                                                    onClick={refresh}
                                                    disabled={loading}
                                                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                    title="Обновить"
                                                >
                                                    <IconRefreshCw
                                                        className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${loading ? "animate-spin" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm border-b border-amber-200 dark:border-amber-800">
                                                {error}
                                            </div>
                                        )}

                                        <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                                            {loading &&
                                            currencies.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                    <div className="animate-pulse">
                                                        Загрузка...
                                                    </div>
                                                </div>
                                            ) : filteredCurrencies.length ===
                                              0 ? (
                                                <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                    <IconSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                    <p>Ничего не найдено</p>
                                                </div>
                                            ) : (
                                                filteredCurrencies.map(
                                                    (currency) => (
                                                        <CurrencyItem
                                                            key={currency.code}
                                                            currency={currency}
                                                            isFavorite={favorites.includes(
                                                                currency.code,
                                                            )}
                                                            onToggleFavorite={
                                                                toggleFavorite
                                                            }
                                                            onClick={
                                                                handleCurrencySelect
                                                            }
                                                            isDark={isDark}
                                                            isInverseMode={
                                                                isInverseMode
                                                            }
                                                        />
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Mobile Layout
                        <main className="pb-8 mt-4">
                            {selectedCurrency ? (
                                <DetailView
                                    currency={selectedCurrency}
                                    onBack={() => setSelectedCurrencyCode(null)}
                                    isFavorite={favorites.includes(
                                        selectedCurrency.code,
                                    )}
                                    onToggleFavorite={toggleFavorite}
                                    isDark={isDark}
                                    isInverseMode={isInverseMode}
                                />
                            ) : (
                                <>
                                    <Converter
                                        currencies={currencies}
                                        isDark={isDark}
                                        hasRuble={hasRuble}
                                        isInverseMode={isInverseMode}
                                    />
                                    <div className="px-4 mb-4 mt-6">
                                        <div className="relative">
                                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Найти валюту (например, EUR)"
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-gray-100 transition-all"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                                Список курсов
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        setShowFavoritesOnly(
                                                            !showFavoritesOnly,
                                                        )
                                                    }
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                        showFavoritesOnly
                                                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    }`}
                                                >
                                                    <IconStar
                                                        className={`w-4 h-4 ${showFavoritesOnly ? "fill-yellow-500 text-yellow-600 dark:text-yellow-400" : ""}`}
                                                    />
                                                    {showFavoritesOnly
                                                        ? "Избранные"
                                                        : "Все"}
                                                </button>
                                                <button
                                                    onClick={refresh}
                                                    disabled={loading}
                                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                                >
                                                    <IconRefreshCw
                                                        className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${loading ? "animate-spin" : ""}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none border-t border-gray-100 dark:border-gray-800 min-h-[50vh] transition-colors duration-300">
                                        {loading && currencies.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                <div className="animate-pulse">
                                                    Загрузка...
                                                </div>
                                            </div>
                                        ) : filteredCurrencies.length === 0 ? (
                                            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                                                <IconSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                <p>Ничего не найдено</p>
                                            </div>
                                        ) : (
                                            filteredCurrencies.map(
                                                (currency) => (
                                                    <CurrencyItem
                                                        key={currency.code}
                                                        currency={currency}
                                                        isFavorite={favorites.includes(
                                                            currency.code,
                                                        )}
                                                        onToggleFavorite={
                                                            toggleFavorite
                                                        }
                                                        onClick={
                                                            handleCurrencySelect
                                                        }
                                                        isDark={isDark}
                                                        isInverseMode={
                                                            isInverseMode
                                                        }
                                                    />
                                                ),
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </main>
                    )}
                </div>
            </div>
        </>
    );
};

export default App;
