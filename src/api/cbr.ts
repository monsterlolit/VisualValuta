import type { CbrResponse } from "../types/cbr";
import type { HistoryPoint } from "../types/currency";

const BASE_URL = "https://www.cbr-xml-daily.ru";

export interface CbrRateResult {
    id: string;
    code: string;
    name: string;
    nominal: number;
    value: number;
    previous: number;
    change: number;
    changePercent: number;
}

export async function fetchCbrRates(): Promise<CbrRateResult[]> {
    const response = await fetch(`${BASE_URL}/daily_json.js`);
    if (!response.ok) throw new Error("Failed to fetch CBR rates");

    const data: CbrResponse = await response.json();

    return Object.values(data.Valute).map((valute) => {
        const change = valute.Value - valute.Previous;
        const changePercent =
            valute.Previous !== 0 ? (change / valute.Previous) * 100 : 0;

        return {
            id: valute.ID,
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

export async function fetchCbrHistoryForCurrency(
    id: string,
    days: number,
): Promise<HistoryPoint[]> {
    if (!id || typeof id !== "string") {
        console.error(
            "❌ Ошибка: ID валюты не передан в fetchCbrHistoryForCurrency!",
            id,
        );
        return [];
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    };

    const date1 = formatDate(startDate);
    const date2 = formatDate(endDate);

    const apiUrl = `/cbr-api/scripts/XML_dynamic.asp?date_req1=${date1}&date_req2=${date2}&VAL_NM_RQ=${id}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(
                "❌ Ошибка HTTP при запросе истории ЦБ:",
                response.status,
            );
            return [];
        }

        const text = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const records = xmlDoc.getElementsByTagName("Record");

        const history: HistoryPoint[] = [];
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const dateStr = record.getAttribute("Date");
            const valueNode = record.getElementsByTagName("Value")[0];
            const nominalNode = record.getElementsByTagName("Nominal")[0];

            if (dateStr && valueNode && nominalNode) {
                const valueStr = valueNode.textContent || "0";
                const nominalStr = nominalNode.textContent || "1";

                const value = parseFloat(valueStr.replace(",", "."));
                const nominal = parseInt(nominalStr, 10);

                const [dd, mm, yyyy] = dateStr.split(".");
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
                    value: value / nominal,
                });
            }
        }

        return history;
    } catch (error) {
        console.error("Критическая ошибка при парсинге XML ЦБ РФ:", error);
        return [];
    }
}
