import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  dataKey: string;
  emptyMessage: string;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, path, dataKey, emptyMessage, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getJson<Record<string, unknown>>(path)
      .then((response) => {
        const value = response[dataKey];
        if (!Array.isArray(value)) {
          throw new Error(`The ${title.toLowerCase()} response was invalid.`);
        }
        if (active) setItems(value as T[]);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        const message = requestError instanceof Error ? requestError.message : 'An unexpected error occurred.';
        setError(`Unable to load ${title.toLowerCase()}. ${message}`);
      });

    return () => {
      active = false;
    };
  }, [dataKey, path, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert" className="text-danger">{error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}…</p>
        ) : items.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {items.map((item, index) => (
              <li className="list-group-item" key={index}>{renderItem(item, index)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
