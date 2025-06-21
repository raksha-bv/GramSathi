import React, { useEffect, useState } from 'react';
import { fetchSchemes } from '../lib/schemes-api';
import { Scheme } from '../types/schemes';

const SchemeInfo: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSchemes = async () => {
      try {
        const data = await fetchSchemes();
        setSchemes(data);
      } catch (err) {
        setError('Failed to fetch schemes');
      } finally {
        setLoading(false);
      }
    };

    getSchemes();
  }, []);

  if (loading) {
    return <div>Loading schemes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Government Schemes</h2>
      <ul>
        {schemes.map((scheme) => (
          <li key={scheme.id}>
            <h3>{scheme.name}</h3>
            <p>{scheme.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchemeInfo;