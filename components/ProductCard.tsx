'use client';

import { Product, Offer } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const getBestOffer = (offers: Offer[]) => {
        if (!offers || offers.length === 0) return null;
        return offers.reduce((prev, curr) => (prev.price < curr.price ? prev : curr));
    };

    const bestOffer = getBestOffer(product.offers);

    return (
        <div className={`glass ${styles.card} animate-fade-in`}>
            <div className={styles.imageWrapper}>
                <img
                    src={product.imageUrl}
                    alt={product.title}
                    className={styles.productImage}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/222/fff?text=' + encodeURIComponent(product.title);
                    }}
                />
                <div className={styles.badgeWrapper}>
                    <span className="glass-pill">
                        <span style={{ color: 'hsl(var(--accent-primary))' }}>●</span>
                        {product.offers.length} Offers
                    </span>
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{product.title}</h3>

                <div className={styles.offersList}>
                    {product.offers.map((offer) => {
                        const isBest = bestOffer && offer.id === bestOffer.id;
                        const foundLink = product.links?.find(l => l.targetUrl === offer.productUrl);
                        const dealUrl = foundLink
                            ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}/go/${foundLink.shortCode}`
                            : offer.productUrl;

                        return (
                            <div key={offer.id} className={`${styles.offerItem} ${isBest ? styles.bestOffer : ''}`}>
                                <div className={styles.offerMeta}>
                                    <span className={styles.marketplace}>{offer.marketplace}</span>
                                    <span className={styles.storeName}>{offer.storeName}</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span className={styles.price}>฿{offer.price.toLocaleString()}</span>
                                    {isBest && <span className={styles.bestPriceBadge}>BEST PRICE</span>}
                                </div>
                                <a
                                    href={dealUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={isBest ? 'btn-primary' : styles.btnSecondary}
                                >
                                    View Deal
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
