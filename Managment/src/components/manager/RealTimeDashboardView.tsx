import { TrendingUp } from 'lucide-react';
import { MapView } from '../MapView';

export function RealTimeDashboardView() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Live Operations Pulse</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-ping"></span>
                    System Live
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regional Traffic Density</h3>
                            <TrendingUp size={14} className="text-blue-500" />
                        </div>
                        <div className="h-[400px]">
                            <MapView
                                markers={[
                                    { lat: 6.9271, lng: 79.8612, title: 'North Hub - Heavy' },
                                    { lat: 6.9371, lng: 79.8712, title: 'South Hub - Normal' },
                                    { lat: 6.9171, lng: 79.8512, title: 'East Hub - Low' }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Order Velocity</p>
                            <div className="flex items-end gap-1 h-20">
                                {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95].map((h, i) => (
                                    <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <p className="text-xl font-black text-gray-900 mt-4">12.4 <span className="text-xs font-normal text-gray-400">orders/min</span></p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Stock Fulfillment</p>
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                            In Progress
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-semibold inline-block text-blue-600">
                                            85%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                                    <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-500 italic">4,200 units moving across RDCs</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Active System Alerts</h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Inventory Alert', msg: 'RDC South at 15% capacity', type: 'warn' },
                                { title: 'Delivery Delay', msg: 'Heavy traffic in Colombo North', type: 'info' },
                                { title: 'Payment Success', msg: 'Large PO #8892 processed', type: 'success' }
                            ].map((alert, i) => (
                                <div key={i} className={`p-4 rounded-xl border-l-4 ${alert.type === 'warn' ? 'bg-orange-50 border-orange-400 text-orange-800' : alert.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-blue-50 border-blue-400 text-blue-800'}`}>
                                    <p className="text-xs font-black">{alert.title}</p>
                                    <p className="text-[10px] opacity-80">{alert.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl shadow-xl p-6 text-white border border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Fleet Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Active Vans</span>
                                <span className="font-black text-blue-400">18 / 20</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full" style={{ width: '90%' }}></div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Idle Drivers</span>
                                <span className="font-black text-slate-400">2</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            Broadcast Comm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
