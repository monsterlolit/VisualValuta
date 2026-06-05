import type {
    FrankfurterResponse,
    FrankfurterCurrency,
} from "../types/frankfurter";
import type { HistoryPoint } from "../types/currency";

const BASE_URL = "https://api.frankfurter.dev/v1";

export async function fetchFrankfurterRates(
    base = "EUR",
): Promise<FrankfurterCurrency[]> {
    const response = await fetch(`${BASE_URL}/latest?from=${base}`);
    if (!response.ok) throw new Error("Failed to fetch Frankfurter rates");

    const data: FrankfurterResponse = await response.json();

    return Object.entries(data.rates).map(([code, rate]) => ({
        code,
        rate,
    }));
}

/**
 * Загружает историю за период ОДНИМ запросом.
 * Frankfurter идеально подходит для этого.
 */
export async function fetchFrankfurterHistory(
    base: string,
    symbols: string[],
    days: number,
): Promise<Record<string, HistoryPoint[]>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const symbolsParam = symbols.join(",");
    const url = `${BASE_URL}/${formatDate(startDate)}..${formatDate(endDate)}?from=${base}&to=${symbolsParam}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch Frankfurter history");

    const data = await response.json();
    const rates = data.rates as Record<string, Record<string, number>>;

    // Преобразуем { "2024-01-01": { USD: 1.1 }, ... } → { USD: [{date, value}, ...], ... }
    const result: Record<string, HistoryPoint[]> = {};

    for (const symbol of symbols) {
        result[symbol] = [];
    }

    const sortedDates = Object.keys(rates).sort();

    for (const dateStr of sortedDates) {
        const dateFormatted = new Date(dateStr).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
        });

        for (const symbol of symbols) {
            const value = rates[dateStr][symbol];
            if (value !== undefined) {
                result[symbol].push({
                    date: dateFormatted,
                    value,
                });
            }
        }
    }

    return result;
}
