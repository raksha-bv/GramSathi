export interface MarketPrice {
  commodity: string;
  market: string;
  price: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string;
  date: string;
  districtFound?: boolean;
  requestedDistrict?: string;
  serialNumber?: string;
}

export interface MarketIntent {
  type: "price" | "none";
  commodity?: string;
  location?: string;
  state?: string;
}

export interface MarketPriceResponse {
  prices: MarketPrice[];
  summary?: {
    averagePrice: number;
    highestPrice: number;
    lowestPrice: number;
    marketCount: number;
  };
}
