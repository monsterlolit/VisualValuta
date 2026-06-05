import type { CbrResponse, CbrCurrency } from "../types/cbr";
import type { HistoryPoint } from "../types/currency";

const BASE_URL = "https://www.cbr-xml-daily.ru";

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
 * Детерминированная генерация истории на основе сида.
 * Одна и та же валюта + дата всегда дают одинаковый результат.
 * Никаких запросов к API, работает мгновенно.
 */
export function generateDeterministicHistory(
    code: string,
    baseRate: number,
    days: number,
): HistoryPoint[] {
    const data: HistoryPoint[] = [];
    const now = new Date();
    now.setHours(12, 0, 0, 0);

    // Сид на основе кода валюты (детерминированный)
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
        seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
    }

    // Детерминированный random
    const seededRandom = (s: number): number => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    let current = baseRate;
    const volatility = baseRate * 0.01; // 1% волатильность в день

    // Идём от старой даты к новой
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const daySeed = seed + i * 13 + date.getDate() * 7;
        const change = (seededRandom(daySeed) - 0.5) * volatility * 2;
        current += change;
        current = Math.max(current, baseRate * 0.7); // не даём уйти ниже 70%

        data.push({
            date: date.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
            }),
            value: parseFloat(current.toFixed(4)),
        });
    }

    // Гарантируем, что последняя точка = текущий курс
    if (data.length > 0) {
        data[data.length - 1].value = baseRate;
    }

    return data;
}
