import { MarketPrice, MarketPriceResponse } from "../types/market";

const MARKET_API_BASE_URL =
  process.env.MARKET_API_URL || "http://127.0.0.1:5000";

export async function fetchMarketPrices(
  commodity: string,
  state: string = "Karnataka",
  district?: string
): Promise<MarketPrice[]> {
  try {
    // Map common district names to API expected format
    const districtMapping: { [key: string]: string } = {
      "Hassan": "Hassan",
      "Kolar": "Kolar", 
      "Bangalore": "Bangalore",
      "Mysore": "Mysore",
      "Dharwad": "Dharwad",
      "Belgaum": "Belgaum",
      "Bellary": "Bellary",
      "Bidar": "Bidar",
      "Bijapur": "Bijapur",
      "Chamrajnagar": "Chamrajnagar",
      "Chikmagalur": "Chikmagalur",
      "Chitradurga": "Chitradurga",
      "Davangere": "Davangere",
      "Gadag": "Gadag",
      "Haveri": "Haveri",
      "Kalburgi": "Kalburgi",
      "Karwar": "Karwar(Uttar Kannad)",
      "Koppal": "Koppal",
      "Madikeri": "Madikeri(Kodagu)",
      "Kodagu": "Madikeri(Kodagu)",
      "Mandya": "Mandya",
      "Mangalore": "Mangalore(Dakshin Kannad)",
      "Raichur": "Raichur",
      "Ramanagar": "Ramanagar",
      "Shimoga": "Shimoga",
      "Tumkur": "Tumkur",
      "Udupi": "Udupi",
      "Yadgiri": "Yadgiri",
      "Bagalkot": "Bagalkot"
    };

    const params = new URLSearchParams({
      commodity: commodity,
      state: state,
    });

    if (district) {
      // Use mapped district name if available, otherwise use as-is
      const mappedDistrict = districtMapping[district] || district;
      params.append("district", mappedDistrict);
    }

    const url = `${MARKET_API_BASE_URL}/request?${params.toString()}`;
    console.log("Fetching market prices from:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Market API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Market API response:", data);

    // Handle error response from API
    if (data.error) {
      throw new Error(`Market API error: ${data.error}`);
    }

    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error("Expected array but got:", typeof data, data);
      throw new Error("Invalid response format from market API");
    }

    // Transform the API response to match our MarketPrice interface
    const marketPrices: MarketPrice[] = data.map((item: any) => ({
      commodity: item.Commodity || commodity,
      market: item.City || "Unknown",
      price: parseFloat(String(item["Model Prize"]).replace(/,/g, '')) || 0,
      minPrice: parseFloat(String(item["Min Prize"]).replace(/,/g, '')) || 0,
      maxPrice: parseFloat(String(item["Max Prize"]).replace(/,/g, '')) || 0,
      unit: "per quintal",
      date: item.Date || new Date().toISOString().split("T")[0],
      districtFound: item.District_Found || false,
      requestedDistrict: item.Requested_District || district,
      serialNumber: item["S.No"] || "",
    }));

    return marketPrices;
  } catch (error) {
    console.error("Error fetching market prices:", error);
    throw new Error("Failed to fetch market prices");
  }
}

// Get prices for specific commodity and location
export async function fetchCommodityPrice(
  commodity: string,
  location?: string,
  state: string = "Karnataka"
): Promise<MarketPrice[]> {
  try {
    // Use the location as district parameter
    const district = location || "Kolar";

    const prices = await fetchMarketPrices(commodity, state, district);

    // If location was specified and we have data, filter by that city
    if (location && prices.length > 0) {
      const filtered = prices.filter((price) =>
        price.market.toLowerCase().includes(location.toLowerCase())
      );

      // If we found specific city matches, return them
      if (filtered.length > 0) {
        return filtered;
      }
    }

    // Return all results (state-level data if district not found)
    return prices;
  } catch (error) {
    console.error("Error fetching commodity price:", error);
    throw error;
  }
}

// Get latest price for a commodity in a specific market
export async function getLatestPrice(
  commodity: string,
  market: string,
  state: string = "Karnataka"
): Promise<MarketPrice | null> {
  try {
    const prices = await fetchCommodityPrice(commodity, market, state);

    if (prices.length === 0) {
      return null;
    }

    // Sort by date to get the latest
    const sortedPrices = prices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedPrices[0];
  } catch (error) {
    console.error("Error getting latest price:", error);
    return null;
  }
}
