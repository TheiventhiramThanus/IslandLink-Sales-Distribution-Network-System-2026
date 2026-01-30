import { ArrowRight, Truck, MapPin, ShieldCheck } from 'lucide-react';

interface OnboardingScreenProps {
    onGetStarted: () => void;
}

export function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center px-8 text-center">
                {/* Animated Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-green-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-[-5%] left-[-10%] w-[60%] aspect-square bg-green-100 rounded-full blur-3xl opacity-40"></div>

                <div className="relative z-10 space-y-12">
                    {/* Main Illustration Placeholder */}
                    <div className="w-64 h-64 bg-slate-900 rounded-[64px] mx-auto flex items-center justify-center shadow-2xl rotate-3">
                        <Truck className="w-32 h-32 text-[#008000]" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 leading-[1.1]">
                            Fastest <span className="text-[#008000]">Logistics</span> Delivery Service
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Efficiently track, manage and deliver orders across the Kingdom with real-time updates.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <div className="item flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
                        </div>
                        <div className="item flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-12 relative z-10">
                <button
                    onClick={onGetStarted}
                    className="w-full bg-slate-900 hover:bg-[#008000] text-white py-6 rounded-[32px] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
                >
                    Get Started <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
