import type { CbrResponse, CbrCurrency } from "../types/cbr";
import type { HistoryPoint } from "../types/currency";

// ВАЖНО: используем /cbr-api вместо прямого URL
// Vite проксирует это на https://www.cbr-xml-daily.ru
const CBR_BASE = "/cbr-api";

// Кэш для истории: ключ = "USD-2026-06-05", значение = курс
const historyCache = new Map<string, number>();

// Кэш для справочника валют (ID по коду)
let valuteIdsCache: Map<string, { id: string; nominal: number }> | null = null;

export async function fetchCbrRates(): Promise<CbrCurrency[]> {
    const response = await fetch(`${CBR_BASE}/daily_json.js`);
    if (!response.ok) throw new Error("Failed to fetch CBR rates");

    const data: CbrResponse = await response.json();

    // Параллельно сохраняем ID валют для истории
    if (!valuteIdsCache) {
        valuteIdsCache = new Map();
        Object.values(data.Valute).forEach((v) => {
            valuteIdsCache!.set(v.CharCode, { id: v.ID, nominal: v.Nominal });
        });
    }

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
 * Форматирует дату в формат для URL архива ЦБ: YYYY/MM/DD
 */
function formatDateForArchive(date: Date): string {
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
 * Генерирует список дат с разумной дискретизацией.
 * Для 1 года - раз в неделю (~52 точки)
 * Для 1 месяца - каждые 3 дня (~10 точек)
 * Для 1 недели - каждый день
 */
function generateDateSteps(days: number): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    let step = 1;
    if (days > 60)
        step = 7; // год → раз в неделю
    else if (days > 14)
        step = 3; // месяц → каждые 3 дня
    else if (days > 1) step = 1; // неделя → каждый день

    for (let i = days; i >= 0; i -= step) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    // Гарантируем что сегодняшняя дата всегда есть
    const lastDate = dates[dates.length - 1];
    if (lastDate && lastDate.toDateString() !== now.toDateString()) {
        dates.push(now);
    }

    return dates;
}

/**
 * Получает курс валюты на конкретную дату из архива ЦБ РФ.
 * Использует кэш чтобы не делать повторные запросы.
 */
async function fetchRateForDate(
    code: string,
    date: Date,
): Promise<number | null> {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const cacheKey = `${code}-${dateKey}`;

    if (historyCache.has(cacheKey)) {
        return historyCache.get(cacheKey)!;
    }

    const datePath = formatDateForArchive(date);
    const url = `${CBR_BASE}/archive/${datePath}/daily_json.js`;

    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const data: CbrResponse = await response.json();
        const valute = Object.values(data.Valute).find(
            (v) => v.CharCode === code,
        );

        if (!valute) return null;

        const rate = valute.Value / valute.Nominal;

        // Кэшируем ВСЕ валюты из этого запроса
        Object.values(data.Valute).forEach((v) => {
            const key = `${v.CharCode}-${dateKey}`;
            historyCache.set(key, v.Value / v.Nominal);
        });

        return rate;
    } catch {
        return null;
    }
}

/**
 * Загружает историю для одной валюты за указанный период.
 * Использует кэш и оптимальную дискретизацию.
 */
export async function fetchCbrHistoryForCurrency(
    code: string,
    days: number,
): Promise<HistoryPoint[]> {
    const dates = generateDateSteps(days);

    // Загружаем параллельно, но ограничиваем конкурентность
    const results: HistoryPoint[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < dates.length; i += BATCH_SIZE) {
        const batch = dates.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
            batch.map(async (date) => {
                const rate = await fetchRateForDate(code, date);
                if (rate === null) return null;
                return {
                    date: formatDateForDisplay(date),
                    value: rate,
                } as HistoryPoint;
            }),
        );

        for (const result of batchResults) {
            if (result) results.push(result);
        }
    }

    return results;
}

/**
 * Получает справочник ID валют (используется для fallback)
 */
export function getValuteId(
    code: string,
): { id: string; nominal: number } | null {
    return valuteIdsCache?.get(code) || null;
}
