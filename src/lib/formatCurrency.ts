export type BaseCurrency = "RUB" | "EUR";

export const formatCurrency = (
    value: number,
    baseCurrency: BaseCurrency = "RUB",
): string => {
    // Для EUR используем евро, для RUB — рубли
    const currencyCode = baseCurrency === "EUR" ? "EUR" : "RUB";
    const currencySymbol = baseCurrency === "EUR" ? "€" : "₽";

    // Для очень маленьких значений (обратный режим) показываем больше цифр
    const maxDigits = value < 1 ? 6 : 4;

    try {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: maxDigits,
        }).format(value);
    } catch {
        // Fallback если что-то пошло не так
        return `${value.toFixed(maxDigits)} ${currencySymbol}`;
    }
};
