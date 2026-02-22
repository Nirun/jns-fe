'use client';

import { useState } from 'react';
import { getAdminApiKey } from '@/lib/auth';
import styles from './AdminManagement.module.css';

interface AdminManagementProps {
    initialProducts: any[];
    initialCampaigns: any[];
    initialLinks: any[];
}

type ModalMode = 'edit' | 'create';

export default function AdminManagement({ initialProducts, initialCampaigns, initialLinks }: AdminManagementProps) {
    const [activeTab, setActiveTab] = useState<'products' | 'campaigns' | 'links'>('products');
    const [products, setProducts] = useState(initialProducts);
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [links, setLinks] = useState(initialLinks);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        type: 'products' | 'campaigns' | 'links';
        mode: ModalMode;
        data?: any
    } | null>(null);

    const [form, setForm] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDelete = async (type: string, id: string) => {
        if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

        let url = '';
        if (type === 'products') url = `http://localhost:3000/api/products/${id}`;
        if (type === 'campaigns') url = `http://localhost:3000/api/campaigns/${id}`;
        if (type === 'links') url = `http://localhost:3000/api/links/${id}`;

        const apiKey = getAdminApiKey();

        try {
            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'X-API-KEY': apiKey || '' }
            });

            if (res.ok) {
                if (type === 'products') setProducts(products.filter(p => p.id !== id));
                if (type === 'campaigns') setCampaigns(campaigns.filter(c => c.id !== id));
                if (type === 'links') setLinks(links.filter(l => l.id !== id));
            } else {
                alert('Failed to delete');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting');
        }
    };

    const openCreateModal = (type: 'products' | 'campaigns' | 'links') => {
        setModalConfig({ type, mode: 'create' });
        setForm({});
    };

    const openEditModal = (type: 'products' | 'campaigns' | 'links', entity: any) => {
        setModalConfig({ type, mode: 'edit', data: entity });
        setForm({ ...entity });
    };

    const handleSave = async () => {
        if (!modalConfig) return;
        setIsProcessing(true);

        const { type, mode, data } = modalConfig;
        const isEdit = mode === 'edit';

        let url = `http://localhost:3000/api/${type}`;
        if (isEdit) url += `/${data.id}`;

        let body: any = {};
        if (type === 'products') {
            body = { title: form.title, imageUrl: form.imageUrl };
        } else if (type === 'campaigns') {
            body = { name: form.name, utmCampaign: form.utmCampaign };
        } else if (type === 'links') {
            body = {
                targetUrl: form.targetUrl,
                campaignId: form.campaignId,
                productId: form.productId // only for create
            };
        }

        const apiKey = getAdminApiKey();

        try {
            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': apiKey || ''
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const result = await res.json();

                if (isEdit) {
                    if (type === 'products') setProducts(products.map(p => p.id === data.id ? { ...p, ...result } : p));
                    if (type === 'campaigns') setCampaigns(campaigns.map(c => c.id === data.id ? { ...c, ...result } : c));
                    if (type === 'links') setLinks(links.map(l => l.id === data.id ? { ...l, ...result } : l));
                } else {
                    if (type === 'campaigns') setCampaigns([...campaigns, result]);
                    if (type === 'links') {
                        const product = products.find(p => p.id === form.productId);
                        const campaign = campaigns.find(c => c.id === form.campaignId);
                        setLinks([...links, {
                            ...result,
                            product: { title: product?.title },
                            campaign: { name: campaign?.name },
                            _count: { clicks: 0 }
                        }]);
                    }
                }
                setModalConfig(null);
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Failed: ${errData.message || res.statusText}`);
            }
        } catch (err) {
            console.error(err);
            alert('Error processing request');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`glass ${styles.container}`}>
            <div className={styles.tabHeader}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products ({products.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'campaigns' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('campaigns')}
                    >
                        Campaigns ({campaigns.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'links' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('links')}
                    >
                        Affiliate Links ({links.length})
                    </button>
                </div>

                {activeTab !== 'products' && (
                    <button className={styles.addBtn} onClick={() => openCreateModal(activeTab)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add {activeTab === 'campaigns' ? 'Campaign' : 'Link'}
                    </button>
                )}
            </div>

            <div className={styles.tableWrapper}>
                {activeTab === 'products' && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Offers</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.title}</td>
                                    <td>{p.offers?.length || 0}</td>
                                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.editBtn} onClick={() => openEditModal('products', p)}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete('products', p.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'campaigns' && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>UTM</th>
                                <th>Links</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td>{c.name}</td>
                                    <td><code>{c.utmCampaign}</code></td>
                                    <td>{c._count?.links || 0}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.editBtn} onClick={() => openEditModal('campaigns', c)}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete('campaigns', c.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'links' && (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Product</th>
                                <th>Campaign</th>
                                <th>Clicks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map(l => (
                                <tr key={l.id}>
                                    <td><code>{l.shortCode}</code></td>
                                    <td>{l.product?.title}</td>
                                    <td>{l.campaign?.name}</td>
                                    <td>{l._count?.clicks || 0}</td>
                                    <td className={styles.actions}>
                                        <button className={styles.editBtn} onClick={() => openEditModal('links', l)}>Edit</button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete('links', l.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {modalConfig && (
                <div className={styles.modalOverlay}>
                    <div className={`glass ${styles.modalContent}`}>
                        <h3 className={styles.modalTitle}>
                            {modalConfig.mode === 'create' ? 'Create' : 'Edit'} {modalConfig.type.slice(0, -1)}
                        </h3>

                        <div className={styles.form}>
                            {modalConfig.type === 'products' && (
                                <>
                                    <div className={styles.field}>
                                        <label>Title</label>
                                        <input
                                            value={form.title || ''}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Product Title"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Global Image URL</label>
                                        <input
                                            value={form.imageUrl || ''}
                                            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'campaigns' && (
                                <>
                                    <div className={styles.field}>
                                        <label>Name</label>
                                        <input
                                            value={form.name || ''}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Summer Sale"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>UTM Campaign</label>
                                        <input
                                            value={form.utmCampaign || ''}
                                            onChange={(e) => setForm({ ...form, utmCampaign: e.target.value })}
                                            placeholder="e.g. summer_promo"
                                        />
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'links' && (
                                <>
                                    {modalConfig.mode === 'create' && (
                                        <>
                                            <div className={styles.field}>
                                                <label>Product</label>
                                                <select
                                                    value={form.productId || ''}
                                                    onChange={(e) => {
                                                        const pId = e.target.value;
                                                        const product = products.find(p => p.id === pId);
                                                        setForm({ ...form, productId: pId, targetUrl: '' });
                                                    }}
                                                >
                                                    <option value="">Select Product...</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>{p.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {form.productId && (
                                                <div className={styles.field}>
                                                    <label>Marketplace Offer (Target URL)</label>
                                                    <select
                                                        onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                                                        value={form.targetUrl || ''}
                                                    >
                                                        <option value="">Select Offer URL...</option>
                                                        {products.find(p => p.id === form.productId)?.offers?.map((o: any) => (
                                                            <option key={o.id} value={o.productUrl}>
                                                                {o.marketplace} - ฿{o.price.toLocaleString()}
                                                            </option>
                                                        ))}
                                                        <option value="custom">-- Custom URL --</option>
                                                    </select>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    <div className={styles.field}>
                                        <label>Campaign</label>
                                        <select
                                            value={form.campaignId || ''}
                                            onChange={(e) => setForm({ ...form, campaignId: e.target.value })}
                                        >
                                            <option value="">Select Campaign...</option>
                                            {campaigns.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Target URL</label>
                                        <input
                                            value={form.targetUrl === 'custom' ? '' : form.targetUrl || ''}
                                            onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                                            placeholder="https://..."
                                            disabled={form.targetUrl && form.targetUrl !== 'custom' && form.targetUrl !== ''}
                                        />
                                        {form.targetUrl && form.targetUrl !== 'custom' && (
                                            <button
                                                style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.2rem 0' }}
                                                onClick={() => setForm({ ...form, targetUrl: 'custom' })}
                                            >
                                                Edit URL manually
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setModalConfig(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSave}
                                disabled={isProcessing || (modalConfig.mode === 'create' && modalConfig.type === 'links' && !form.productId)}
                            >
                                {isProcessing ? 'Saving...' : modalConfig.mode === 'create' ? 'Create' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
