export interface CbrValute {
    ID: string;
    NumCode: string;
    CharCode: string;
    Nominal: number;
    Name: string;
    Value: number;
    Previous: number;
}

export interface CbrResponse {
    Date: string;
    PreviousDate: string;
    Timestamp: string;
    Valute: Record<string, CbrValute>;
}

export interface CbrCurrency {
    code: string;
    name: string;
    nominal: number;
    value: number;
    previous: number;
    change: number;
    changePercent: number;
}
