export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(value);
};
