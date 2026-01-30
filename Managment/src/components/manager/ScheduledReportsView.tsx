import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Clock, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledReport {
    id: number;
    name: string;
    frequency: string;
    recipients: string;
    status: 'Active' | 'Paused';
}

export function ScheduledReportsView() {
    const [reports, setReports] = useState<ScheduledReport[]>([
        { id: 1, name: 'Weekly Sales Summary', frequency: 'Every Monday 9:00 AM', recipients: 'management@isdn.com', status: 'Active' },
        { id: 2, name: 'Monthly Financial Report', frequency: 'First day of month', recipients: 'finance@isdn.com', status: 'Active' },
        { id: 3, name: 'Inventory Alert Report', frequency: 'Daily 6:00 AM', recipients: 'inventory@isdn.com', status: 'Active' }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
    const [formData, setFormData] = useState({ name: '', frequency: '', recipients: '' });

    const handleEdit = (report: ScheduledReport) => {
        setEditingReport(report);
        setFormData({ name: report.name, frequency: report.frequency, recipients: report.recipients });
        setIsModalOpen(true);
    };

    const handlePrepareAdd = () => {
        setEditingReport(null);
        setFormData({ name: '', frequency: '', recipients: '' });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this schedule?')) {
            setReports(prev => prev.filter(r => r.id !== id));
            toast.success('Schedule deleted successfully');
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingReport) {
            setReports(prev => prev.map(r => r.id === editingReport.id ? { ...r, ...formData } : r));
            toast.success('Schedule updated successfully');
        } else {
            const newReport: ScheduledReport = {
                id: Date.now(),
                ...formData,
                status: 'Active'
            };
            setReports(prev => [...prev, newReport]);
            toast.success('New report schedule created');
        }
        setIsModalOpen(false);
    };

    const toggleStatus = (id: number) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r));
        toast.info('Status updated');
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Automated Report Scheduling</h2>
                    <p className="text-gray-500">Configure automated delivery of key business insights.</p>
                </div>
                <button
                    onClick={handlePrepareAdd}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Schedule New Report
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Clock className="text-blue-600" size={20} />
                    <h3 className="font-bold text-gray-900">Active Schedules</h3>
                </div>
                <div className="p-6 space-y-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">No active schedules found.</div>
                    ) : (
                        reports.map((schedule) => (
                            <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg text-gray-900">{schedule.name}</h4>
                                        <button
                                            onClick={() => toggleStatus(schedule.id)}
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${schedule.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                                }`}
                                        >
                                            {schedule.status}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {schedule.frequency}</span>
                                        <span className="flex items-center gap-1"><Mail size={14} /> {schedule.recipients}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(schedule)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(schedule.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{editingReport ? 'Edit Schedule' : 'New Schedule'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Report Name</label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                >
                                    <option value="">Select Report Type...</option>
                                    <option value="Weekly Sales Summary">Weekly Sales Summary</option>
                                    <option value="Monthly Financial Report">Monthly Financial Report</option>
                                    <option value="Inventory Alert Report">Inventory Alert Report</option>
                                    <option value="Staff Performance Log">Staff Performance Log</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Frequency</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Every Monday 9:00 AM"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Recipients</label>
                                <input
                                    type="email"
                                    placeholder="email@company.com"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.recipients}
                                    onChange={e => setFormData({ ...formData, recipients: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Save Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
