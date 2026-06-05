export interface MoexMetadata {
    [key: string]: {
        type: string;
        bytes?: number;
        max_size?: number;
    };
}

export interface MoexSection {
    metadata: MoexMetadata;
    columns: string[];
    data: any[][];
}

export interface MoexResponse {
    securities: MoexSection;
    marketdata: MoexSection;
    dataversion?: MoexSection;
}

export interface MoexSecurity {
    secid: string;
    boardid: string;
    shortname: string;
    lotsize: number;
    decimals: number;
    prevprice: number | null;
    prevwaprice: number | null;
    currencyid: string;
    faceunit: string;
}

export interface MoexMarketData {
    secid: string;
    boardid: string;
    last: number | null;
    change: number | null;
    high: number | null;
    low: number | null;
    open: number | null;
    waprice: number | null;
    closeprice?: number | null;
    tradingstatus: string;
    updatetime: string;
    prevprice?: number | null;
}
