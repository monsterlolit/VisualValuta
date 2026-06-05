export interface HistoryPoint {
    date: string;
    value: number;
}

export interface CurrencyBase {
    code: string;
    name: string;
    flag: string;
    baseRate: number;
}

export interface CurrencyData extends CurrencyBase {
    currentRate: number;
    previousRate: number;
    change: number;
    changePercent: number;
    history: Record<string, HistoryPoint[]>;
    baseCurrency: "RUB" | "EUR"; // ← НОВОЕ: относительно какой валюты показывается курс
}

export type Timeframe = "1Д" | "1Н" | "1М" | "1Г";
export type CurrencySource = "ЦБ РФ" | "ЕЦБ" | "Мосбиржа";
