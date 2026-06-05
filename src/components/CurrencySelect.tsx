import React, { useState, useRef, useEffect } from "react";
import { IconArrowDownRight } from "./icons";

interface CurrencyOption {
    code: string;
    flag: string;
    name?: string;
}

interface CurrencySelectProps {
    value: string;
    onChange: (value: string) => void;
    options: CurrencyOption[];
    disabled?: boolean;
    className?: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
    value,
    onChange,
    options,
    disabled,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.code === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (code: string) => {
        onChange(code);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 font-bold text-gray-900 dark:text-gray-100 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className="text-lg leading-none">
                    {selected?.flag || "🏳️"}
                </span>
                <span>{value}</span>
                <IconArrowDownRight
                    className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
                        {options.map((option) => (
                            <button
                                key={option.code}
                                type="button"
                                onClick={() => handleSelect(option.code)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                    option.code === value
                                        ? "bg-blue-50 dark:bg-blue-900/30"
                                        : ""
                                }`}
                            >
                                <span className="text-lg leading-none">
                                    {option.flag}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {option.code}
                                    </div>
                                    {option.name && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {option.name}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
