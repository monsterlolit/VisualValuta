import type { MoexResponse, MoexSecurity, MoexMarketData } from "../types/moex";
import type { HistoryPoint } from "../types/currency";

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

export async function fetchAllMoexCurrencies(): Promise<
    { security: MoexSecurity; market: MoexMarketData }[]
> {
    const url = `${BASE_URL}/engines/currency/markets/selt/securities.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch MOEX currencies");

    const data: MoexResponse = await response.json();

    const securities = parseMoexSection<MoexSecurity>(data.securities);
    const marketdata = parseMoexSection<MoexMarketData>(data.marketdata);

    const marketMap = new Map<string, MoexMarketData>();
    for (const m of marketdata) {
        const key = `${m.secid}-${m.boardid}`;
        marketMap.set(key, m);
    }

    const rubPairs = securities.filter(
        (s) =>
            s.boardid === "CETS" &&
            s.currencyid === "RUB" &&
            s.faceunit &&
            s.faceunit !== "RUB" &&
            s.secid.endsWith("TOM"),
    );

    const result: { security: MoexSecurity; market: MoexMarketData }[] = [];

    for (const sec of rubPairs) {
        const market = marketMap.get(`${sec.secid}-${sec.boardid}`);
        if (!market) continue;

        const price =
            market.waprice ??
            market.closeprice ??
            market.last ??
            market.prevprice;

        if (price === null || price === undefined || price === 0) {
            continue;
        }

        const validMarket: MoexMarketData = {
            ...market,
            last: price,
        };

        result.push({ security: sec, market: validMarket });
    }

    return result;
}

export async function fetchMoexHistoryForCurrency(
    secid: string,
    days: number,
): Promise<HistoryPoint[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const url = `${BASE_URL}/history/engines/currency/markets/selt/securities/${secid}.json?from=${formatDate(startDate)}&till=${formatDate(endDate)}`;
    const response = await fetch(url);
    if (!response.ok) {
        console.warn("Не удалось загрузить историю Мосбиржи", url);
        return [];
    }

    const data = await response.json();
    if (!data.history || !data.history.data) return [];

    const columns = data.history.columns;
    const tradeDateIdx = columns.indexOf("TRADEDATE");
    const closeIdx = columns.indexOf("CLOSE");
    const legalCloseIdx = columns.indexOf("LEGALCLOSEPRICE");
    const wapriceIdx = columns.indexOf("WAPRICE");
    const boardIdIdx = columns.indexOf("BOARDID");
    const secIdIdx = columns.indexOf("SECID");

    const dateMap = new Map<string, number>();

    for (const row of data.history.data) {
        const rowSecId = secIdIdx !== -1 ? row[secIdIdx] : secid;
        const rowBoardId = boardIdIdx !== -1 ? row[boardIdIdx] : "CETS";

        if (rowSecId !== secid || rowBoardId !== "CETS") continue;

        const dateStr = row[tradeDateIdx];
        const legalClose = legalCloseIdx !== -1 ? row[legalCloseIdx] : null;
        const wapr = wapriceIdx !== -1 ? row[wapriceIdx] : null;
        const close = closeIdx !== -1 ? row[closeIdx] : null;

        const value = legalClose ?? wapr ?? close;

        if (dateStr && value !== null && value !== undefined && value > 0) {
            dateMap.set(dateStr, parseFloat(value));
        }
    }

    const history: HistoryPoint[] = [];
    const sortedDates = Array.from(dateMap.keys()).sort();

    for (const dateStr of sortedDates) {
        const [yyyy, mm, dd] = dateStr.split("-");
        const dateObj = new Date(
            parseInt(yyyy),
            parseInt(mm) - 1,
            parseInt(dd),
        );
        const dateFormatted = dateObj.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
        });
        history.push({
            date: dateFormatted,
            value: dateMap.get(dateStr)!,
        });
    }

    return history;
}
