'use client';

import { useState } from 'react';
import { DashboardStats } from '@/types';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
    stats: DashboardStats;
}

export default function Leaderboard({ stats }: LeaderboardProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (shortCode: string) => {
        const url = `http://localhost:3000/go/${shortCode}`;
        navigator.clipboard.writeText(url);
        setCopiedCode(shortCode);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className={`glass ${styles.container}`}>
            <h3 className={styles.title}>Affiliate Leaderboard</h3>

            <div className={styles.statsOverview}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Clicks</span>
                    <span className={styles.statValue}>{stats.overview.totalClicks}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Links</span>
                    <span className={styles.statValue}>{stats.overview.totalLinks}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>Global CTR</span>
                    <span className={styles.statValue}>{stats.overview.globalCtr}%</span>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Short Code</th>
                            <th>Target URL</th>
                            <th>Clicks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.linkStats.sort((a, b) => b.clickCount - a.clickCount).map((link) => (
                            <tr key={link.shortCode}>
                                <td className={styles.code}>
                                    <div className={styles.codeContainer}>
                                        <a
                                            href={`http://localhost:3000/go/${link.shortCode}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.shortCodeLink}
                                            title="Open link"
                                        >
                                            <code>{link.shortCode}</code>
                                        </a>
                                        <button
                                            onClick={() => handleCopy(link.shortCode)}
                                            className={styles.copyButton}
                                            title="Copy link"
                                        >
                                            {copiedCode === link.shortCode ? (
                                                <span className={styles.copiedText}>Copied!</span>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className={styles.url}>{link.targetUrl}</td>
                                <td className={styles.clicks}>{link.clickCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
