import { useState, useEffect, useCallback } from "react";
import { fetchCbrRates } from "../api/cbr";
import { fetchFrankfurterRates } from "../api/frankfurter";
import { fetchAllMoexCurrencies } from "../api/moex";
import {
    mapCbrToCurrencyData,
    mapFrankfurterToCurrencyData,
    mapMoexToCurrencyData,
} from "../lib/currencyMapper";
import type { CurrencyData } from "../types/currency";

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
                // Теперь mapCbrToCurrencyData синхронный, никаких запросов истории!
                data = cbrData.map(mapCbrToCurrencyData);
                setHasRuble(true);
            } else if (source === "ЕЦБ") {
                const frankData = await fetchFrankfurterRates("EUR");
                const filtered = frankData.filter((f) => f.code !== "RUB");
                data = filtered.map((f) => mapFrankfurterToCurrencyData(f));
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
            setError("Не удалось загрузить курсы. Попробуйте позже.");
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
