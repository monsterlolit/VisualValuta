export interface FrankfurterResponse {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
}

export interface FrankfurterCurrency {
    code: string;
    rate: number;
}
