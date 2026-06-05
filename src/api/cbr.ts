import type { CbrResponse, CbrCurrency } from "../types/cbr";
import type { HistoryPoint } from "../types/currency";

const BASE_URL = "https://www.cbr-xml-daily.ru";
const CBR_XML_URL = "https://www.cbr.ru/scripts/XML_dynamic.asp";

// CORS proxy для обхода блокировки браузером
const CORS_PROXY = "https://corsproxy.io/?url=";

// ПОЛНЫЙ маппинг кодов валют на ID для XML API ЦБ РФ
const CURRENCY_IDS: Record<string, string> = {
    USD: "R01235",
    EUR: "R01239",
    GBP: "R01035",
    CNY: "R01375",
    JPY: "R01820",
    CHF: "R01775",
    TRY: "R01700J",
    KZT: "R01335",
    BYN: "R01090B",
    UAH: "R01720",
    AUD: "R01010",
    CAD: "R01350",
    SEK: "R01770",
    NOK: "R01535",
    DKK: "R01215",
    PLN: "R01565",
    CZK: "R01760",
    HUF: "R01135",
    RON: "R01585F",
    BGN: "R01085A",
    ISK: "R01245",
    KRW: "R01815",
    INR: "R01270",
    SGD: "R01625",
    HKD: "R01200",
    THB: "R01675",
    MYR: "R01530",
    IDR: "R01280",
    PHP: "R01560",
    TWD: "R01670",
    ILS: "R01250",
    AMD: "R01060",
    GEL: "R01210",
    AZN: "R01020A",
    KGS: "R01370",
    TJS: "R01670",
    TMT: "R01710A",
    UZS: "R01717",
    MDL: "R01500",
    MNT: "R01503",
    VND: "R01150",
    AED: "R01230",
    SAR: "R01580",
    QAR: "R01355",
    BHD: "R01080",
    OMR: "R01540",
    JOD: "R01255",
    EGP: "R01240",
    IRR: "R01300",
    BRL: "R01115",
    MXN: "R01525",
    ARS: "R01030",
    CLP: "R01110",
    COP: "R01120",
    PEN: "R01550",
    BOB: "R01105",
    ZAR: "R01810",
    NGN: "R01520",
    ETB: "R01800",
    RSD: "R01805F",
    BDT: "R01685",
    XDR: "R01589",
    // Добавляем недостающие
    DZD: "R01030",
    CUP: "R01395",
    NZD: "R01530",
    MMK: "R02005",
};

// Кэш истории в памяти (переживает ре-рендеры)
const historyCache = new Map<string, HistoryPoint[]>();

export async function fetchCbrRates(): Promise<CbrCurrency[]> {
    const response = await fetch(`${BASE_URL}/daily_json.js`);
    if (!response.ok) throw new Error("Failed to fetch CBR rates");

    const data: CbrResponse = await response.json();

    return Object.values(data.Valute).map((valute) => {
        const change = valute.Value - valute.Previous;
        const changePercent =
            valute.Previous !== 0 ? (change / valute.Previous) * 100 : 0;

        return {
            code: valute.CharCode,
            name: valute.Name,
            nominal: valute.Nominal,
            value: valute.Value,
            previous: valute.Previous,
            change,
            changePercent,
        };
    });
}

function formatDateForCbrXml(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function parseCbrXml(xmlString: string, nominal: number): HistoryPoint[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const records = xmlDoc.getElementsByTagName("Record");
    const history: HistoryPoint[] = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const dateStr = record.getAttribute("Date");
        const valueNode = record.getElementsByTagName("Value")[0];
        const nominalNode = record.getElementsByTagName("Nominal")[0];

        if (!dateStr || !valueNode) continue;

        // Используем номинал из XML если есть, иначе переданный
        const recordNominal = nominalNode
            ? parseInt(nominalNode.textContent || "1")
            : nominal;

        const valueText = valueNode.textContent || "0";
        const value = parseFloat(valueText.replace(",", "."));

        const [day, month, year] = dateStr.split(".");
        const date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
        );

        history.push({
            date: date.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
            }),
            value: value / recordNominal,
        });
    }

    return history;
}

/**
 * Загружает историю для ОДНОЙ валюты. Вызывается лениво из DetailView.
 * Использует кэш и CORS proxy.
 */
export async function fetchCbrHistoryForCurrency(
    code: string,
    days: number,
    nominal: number = 1,
): Promise<HistoryPoint[]> {
    const cacheKey = `${code}-${days}`;

    // Возвращаем из кэша если есть
    if (historyCache.has(cacheKey)) {
        return historyCache.get(cacheKey)!;
    }

    const currencyId = CURRENCY_IDS[code];
    if (!currencyId) {
        return [];
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateReq1 = formatDateForCbrXml(startDate);
    const dateReq2 = formatDateForCbrXml(endDate);

    const originalUrl = `${CBR_XML_URL}?date_req1=${dateReq1}&date_req2=${dateReq2}&VAL_NM_RZ=${currencyId}`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(originalUrl)}`;

    try {
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            throw new Error(`CBR XML API error: ${response.status}`);
        }

        const xmlString = await response.text();
        const history = parseCbrXml(xmlString, nominal);

        // Сохраняем в кэш
        historyCache.set(cacheKey, history);
        return history;
    } catch (error) {
        console.error(`Failed to fetch CBR history for ${code}:`, error);
        return [];
    }
}
