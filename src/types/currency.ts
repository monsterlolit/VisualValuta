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

export type BaseCurrency = "RUB" | "EUR";

export interface CurrencyData extends CurrencyBase {
    currentRate: number;
    previousRate: number;
    change: number;
    changePercent: number;
    history: Record<string, HistoryPoint[]>;
    baseCurrency: BaseCurrency;
    source: "ЦБ РФ" | "ЕЦБ" | "Мосбиржа";
    nominal: number; // НОВОЕ: нужен для корректной загрузки истории ЦБ
}

export type Timeframe = "1Д" | "1Н" | "1М" | "1Г";
export type CurrencySource = "ЦБ РФ" | "ЕЦБ" | "Мосбиржа";
