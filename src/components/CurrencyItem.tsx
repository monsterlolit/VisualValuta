import React from "react";
import { IconArrowDownRight, IconArrowUpRight, IconStar } from "./icons";
import type { CurrencyData } from "../types/currency";
import { formatCurrency } from "../lib/formatCurrency";

interface CurrencyItemProps {
    currency: CurrencyData;
    isFavorite: boolean;
    onToggleFavorite: (code: string) => void;
    onClick: (currency: CurrencyData) => void;
    isInverseMode: boolean;
}

export const CurrencyItem: React.FC<CurrencyItemProps> = ({
    currency,
    isFavorite,
    onToggleFavorite,
    onClick,
    isInverseMode,
}) => {
    const rate = isInverseMode
        ? 1 / currency.currentRate
        : currency.currentRate;
    const change = isInverseMode
        ? 1 / currency.currentRate - 1 / currency.previousRate
        : currency.change;
    const isPositive = change >= 0;

    const formattedRate = formatCurrency(rate, currency.baseCurrency);

    const rateLabel = isInverseMode
        ? `за 1 ${currency.baseCurrency}`
        : "за 1 единицу";

    return (
        <div
            onClick={() => onClick(currency)}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer active:scale-[0.99] transform duration-150"
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{currency.flag}</span>
                <div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                        {currency.code}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {currency.name}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                        {formattedRate}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {rateLabel}
                    </div>
                    <div
                        className={`text-xs font-medium flex items-center justify-end gap-1 ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                        {isPositive ? (
                            <IconArrowUpRight className="w-3 h-3" />
                        ) : (
                            <IconArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(change).toFixed(4)} (
                        {Math.abs(currency.changePercent).toFixed(2)}%)
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(currency.code);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={
                        isFavorite
                            ? "Удалить из избранного"
                            : "Добавить в избранное"
                    }
                >
                    <IconStar
                        className={`w-5 h-5 transition-colors ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                </button>
            </div>
        </div>
    );
};
