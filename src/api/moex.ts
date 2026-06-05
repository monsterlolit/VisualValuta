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
 * Фильтруем только пары к RUB на основной площадке CETS с реальными торгами.
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

    // Берём только основные TOM-пары на CETS (это основная площадка с реальным курсом)
    const rubPairs = securities.filter(
        (s) =>
            s.boardid === "CETS" &&
            s.secid.endsWith("TOM") && // только TOM (основной рынок)
            s.secid.includes("RUB") &&
            !s.secid.startsWith("RUB"), // исключаем сам рубль
    );

    const result: { security: MoexSecurity; market: MoexMarketData }[] = [];

    for (const sec of rubPairs) {
        const market = marketMap.get(`${sec.secid}-${sec.boardid}`);
        if (!market) continue;

        // ВАЖНО: берём LAST цену (последняя сделка), это и есть реальный курс
        // Если LAST нет, пробуем WAPRICE, потом MARKETPRICE2
        const lastPrice = market.last ?? market.waprice ?? market.marketprice2;

        if (lastPrice === null || lastPrice === undefined || lastPrice === 0) {
            continue; // пропускаем пары без торгов
        }

        // Подменяем last на валидное значение для дальнейшей обработки
        const validMarket: MoexMarketData = {
            ...market,
            last: lastPrice,
        };

        // Проверяем, что торги идут (статус T = traded)
        if (market.tradingstatus && market.tradingstatus !== "T") {
            // всё равно показываем, но с последней известной ценой
        }

        result.push({ security: sec, market: validMarket });
    }

    return result;
}
