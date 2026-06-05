import type { CbrResponse, CbrCurrency } from "../types/cbr";
import type { HistoryPoint } from "../types/currency";

const BASE_URL = "https://www.cbr-xml-daily.ru";

// Простой in-memory кэш
const historyCache = new Map<string, HistoryPoint[]>();

export async function fetchCbrRates(): Promise<CbrCurrency[]> {
    const response = await fetch(`${BASE_URL}/daily_json.js`);
    if (!response.ok) throw new Error("Failed to fetch CBR rates");

    const data: CbrResponse = await response.json();

    return Object.values(data.Valute).map((valute) => {
        const change = valute.Value - valute.Previous;
        const changePercent =
            valute.Previous !== 0 ? (change / valute.Previous) * 100 : 0;

        return {
            code: valute.CharCode,
            name: valute.Name,
            nominal: valute.Nominal,
            value: valute.Value,
            previous: valute.Previous,
            change,
            changePercent,
        };
    });
}

/**
 * Генерирует список дат с разумной дискретизацией,
 * чтобы не делать 365 запросов за год.
 */
function generateDateSteps(days: number): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    let step = 1;
    if (days > 30)
        step = 7; // год → раз в неделю (~52 точки)
    else if (days > 7)
        step = 3; // месяц → каждые 3 дня (~10 точек)
    else if (days > 1) step = 1; // неделя → каждый день

    for (let i = days; i >= 0; i -= step) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    // Гарантируем, что сегодняшняя дата всегда есть
    const lastDate = dates[dates.length - 1];
    if (lastDate && lastDate.toDateString() !== now.toDateString()) {
        dates.push(now);
    }

    return dates;
}

function formatDateForUrl(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
}

function formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
    });
}

/**
 * Загружает историю курса с ЦБ РФ за указанный период.
 * Использует кэш и разумную дискретизацию.
 */
export async function fetchCbrHistory(
    code: string,
    days: number,
): Promise<HistoryPoint[]> {
    const cacheKey = `${code}-${days}`;
    if (historyCache.has(cacheKey)) {
        return historyCache.get(cacheKey)!;
    }

    const dates = generateDateSteps(days);

    // Загружаем данные для каждой даты параллельно
    const results = await Promise.all(
        dates.map(async (date) => {
            try {
                const urlDate = formatDateForUrl(date);
                const response = await fetch(
                    `${BASE_URL}/archive/${urlDate}/daily_json.js`,
                );
                if (!response.ok) return null;

                const data: CbrResponse = await response.json();
                const valute = Object.values(data.Valute).find(
                    (v) => v.CharCode === code,
                );
                if (!valute) return null;

                return {
                    date: formatDateForDisplay(date),
                    value: valute.Value / valute.Nominal,
                } as HistoryPoint;
            } catch {
                return null;
            }
        }),
    );

    const history = results.filter((r): r is HistoryPoint => r !== null);

    historyCache.set(cacheKey, history);
    return history;
}
