import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';
import Leaderboard from '@/components/Leaderboard';
import AdminManagement from '@/components/AdminManagement';
import { DashboardStats } from '@/types';
import styles from './admin.module.css';
import LogoutButton from '@/components/LogoutButton';

async function getDashboardStats(apiKey: string): Promise<DashboardStats> {
    const res = await fetch('http://localhost:3000/api/dashboard', {
        cache: 'no-store',
        headers: { 'X-API-KEY': apiKey },
    });

    if (!res.ok) return { overview: { totalLinks: 0, totalClicks: 0, totalCampaigns: 0, globalCtr: '0.00' }, campaignStats: [], linkStats: [] };
    return res.json();
}

async function getAllProducts(apiKey: string) {
    const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store', headers: { 'X-API-KEY': apiKey } });
    return res.ok ? res.json() : [];
}

async function getAllCampaigns(apiKey: string) {
    const res = await fetch('http://localhost:3000/api/campaigns', { cache: 'no-store', headers: { 'X-API-KEY': apiKey } });
    return res.ok ? res.json() : [];
}

async function getAllLinks(apiKey: string) {
    const res = await fetch('http://localhost:3000/api/links', { cache: 'no-store', headers: { 'X-API-KEY': apiKey } });
    return res.ok ? res.json() : [];
}

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const apiKey = cookieStore.get('admin_api_key')?.value;

    if (!apiKey) {
        redirect('/login');
    }

    const [stats, products, campaigns, links] = await Promise.all([
        getDashboardStats(apiKey),
        getAllProducts(apiKey),
        getAllCampaigns(apiKey),
        getAllLinks(apiKey)
    ]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                            <h1 className="text-gradient">Admin Dashboard</h1>
                            <p className={styles.subtitle}>Manage products and track affiliate performance.</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.dashboardGrid}>
                    <section className={styles.formSection}>
                        <AdminProductForm />
                    </section>

                    <section className={styles.statsSection}>
                        <Leaderboard stats={stats} />
                    </section>
                </div>

                <section className={styles.managementSection}>
                    <h2 className={styles.sectionTitle}>Manage Entities</h2>
                    <AdminManagement
                        initialProducts={products}
                        initialCampaigns={campaigns}
                        initialLinks={links}
                    />
                </section>
            </main>

            <footer className={styles.footer}>
                <p>© 2024 Antigravity Affiliate Platform</p>
            </footer>
        </div>
    );
}
