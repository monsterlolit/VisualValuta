export type BaseCurrency = "RUB" | "EUR";

export const formatCurrency = (
    value: number,
    baseCurrency: BaseCurrency = "RUB",
): string => {
    const currencyCode = baseCurrency === "EUR" ? "EUR" : "RUB";
    const currencySymbol = baseCurrency === "EUR" ? "€" : "₽";

    const maxDigits = value < 1 ? 6 : 4;

    try {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDigits,
        }).format(value);
    } catch {
        return `${value.toFixed(maxDigits)} ${currencySymbol}`;
    }
};
