import React, { useState, useEffect } from "react";
import { IconArrowRightLeft } from "./icons";
import { CurrencySelect } from "./CurrencySelect";
import type { CurrencyData } from "../types/currency";

interface ConverterProps {
    currencies: CurrencyData[];
    hasRuble?: boolean;
    isInverseMode: boolean;
}

export const Converter: React.FC<ConverterProps> = ({
    currencies,
    hasRuble = true,
}) => {
    const [amount, setAmount] = useState<number>(100);
    const [fromCurr, setFromCurr] = useState<string>("USD");
    const [toCurr, setToCurr] = useState<string>("RUB");

    const selectOptions = [
        ...(hasRuble
            ? [{ code: "RUB", flag: "🇷🇺", name: "Российский рубль" }]
            : []),
        ...currencies
            .filter((c) => c.code !== "RUB")
            .map((c) => ({
                code: c.code,
                flag: c.flag,
                name: c.name,
            })),
    ];

    useEffect(() => {
        if (!hasRuble) {
            if (fromCurr === "RUB") {
                const first = selectOptions.find((o) => o.code !== "RUB");
                if (first) setFromCurr(first.code);
            }
            if (toCurr === "RUB") {
                const second = selectOptions.find(
                    (o) => o.code !== "RUB" && o.code !== fromCurr,
                );
                if (second) setToCurr(second.code);
            }
        }
    }, [hasRuble]);

    const getRate = (code: string) => {
        if (code === "RUB") return 1;
        const c = currencies.find((x) => x.code === code);
        return c?.currentRate ?? 1;
    };

    const fromRate = getRate(fromCurr);
    const toRate = getRate(toCurr);
    const result = amount * (fromRate / toRate);

    const handleSwap = () => {
        setFromCurr(toCurr);
        setToCurr(fromCurr);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Конвертер
                </span>
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    <CurrencySelect
                        value={fromCurr}
                        onChange={setFromCurr}
                        options={selectOptions}
                    />
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) =>
                            setAmount(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1 min-w-0 bg-transparent text-right text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 outline-none"
                    />
                </div>

                <div className="flex justify-center -my-2 relative z-10">
                    <button
                        onClick={handleSwap}
                        className="bg-blue-600 dark:bg-blue-500 text-white p-2.5 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 transition-all"
                    >
                        <IconArrowRightLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
                    <CurrencySelect
                        value={toCurr}
                        onChange={setToCurr}
                        options={selectOptions}
                    />
                    <div className="flex-1 min-w-0 text-right text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100 truncate">
                        {result.toLocaleString("ru-RU", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
