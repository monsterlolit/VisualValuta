import React from "react";
import type { Payload } from "recharts";
import type { HistoryPoint, BaseCurrency } from "../types/currency";
import { formatCurrency } from "../lib/formatCurrency";

interface CustomTooltipProps {
    active?: boolean;
    payload?: Payload[];
    isDark: boolean;
    baseCurrency?: BaseCurrency;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    isDark,
    baseCurrency = "RUB",
}) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload as HistoryPoint;
        return (
            <div
                className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-900 border-gray-800 text-white"} text-xs rounded-lg p-3 shadow-xl border`}
            >
                <p className="font-medium mb-1">{entry.date}</p>
                <p className="text-blue-400 dark:text-blue-300 font-bold">
                    {formatCurrency(entry.value, baseCurrency)}
                </p>
            </div>
        );
    }
    return null;
};
