import { useState, useEffect } from "react";
import { fetchCbrHistoryForCurrency } from "../api/cbr";
import { fetchFrankfurterHistory } from "../api/frankfurter";
import { fetchMoexHistoryForCurrency } from "../api/moex";
import type { HistoryPoint, Timeframe, CurrencyData } from "../types/currency";

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
    "1Д": 1,
    "1Н": 7,
    "1М": 30,
    "1Г": 365,
};

const historyMemCache = new Map<string, HistoryPoint[]>();

interface UseCurrencyHistoryReturn {
    history: HistoryPoint[];
    loading: boolean;
    error: string | null;
}

export const useCurrencyHistory = (
    currency: CurrencyData | null,
    timeframe: Timeframe,
): UseCurrencyHistoryReturn => {
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currency) {
            setHistory([]);
            return;
        }

        const memKey = `${currency.code}-${currency.source}-${timeframe}`;
        if (historyMemCache.has(memKey)) {
            setHistory(historyMemCache.get(memKey)!);
            return;
        }

        let cancelled = false;

        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            const days = TIMEFRAME_DAYS[timeframe];

            try {
                let data: HistoryPoint[] = [];

                if (currency.source === "ЦБ РФ" && currency.id) {
                    data = await fetchCbrHistoryForCurrency(currency.id, days);
                } else if (currency.source === "ЕЦБ") {
                    const historyMap = await fetchFrankfurterHistory(
                        "EUR",
                        [currency.code],
                        days,
                    );
                    data = historyMap[currency.code] || [];
                } else if (currency.source === "Мосбиржа" && currency.secid) {
                    data = await fetchMoexHistoryForCurrency(
                        currency.secid,
                        days,
                    );
                }

                if (!cancelled) {
                    historyMemCache.set(memKey, data);
                    setHistory(data);
                }
            } catch (err) {
                console.error("Failed to load history:", err);
                if (!cancelled) {
                    setError("Не удалось загрузить историю");
                    setHistory([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [
        currency?.code,
        currency?.source,
        timeframe,
        currency?.id,
        currency?.secid,
    ]);

    return { history, loading, error };
};
