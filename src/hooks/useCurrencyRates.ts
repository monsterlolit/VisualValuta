import { useState, useEffect, useCallback } from "react";
import { fetchCbrRates, fetchCbrHistory } from "../api/cbr";
import {
    fetchFrankfurterRates,
    fetchFrankfurterHistory,
} from "../api/frankfurter";
import { fetchAllMoexCurrencies } from "../api/moex";
import {
    mapCbrToCurrencyData,
    mapFrankfurterToCurrencyData,
    mapMoexToCurrencyData,
} from "../lib/currencyMapper";
import type { CurrencyData, HistoryPoint } from "../types/currency";

export type CurrencySource = "ЦБ РФ" | "ЕЦБ" | "Мосбиржа";

interface UseCurrencyRatesReturn {
    currencies: CurrencyData[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    hasRuble: boolean;
}

export const useCurrencyRates = (
    source: CurrencySource,
): UseCurrencyRatesReturn => {
    const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasRuble, setHasRuble] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            let data: CurrencyData[] = [];

            if (source === "ЦБ РФ") {
                const cbrData = await fetchCbrRates();

                // Параллельно загружаем историю для всех валют
                const histories = await Promise.all(
                    cbrData.map(async (c) => {
                        const [h1d, h1w, h1m, h1y] = await Promise.all([
                            fetchCbrHistory(c.code, 1),
                            fetchCbrHistory(c.code, 7),
                            fetchCbrHistory(c.code, 30),
                            fetchCbrHistory(c.code, 365),
                        ]);
                        return {
                            code: c.code,
                            history: {
                                "1Д": h1d,
                                "1Н": h1w,
                                "1М": h1m,
                                "1Г": h1y,
                            },
                        };
                    }),
                );

                const historyMap = new Map(
                    histories.map((h) => [h.code, h.history]),
                );

                data = cbrData.map((c) =>
                    mapCbrToCurrencyData(c, historyMap.get(c.code) || {}),
                );
                setHasRuble(true);
            } else if (source === "ЕЦБ") {
                const frankData = await fetchFrankfurterRates("EUR");
                const filteredFrank = frankData.filter((f) => f.code !== "RUB");

                // Загружаем историю за год ОДНИМ запросом для всех валют
                const symbols = filteredFrank.map((f) => f.code);
                let historyMap: Record<string, HistoryPoint[]> = {};
                try {
                    historyMap = await fetchFrankfurterHistory(
                        "EUR",
                        symbols,
                        365,
                    );
                } catch (e) {
                    console.warn("Failed to load Frankfurter history", e);
                }

                data = filteredFrank.map((f) =>
                    mapFrankfurterToCurrencyData(f, historyMap[f.code] || []),
                );
                setHasRuble(false);
            } else if (source === "Мосбиржа") {
                const pairs = await fetchAllMoexCurrencies();
                data = pairs
                    .map((p) =>
                        mapMoexToCurrencyData(p.market, p.security.secid),
                    )
                    .filter((c): c is CurrencyData => c !== null);
                setHasRuble(true);
            }

            setCurrencies(data);
        } catch (err) {
            console.error("Failed to load currency rates:", err);
            setError("Не удалось загрузить курсы.");
            setCurrencies([]);
        } finally {
            setLoading(false);
        }
    }, [source]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return { currencies, loading, error, refresh: loadData, hasRuble };
};
