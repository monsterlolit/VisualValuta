import React, { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    CartesianGrid,
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

    // Ленивая загрузка истории
    const { history: rawData, loading: historyLoading } = useCurrencyHistory(
        currency,
        timeframe,
    );

    // Инвертируем данные графика
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
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
                    >
                        <IconArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    </button>
                )}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
                        {currency.flag} {currency.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {pairLabel}
                    </p>
                </div>
                <button
                    onClick={() => onToggleFavorite(currency.code)}
                    className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <IconStar
                        className={`w-6 h-6 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                </button>
            </div>

            <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                    {formatCurrency(currentRate, currency.baseCurrency)}
                </div>
                <div
                    className={`flex items-center gap-2 text-base font-semibold ${displayPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                    {displayPositive ? (
                        <IconArrowUpRight className="w-5 h-5" />
                    ) : (
                        <IconArrowDownRight className="w-5 h-5" />
                    )}
                    <span>
                        {Math.abs(change).toFixed(4)} (
                        {Math.abs(changePercent).toFixed(2)}%) за сегодня
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-6 h-72 lg:h-80 transition-colors duration-300">
                {historyLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                        <div className="animate-pulse">Загрузка истории...</div>
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                        Нет данных за выбранный период
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
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
                                        stopOpacity={isDark ? 0.3 : 0.2}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={strokeColor}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={isDark ? "#374151" : "#e5e7eb"}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 11,
                                    fill: isDark ? "#9ca3af" : "#6b7280",
                                }}
                                minTickGap={40}
                            />
                            <YAxis
                                hide
                                domain={["dataMin - 1", "dataMax + 1"]}
                            />
                            <Tooltip
                                content={
                                    <CustomTooltip
                                        isDark={isDark}
                                        baseCurrency={currency.baseCurrency}
                                    />
                                }
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
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    fill: strokeColor,
                                    stroke: isDark ? "#111827" : "#fff",
                                    strokeWidth: 2,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 transition-colors duration-300">
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

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                        <IconArrowDownRight className="w-3.5 h-3.5" /> Минимум
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(min, currency.baseCurrency)}
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">
                        <IconArrowUpRight className="w-3.5 h-3.5" /> Максимум
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(max, currency.baseCurrency)}
                    </div>
                </div>
            </div>
        </div>
    );
};
