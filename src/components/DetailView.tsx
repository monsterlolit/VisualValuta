import React, { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
} from "recharts";
import {
    IconArrowDownRight,
    IconArrowLeft,
    IconArrowUpRight,
    IconStar,
} from "./icons";
import { CustomTooltip } from "./CustomTooltip";
import type { CurrencyData, HistoryPoint, Timeframe } from "../types/currency";
import { TIMEFRAMES } from "../constants";
import { formatCurrency } from "../lib/formatCurrency";
import { useCurrencyHistory } from "../hooks/useCurrencyHistory";

interface DetailViewProps {
    currency: CurrencyData;
    onBack?: () => void;
    isFavorite: boolean;
    onToggleFavorite: (code: string) => void;
    isInverseMode: boolean;
}

export const DetailView: React.FC<DetailViewProps> = ({
    currency,
    onBack,
    isFavorite,
    onToggleFavorite,
    isInverseMode,
}) => {
    const [timeframe, setTimeframe] = useState<Timeframe>("1М");

    const { history: rawData, loading: historyLoading } = useCurrencyHistory(
        currency,
        timeframe,
    );

    const chartData: HistoryPoint[] = useMemo(() => {
        if (!isInverseMode) return rawData;
        return rawData.map((p) => ({
            date: p.date,
            value: p.value !== 0 ? 1 / p.value : 0,
        }));
    }, [rawData, isInverseMode]);

    const currentRate = isInverseMode
        ? 1 / currency.currentRate
        : currency.currentRate;
    const previousRate = isInverseMode
        ? 1 / currency.previousRate
        : currency.previousRate;
    const change = currentRate - previousRate;
    const changePercent =
        previousRate !== 0 ? (change / previousRate) * 100 : 0;
    const displayPositive = change >= 0;

    const isDark = document.documentElement.classList.contains("dark");
    const strokeColor = displayPositive
        ? isDark
            ? "#4ade80"
            : "#16a34a"
        : isDark
          ? "#f87171"
          : "#dc2626";
    const gradientId = `gradient-${currency.code}-${timeframe}`;

    const min = chartData.length
        ? Math.min(...chartData.map((d) => d.value))
        : 0;
    const max = chartData.length
        ? Math.max(...chartData.map((d) => d.value))
        : 0;

    const pairLabel = isInverseMode
        ? `${currency.baseCurrency} / ${currency.code}`
        : `${currency.code} / ${currency.baseCurrency}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
            <div className="max-w-3xl mx-auto px-4 pt-6">
                <div className="flex items-center justify-between mb-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            <IconArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </button>
                    )}
                    <div className="flex-1"></div>
                    <button
                        onClick={() => onToggleFavorite(currency.code)}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <IconStar
                            className={`w-6 h-6 transition-colors ${
                                isFavorite
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-400"
                            }`}
                        />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{currency.flag}</div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {currency.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {pairLabel}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                            {formatCurrency(currentRate, currency.baseCurrency)}
                        </span>
                        <span
                            className={`flex items-center text-sm font-semibold ${
                                displayPositive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            }`}
                        >
                            {displayPositive ? (
                                <IconArrowUpRight className="w-4 h-4 mr-1" />
                            ) : (
                                <IconArrowDownRight className="w-4 h-4 mr-1" />
                            )}
                            {Math.abs(change).toFixed(4)} (
                            {Math.abs(changePercent).toFixed(2)}%)
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                    {historyLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            Загрузка истории...
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 text-center px-4">
                            {currency.source === "Мосбиржа"
                                ? "История для Мосбиржи пока недоступна"
                                : "Нет данных за выбранный период"}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={256}>
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id={gradientId}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={strokeColor}
                                            stopOpacity={0.2}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={strokeColor}
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <YAxis
                                    domain={["dataMin - 1", "dataMax + 1"]}
                                    hide
                                />
                                <Tooltip
                                    content={<CustomTooltip isDark={isDark} />}
                                    cursor={{
                                        stroke: isDark ? "#6b7280" : "#9ca3af",
                                        strokeWidth: 1,
                                        strokeDasharray: "4 4",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="none"
                                    fill={`url(#${gradientId})`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={strokeColor}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{
                                        r: 6,
                                        fill: strokeColor,
                                        stroke: isDark ? "#111827" : "#ffffff",
                                        strokeWidth: 2,
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1 mb-6">
                    {TIMEFRAMES.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                timeframe === tf
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>

                {!historyLoading && chartData.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Минимум
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(min, currency.baseCurrency)}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Максимум
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(max, currency.baseCurrency)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
