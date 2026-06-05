import type { CbrRateResult } from "../api/cbr";
import type { CurrencyData } from "../types/currency";
import type { FrankfurterCurrency } from "../types/frankfurter";
import type { MoexMarketData, MoexSecurity } from "../types/moex";

const CURRENCY_FLAGS: Record<string, string> = {
    USD: "🇺🇸",
    EUR: "🇪🇺",
    RUB: "🇷🇺",
    GBP: "🇬🇧",
    JPY: "🇯🇵",
    CHF: "🇨🇭",
    CNY: "🇨🇳",
    CAD: "🇨🇦",
    AUD: "🇦🇺",
    NZD: "🇳🇿",
    SEK: "🇸🇪",
    NOK: "🇳🇴",
    DKK: "🇩🇰",
    PLN: "🇵🇱",
    CZK: "🇨🇿",
    HUF: "🇭🇺",
    RON: "🇷🇴",
    BGN: "🇧🇬",
    ISK: "🇮🇸",
    TRY: "🇹🇷",
    KRW: "🇰🇷",
    INR: "🇮🇳",
    SGD: "🇸🇬",
    HKD: "🇭🇰",
    THB: "🇹🇭",
    MYR: "🇲🇾",
    IDR: "🇮🇩",
    PHP: "🇵🇭",
    TWD: "🇹🇼",
    ILS: "🇮🇱",
    KZT: "🇰🇿",
    UAH: "🇺🇦",
    BYN: "🇧🇾",
    AMD: "🇦🇲",
    GEL: "🇬🇪",
    AZN: "🇦🇿",
    KGS: "🇰🇬",
    TJS: "🇹🇯",
    TMT: "🇹🇲",
    UZS: "🇺🇿",
    MDL: "🇲🇩",
    MNT: "🇲🇳",
    VND: "🇻🇳",
    AED: "🇦🇪",
    SAR: "🇸🇦",
    QAR: "🇶🇦",
    KWD: "🇰🇼",
    BHD: "🇧🇭",
    OMR: "🇴🇲",
    JOD: "🇯🇴",
    EGP: "🇪🇬",
    IRR: "🇮🇷",
    LBP: "🇱🇧",
    BRL: "🇧🇷",
    MXN: "🇲🇽",
    ARS: "🇦🇷",
    CLP: "🇨🇱",
    COP: "🇨🇴",
    PEN: "🇵🇪",
    BOB: "🇧🇴",
    UYU: "🇺🇾",
    CUP: "🇨🇺",
    ZAR: "🇿🇦",
    NGN: "🇳🇬",
    ETB: "🇪🇹",
    KES: "🇰🇪",
    MAD: "🇲🇦",
    TND: "🇹🇳",
    DZD: "🇩🇿",
    RSD: "🇷🇸",
    BDT: "🇧🇩",
    XDR: "💹",
    GLD: "🥇",
    XAU: "🥇",
    XAG: "🥈",
};

