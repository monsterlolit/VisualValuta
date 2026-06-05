import type { Timeframe, CurrencySource } from "../types/currency";

export const CURRENCIES_BASE = [
    { code: "USD", name: "Доллар США", flag: "🇺🇸", baseRate: 92.5 },
    { code: "EUR", name: "Евро", flag: "🇪🇺", baseRate: 99.8 },
    { code: "CNY", name: "Китайский юань", flag: "🇨🇳", baseRate: 12.75 },
    { code: "GBP", name: "Фунт стерлингов", flag: "🇬🇧", baseRate: 115.2 },
    { code: "JPY", name: "Японская иена", flag: "🇯🇵", baseRate: 0.61 },
    { code: "CHF", name: "Швейцарский франк", flag: "🇨🇭", baseRate: 104.3 },
    { code: "TRY", name: "Турецкая лира", flag: "🇹🇷", baseRate: 2.95 },
];

export const SOURCES: CurrencySource[] = ["ЦБ РФ", "ЕЦБ", "Мосбиржа"];

export const TIMEFRAMES: Timeframe[] = ["1Д", "1Н", "1М", "1Г"];
