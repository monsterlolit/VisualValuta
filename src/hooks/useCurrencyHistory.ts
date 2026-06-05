import { useState, useEffect } from "react";
import { fetchCbrHistoryForCurrency } from "../api/cbr";
import { fetchFrankfurterHistory } from "../api/frankfurter";
import type { HistoryPoint, Timeframe, CurrencyData } from "../types/currency";

const TIMEFRAME_DAYS: Record<Timeframe, number> = {
    "1Д": 1,
    "1Н": 7,
    "1М": 30,
    "1Г": 365,
};

interface UseCurrencyHistoryReturn {
    history: HistoryPoint[];
    loading: boolean;
}

/**
 * Ленивая загрузка истории для конкретной валюты.
 * Загружает только когда пользователь открывает DetailView.
 */
export const useCurrencyHistory = (
    currency: CurrencyData | null,
    timeframe: Timeframe,
): UseCurrencyHistoryReturn => {
    const [history, setHistory] = useState<HistoryPoint[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currency) {
            setHistory([]);
            return;
        }

        let cancelled = false;
        const loadHistory = async () => {
            setLoading(true);
            const days = TIMEFRAME_DAYS[timeframe];

            try {
                let data: HistoryPoint[] = [];

                if (currency.source === "ЦБ РФ") {
                    data = await fetchCbrHistoryForCurrency(
                        currency.code,
                        days,
                        currency.nominal,
                    );
                } else if (currency.source === "ЕЦБ") {
                    const historyMap = await fetchFrankfurterHistory(
                        "EUR",
                        [currency.code],
                        days,
                    );
                    data = historyMap[currency.code] || [];
                }

                if (!cancelled) {
                    setHistory(data);
                }
            } catch (error) {
                console.error("Failed to load history:", error);
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
        currency?.nominal,
        currency?.currentRate,
        timeframe,
    ]);

    return { history, loading };
};
