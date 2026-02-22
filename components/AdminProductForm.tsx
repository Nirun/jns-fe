'use client';

import { useState } from 'react';
import { getAdminApiKey } from '@/lib/auth';
import styles from './AdminProductForm.module.css';

export default function AdminProductForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title'),
            imageUrl: formData.get('imageUrl'),
            lazadaUrl: formData.get('lazadaUrl'),
            shopeeUrl: formData.get('shopeeUrl'),
        };

        const apiKey = getAdminApiKey();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey || '',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to create product');

            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className={`glass ${styles.form}`} onSubmit={handleSubmit}>
            <h3 className={styles.formTitle}>Add New Product</h3>

            <div className={styles.inputGroup}>
                <label htmlFor="title">Product Title</label>
                <input name="title" id="title" placeholder="e.g. Sony WH-1000XM5" required />
            </div>

            <div className={styles.inputGroup}>
                <label htmlFor="imageUrl">Global Image URL</label>
                <input name="imageUrl" id="imageUrl" placeholder="https://..." required />
            </div>

            <div className={styles.grid}>
                <div className={styles.inputGroup}>
                    <label htmlFor="lazadaUrl">Lazada Product URL</label>
                    <input name="lazadaUrl" id="lazadaUrl" placeholder="https://lazada.co.th/..." />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="shopeeUrl">Shopee Product URL</label>
                    <input name="shopeeUrl" id="shopeeUrl" placeholder="https://shopee.co.th/..." />
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Syncing...' : 'Add Product & Sync Offers'}
            </button>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>Product added successfully!</p>}
        </form>
    );
}
