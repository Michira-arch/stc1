import { ArrowLeft } from 'lucide-react';
import { CarvedButton } from '../../components/CarvedButton';
import MarketplaceApp from '../../src/features/marketplace/MarketplaceApp';

interface MarketplaceProps {
    onBack: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ onBack }) => {
    return (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
            {/* Overlay Back Button - always visible on top of Marketplace */}
            <div className="fixed top-4 left-4 z-[100]">
                <CarvedButton onClick={onBack} className="!w-10 !h-10 !rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                    <ArrowLeft size={20} />
                </CarvedButton>
            </div>

            {/* Marketplace App Entry */}
            <div className="min-h-screen relative isolation-auto">
                <MarketplaceApp />
            </div>
        </div>
    );
};
