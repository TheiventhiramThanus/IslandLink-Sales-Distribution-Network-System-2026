import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, DollarSign, FileSpreadsheet, FileText, Download } from 'lucide-react';

export function FinancialReportsView() {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async (report: string) => {
        setIsGenerating(true);
        const promise = new Promise(resolve => setTimeout(resolve, 1500));
        toast.promise(promise, {
            loading: `Generating ${report}...`,
            success: `${report} downloaded successfully`,
            error: 'Failed to generate report'
        });
        await promise;
        setIsGenerating(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-blue-600 pb-2 inline-block">Executive Financial Reports</h2>
                    <p className="text-gray-500 mt-2">Access key financial statements and tax compliance records.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <Calendar className="text-blue-600" size={18} />
                    <span className="text-sm font-bold text-gray-700">Last Close: <span className="text-gray-900">Dec 31, 2025</span></span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Statement Library */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Statement Library
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { name: 'Monthly P&L Statement', period: 'Jan 2026', type: 'PDF' },
                            { name: 'Quarterly Tax Report', period: 'Q4 2025', type: 'Excel' },
                            { name: 'Annual Financial Summary', period: 'FY 2025', type: 'PDF' },
                            { name: 'Cash Flow Statement', period: 'Weekly', type: 'PDF' },
                        ].map((report, index) => (
                            <div key={index} className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-900 block group-hover:text-blue-700 transition-colors">{report.name}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{report.period}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownload(report.name)}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                                >
                                    <Download size={16} />
                                    <span>{report.type}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-800 to-indigo-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign size={120} />
                        </div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-xl relative z-10">
                            <DollarSign size={24} className="text-blue-300" />
                            Quick Export
                        </h3>
                        <p className="text-blue-100 text-sm mb-8 leading-relaxed relative z-10">
                            Export all transaction data for the current billing cycle directly into your ERP system format.
                        </p>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <button className="py-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/20 transition-all backdrop-blur-sm">
                                <FileSpreadsheet size={24} />
                                <span className="font-bold text-xs uppercase tracking-wider">Excel</span>
                            </button>
                            <button className="py-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/20 transition-all backdrop-blur-sm">
                                <FileText size={24} />
                                <span className="font-bold text-xs uppercase tracking-wider">PDF</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center justify-between">
                            Tax Compliance
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs uppercase">Good Standing</span>
                        </h3>
                        <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="#f3f4f6" strokeWidth="8" fill="transparent" />
                                    <circle cx="40" cy="40" r="36" stroke="#22c55e" strokeWidth="8" fill="transparent" strokeDasharray="226.2" strokeDashoffset="0" />
                                </svg>
                                <span className="absolute text-xl font-black text-green-600">100%</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">All Filed</p>
                                <p className="text-xs text-gray-500 mt-1">Next Filing Due:</p>
                                <p className="text-sm font-medium text-blue-600">Jan 15, 2026 (12 Days)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
