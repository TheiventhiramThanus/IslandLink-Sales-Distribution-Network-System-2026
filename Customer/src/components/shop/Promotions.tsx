import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Promotions.css';

interface Promotion {
    id: string;
    title: string;
    description: string;
    discountPercent: number;
    startDate: string;
    endDate: string;
    eligibleProducts: string[];
    bannerColor?: string;
}

const mockPromotions: Promotion[] = [
    {
        id: '1',
        title: 'New Year Connectivity Deal',
        description: 'Get exclusive discounts on all ISDN Basic Line installations.',
        discountPercent: 15,
        startDate: 'Jan 01, 2026',
        endDate: 'Jan 31, 2026',
        eligibleProducts: ['ISDN Basic Line', 'ISDN Terminal Adapter'],
        bannerColor: 'linear-gradient(135deg, #008000, #7c3aed)'
    },
    {
        id: '2',
        title: 'Enterprise Growth Bundle',
        description: 'Scale your business with discounted Primary Rate Interfaces.',
        discountPercent: 20,
        startDate: 'Jan 15, 2026',
        endDate: 'Feb 15, 2026',
        eligibleProducts: ['ISDN Primary Rate Interface', 'Enterprise VOIP Gateway'],
        bannerColor: 'linear-gradient(135deg, #059669, #10b981)'
    },
    {
        id: '3',
        title: 'Accessory Flash Sale',
        description: 'Limited time offer on all connectivity accessories.',
        discountPercent: 10,
        startDate: 'Jan 20, 2026',
        endDate: 'Jan 28, 2026',
        eligibleProducts: ['ISDN Terminal Adapter', 'Cabling Kits'],
        bannerColor: 'linear-gradient(135deg, #dc2626, #f87171)'
    }
];

export function Promotions() {
    const navigate = useNavigate();
    return (
        <div className="promotions-container">
            <header className="promotions-header">
                <h1>Active <span style={{ color: '#008000' }}>Promotions</span></h1>
                <p>Exclusive deals for IslandLink ISDN customers</p>
            </header>

            <div className="promotions-grid">
                {mockPromotions.map((promo) => (
                    <div key={promo.id} className="promotion-card">
                        <div className="promo-banner" style={{ background: promo.bannerColor }}>
                            <div className="promo-discount">
                                {promo.discountPercent}<span>% OFF</span>
                            </div>
                        </div>
                        <div className="promo-content">
                            <h3 className="promo-title">{promo.title}</h3>
                            <div className="promo-dates">
                                <Calendar size={14} />
                                <span>{promo.startDate} - {promo.endDate}</span>
                            </div>
                            <div className="promo-eligible">
                                <h4>Eligible Products:</h4>
                                <ul>
                                    {promo.eligibleProducts.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="promo-actions">
                                <button className="btn-apply">Apply to Order</button>
                                <button
                                    className="btn-view-products"
                                    onClick={() => navigate('/catalogue')}
                                >
                                    View Products
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
