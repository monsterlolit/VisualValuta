import type { CurrencyData } from "../types/currency";
import { CURRENCIES_BASE } from "../constants";
import { generateHistory } from "../lib/generateHistory";

export const MOCK_DB: CurrencyData[] = CURRENCIES_BASE.map((c) => {
    const history1Y = generateHistory(c.baseRate, 365);
    const current = history1Y[history1Y.length - 1].value;
    const previous = history1Y[history1Y.length - 2].value;
    const change = current - previous;
    const changePercent = (change / previous) * 100;

    return {
        ...c,
        currentRate: current,
        previousRate: previous,
        change: change,
        changePercent: changePercent,
        history: {
            "1Д": generateHistory(c.baseRate, 1),
            "1Н": generateHistory(c.baseRate, 7),
            "1М": generateHistory(c.baseRate, 30),
            "1Г": history1Y,
        },
    };
});
