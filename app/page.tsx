import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import styles from './page.module.css';

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/products`, {
    cache: 'no-store',
    headers: {
      'X-API-KEY': 'e8b40492-b870-498f-a1f3-969a42222637',
    },
  });

  if (!res.ok) {
    // Return empty array if backend is down during development
    console.error('Failed to fetch products');
    return [];
  }

  return res.json();
}

export default async function Home() {
  const products = await getProducts();
  const copyright = process.env.NEXT_PUBLIC_COPYRIGHT;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className="text-gradient">Affiliate Deals</h1>
          <p className={styles.subtitle}>Best prices from Lazada & Shopee, tracked automatically.</p>
        </div>
      </header>

      <main className={styles.main}>
        {products.length === 0 ? (
          <div className={`glass ${styles.emptyState}`}>
            <h3>No products found</h3>
            <p>Admin: Add products in the dashboard to see them here.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>{copyright}</p>
      </footer>
    </div>
  );
}
