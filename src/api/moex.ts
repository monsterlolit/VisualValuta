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

export async function fetchMoexData(secid: string): Promise<{
    securities: MoexSecurity[];
    marketdata: MoexMarketData[];
}> {
    const url = `${BASE_URL}/engines/currency/markets/selt/securities/${secid}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch MOEX data");

    const data: MoexResponse = await response.json();

    return {
        securities: parseMoexSection<MoexSecurity>(data.securities),
        marketdata: parseMoexSection<MoexMarketData>(data.marketdata),
    };
}

/**
 * Получает ВСЕ валютные пары с Мосбиржи одним запросом
 * Фильтрует только пары к RUB на основной площадке CETS
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

    // Берём только пары к RUB на основной площадке CETS
    const rubPairs = securities.filter(
        (s) =>
            s.boardid === "CETS" &&
            s.secid.includes("RUB") &&
            !s.secid.includes("RUB000"), // исключаем сам рубль
    );

    // Сопоставляем с marketdata
    const result: { security: MoexSecurity; market: MoexMarketData }[] = [];
    for (const sec of rubPairs) {
        const market = marketMap.get(`${sec.secid}-${sec.boardid}`);
        if (market && market.last !== null && market.last !== undefined) {
            result.push({ security: sec, market });
        }
    }

    // Убираем дубликаты (одна валюта может быть в TOM и TOD)
    const uniqueByCode = new Map<
        string,
        { security: MoexSecurity; market: MoexMarketData }
    >();
    for (const item of result) {
        const match = item.security.secid.match(/^([A-Z]{3})RUB/);
        if (match) {
            const code = match[1];
            // Предпочитаем TOM (основной рынок)
            const isTom = item.security.secid.includes("TOM");
            const existing = uniqueByCode.get(code);
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
