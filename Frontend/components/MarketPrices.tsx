import React, { useEffect, useState } from 'react';
import { fetchMarketPrices } from '../lib/market-api';
import { MarketPrice } from '../types/market';

const MarketPrices: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMarketPrices = async () => {
      try {
        const data = await fetchMarketPrices();
        setPrices(data);
      } catch (err) {
        setError('Failed to fetch market prices');
      } finally {
        setLoading(false);
      }
    };

    getMarketPrices();
  }, []);

  if (loading) {
    return <div>Loading market prices...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Market Prices</h2>
      <ul>
        {prices.map((price) => (
          <li key={price.id}>
            {price.crop}: ₹{price.price} (Location: {price.location})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MarketPrices;