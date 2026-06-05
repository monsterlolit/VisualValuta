import type { MoexResponse, MoexSecurity, MoexMarketData } from "../types/moex";

const BASE_URL = "https://iss.moex.com/iss";

function parseMoexSection<T>(section: {
    columns: string[];
    data: any[][];
}): T[] {
    return section.data.map((row) => {
        const obj: any = {};
        section.columns.forEach((col, index) => {
            obj[col.toLowerCase()] = row[index];
        });
        return obj as T;
    });
}

/**
 * Получает ВСЕ валютные пары с Мосбиржи одним запросом.
 * Фильтруем только пары к RUB на основной площадке CETS.
 */
export async function fetchAllMoexCurrencies(): Promise<
    { security: MoexSecurity; market: MoexMarketData }[]
> {
    const url = `${BASE_URL}/engines/currency/markets/selt/securities.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch MOEX currencies");

    const data: MoexResponse = await response.json();

    const securities = parseMoexSection<MoexSecurity>(data.securities);
    const marketdata = parseMoexSection<MoexMarketData>(data.marketdata);

    // Индексируем marketdata по secid+boardid
    const marketMap = new Map<string, MoexMarketData>();
    for (const m of marketdata) {
        const key = `${m.secid}-${m.boardid}`;
        marketMap.set(key, m);
    }

    // Берём пары к RUB на CETS (основная площадка)
    // ВАЖНО: не фильтруем по TOM, берём все пары с реальными данными
    const rubPairs = securities.filter(
        (s) =>
            s.boardid === "CETS" &&
            s.secid.includes("RUB") &&
            !s.secid.startsWith("RUB"), // исключаем сам рубль
    );

    const result: { security: MoexSecurity; market: MoexMarketData }[] = [];

    for (const sec of rubPairs) {
        const market = marketMap.get(`${sec.secid}-${sec.boardid}`);
        if (!market) continue;

        // Берём LAST цену или WAPRICE или MARKETPRICE2
        const lastPrice = market.last ?? market.waprice ?? market.marketprice2;

        if (lastPrice === null || lastPrice === undefined || lastPrice === 0) {
            continue; // пропускаем пары без торгов
        }

        const validMarket: MoexMarketData = {
            ...market,
            last: lastPrice,
        };

        result.push({ security: sec, market: validMarket });
    }

    // Убираем дубликаты: оставляем только TOM для каждой валюты
    const uniqueByCode = new Map<
        string,
        { security: MoexSecurity; market: MoexMarketData }
    >();
    for (const item of result) {
        const match = item.security.secid.match(/^([A-Z]{3})RUB/);
        if (match) {
            const code = match[1];
            const isTom = item.security.secid.includes("TOM");
            const existing = uniqueByCode.get(code);

            // Предпочитаем TOM, если есть
            if (
                !existing ||
                (isTom && !existing.security.secid.includes("TOM"))
            ) {
                uniqueByCode.set(code, item);
            }
        }
    }

    return Array.from(uniqueByCode.values());
}
