import type { HistoryPoint } from "../types/currency";

export const generateHistory = (
    baseRate: number,
    days: number,
): HistoryPoint[] => {
    const data: HistoryPoint[] = [];
    let current = baseRate;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * (baseRate * 0.02);
        current += change;
        data.push({
            date: date.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
            }),
            value: parseFloat(current.toFixed(4)),
        });
    }

    return data;
};