const CURRENCY_NAMES: Record<string, string> = {
    USD: "Доллар США",
    EUR: "Евро",
    RUB: "Российский рубль",
    GBP: "Фунт стерлингов",
    JPY: "Японская иена",
    CHF: "Швейцарский франк",
    CNY: "Китайский юань",
    CAD: "Канадский доллар",
    AUD: "Австралийский доллар",
    NZD: "Новозеландский доллар",
    SEK: "Шведская крона",
    NOK: "Норвежская крона",
    DKK: "Датская крона",
    PLN: "Польский злотый",
    CZK: "Чешская крона",
    HUF: "Венгерский форинт",
    RON: "Румынский лей",
    BGN: "Болгарский лев",
    ISK: "Исландская крона",
    TRY: "Турецкая лира",
    KRW: "Южнокорейская вона",
    INR: "Индийская рупия",
    SGD: "Сингапурский доллар",
    HKD: "Гонконгский доллар",
    THB: "Тайский бат",
    MYR: "Малайзийский ринггит",
    IDR: "Индонезийская рупия",
    PHP: "Филиппинское песо",
    TWD: "Тайваньский доллар",
    ILS: "Израильский шекель",
    KZT: "Казахстанский тенге",
    UAH: "Украинская гривна",
    BYN: "Белорусский рубль",
    AMD: "Армянский драм",
    GEL: "Грузинский лари",
    AZN: "Азербайджанский манат",
    KGS: "Киргизский сом",
    TJS: "Таджикский сомони",
    TMT: "Туркменский манат",
    UZS: "Узбекский сум",
    MDL: "Молдавский лей",
    MNT: "Монгольский тугрик",
    VND: "Вьетнамский донг",
    AED: "Дирхам ОАЭ",
    SAR: "Саудовский риял",
    QAR: "Катарский риал",
    KWD: "Кувейтский динар",
    BHD: "Бахрейнский динар",
    OMR: "Оманский риал",
    JOD: "Иорданский динар",
    EGP: "Египетский фунт",
    IRR: "Иранский риал",
    BRL: "Бразильский реал",
    MXN: "Мексиканское песо",
    ARS: "Аргентинское песо",
    CLP: "Чилийское песо",
    COP: "Колумбийское песо",
    PEN: "Перуанский новый соль",
    BOB: "Боливиано",
    ZAR: "Южноафриканский рэнд",
    NGN: "Нигерийская найра",
    ETB: "Эфиопский быр",
    RSD: "Сербский динар",
    BDT: "Бангладешская така",
    XDR: "СДР (МВФ)",
    GLD: "Золото",
    XAU: "Золото",
    XAG: "Серебро",
};

export function getFlagByCode(code: string): string {
    return CURRENCY_FLAGS[code] || "🏳️";
}

export function getCurrencyName(code: string): string {
    return CURRENCY_NAMES[code] || code;
}

export function mapCbrToCurrencyData(cbr: CbrRateResult): CurrencyData {
    const baseRate = cbr.value / cbr.nominal;
    return {
        code: cbr.code,
        name: cbr.name || getCurrencyName(cbr.code),
        flag: getFlagByCode(cbr.code),
        baseRate,
        currentRate: baseRate,
        previousRate: cbr.previous / cbr.nominal,
        change: cbr.change / cbr.nominal,
        changePercent: cbr.changePercent,
        history: { "1Д": [], "1Н": [], "1М": [], "1Г": [] },
        baseCurrency: "RUB",
        source: "ЦБ РФ",
        nominal: cbr.nominal,
        id: cbr.id,
    };
}

export function mapFrankfurterToCurrencyData(
    frank: FrankfurterCurrency,
): CurrencyData {
    return {
        code: frank.code,
        name: getCurrencyName(frank.code),
        flag: getFlagByCode(frank.code),
        baseRate: frank.rate,
        currentRate: frank.rate,
        previousRate: frank.rate,
        change: 0,
        changePercent: 0,
        history: { "1Д": [], "1Н": [], "1М": [], "1Г": [] },
        baseCurrency: "EUR",
        source: "ЕЦБ",
        nominal: 1,
    };
}

export function mapMoexToCurrencyData(
    market: MoexMarketData,
    security: MoexSecurity,
): CurrencyData | null {
    const code = security.faceunit;
    if (!code || code === "RUB") return null;

    const currentRate = market.last ?? 0;
    if (currentRate === 0) return null;

    const change = market.change ?? 0;
    const previousRate = currentRate - change;
    const changePercent =
        previousRate !== 0 ? (change / previousRate) * 100 : 0;

    return {
        code,
        name: getCurrencyName(code),
        flag: getFlagByCode(code),
        baseRate: currentRate,
        currentRate,
        previousRate,
        change,
        changePercent,
        history: { "1Д": [], "1Н": [], "1М": [], "1Г": [] },
        baseCurrency: "RUB",
        source: "Мосбиржа",
        secid: security.secid,
        nominal: 1,
    };
}
