export interface Offer {
    id: string;
    productId: string;
    marketplace: string;
    storeName: string;
    title: string;
    imageUrl: string;
    price: number;
    productUrl: string;
    lastCheckedAt: string;
}

export interface AffiliateLink {
    id: string;
    productId: string;
    campaignId: string;
    shortCode: string;
    targetUrl: string;
}

export interface Product {
    id: string;
    title: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    offers: Offer[];
    links: AffiliateLink[];
}

export interface DashboardStats {
    overview: {
        totalLinks: number;
        totalClicks: number;
        totalCampaigns: number;
        globalCtr: string;
    };
    campaignStats: Array<{
        id: string;
        name: string;
        utmCampaign: string;
        linkCount: number;
        clickCount: number;
        ctr: string;
    }>;
    linkStats: Array<{
        shortCode: string;
        targetUrl: string;
        clickCount: number;
    }>;
}
