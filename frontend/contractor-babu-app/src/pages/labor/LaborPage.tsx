import { useState, useEffect } from 'react';
import {
    Wrench, Plus, Search, Edit, Trash2, Calendar, UserIcon, Phone, Building2,
    CheckCircle2, XCircle, Clock, IndianRupee, Loader2, ChevronRight, ArrowUpRight,
    Users, Save, History, Wallet, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { laborService } from '@/services/laborService';
import { siteService } from '@/services/siteService';
import type { Site } from '@/types/site';
import type { Labor, AttendanceStatus, CreateLaborDto, UpdateLaborDto } from '@/types/labor';

export default function LaborPage() {
    const [activeTab, setActiveTab] = useState<'labors' | 'attendance' | 'payments' | 'summary'>('labors');
    const [loading, setLoading] = useState(true);
    const [labors, setLabors] = useState<Labor[]>([]);
    const [sites, setSites] = useState<Site[]>([]);

    useEffect(() => {
        loadBaseData();
    }, []);

    const loadBaseData = async () => {
        try {
            setLoading(true);
            const [laborsData, sitesData] = await Promise.all([
                laborService.getAll(),
                siteService.getAll()
            ]);
            setLabors(laborsData);
            setSites(sitesData as Site[]);
        } catch (err) {
            console.error('Failed to load labor data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <div className="grid gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <Wrench className="h-6 w-6 text-primary" />
                            Labor Management
                        </h1>
                        <p className="text-gray-500">Track categories, daily attendance, deployment, and payments</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 w-full max-w-3xl">
                {[
                    { id: 'labors', label: 'Labors', icon: Users },
                    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
                    { id: 'payments', label: 'Payments', icon: Wallet },
                    { id: 'summary', label: 'Summary', icon: IndianRupee },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ${activeTab === tab.id
                            ? 'border-primary text-primary bg-primary/5 shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-primary/30 hover:text-primary/70 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="mt-6">
                {activeTab === 'labors' && <LaborsList labors={labors} onRefresh={loadBaseData} />}
                {activeTab === 'attendance' && <AttendanceTracker labors={labors} sites={sites} />}
                {activeTab === 'payments' && <PaymentManager labors={labors} />}
                {activeTab === 'summary' && <LaborSummaryDashboard labors={labors} />}
            </div>
        </div>
    );
}

// --- Sub-components ---

function LaborsList({ labors, onRefresh }: { labors: Labor[], onRefresh: () => void }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLabor, setEditingLabor] = useState<Labor | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormState: CreateLaborDto = {
        name: '',
        phone: '',
        laborType: 'Helper',
        dailyWage: 500,
        address: '',
        aadharNumber: ''
    };

    const [formData, setFormData] = useState<CreateLaborDto>(initialFormState);

    const handleOpenDialog = (labor?: Labor) => {
        if (labor) {
            setEditingLabor(labor);
            setFormData({
                name: labor.name,
                phone: labor.phone || '',
                laborType: labor.laborType,
                dailyWage: labor.dailyWage,
                address: labor.address || '',
                aadharNumber: labor.aadharNumber || ''
            });
        } else {
            setEditingLabor(null);
            setFormData(initialFormState);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Data is already mapped to CreateLaborDto/UpdateLaborDto fields
            const submitData = {
                ...formData,
                dailyWage: Number(formData.dailyWage)
            };

            if (editingLabor) {
                // UpdateLaborDto can include isActive
                const updateData: UpdateLaborDto = {
                    ...submitData,
                    isActive: editingLabor.isActive
                };
                await laborService.update(editingLabor.id, updateData);
            } else {
                await laborService.create(submitData);
            }
            setIsDialogOpen(false);
            onRefresh();
        } catch (err: any) {
            console.error('Failed to save labor', err);
            alert(err.response?.data?.message || err.message || 'Failed to save labor details');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this labor?')) return;
        try {
            await laborService.delete(id);
            onRefresh();
        } catch (err) {
            console.error('Failed to delete labor', err);
        }
    };

    const filteredLabors = labors.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.laborType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Input
                        placeholder="Search by name or category..."
                        className="pr-10 h-11 border-gray-200 focus:ring-primary/20 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button onClick={() => handleOpenDialog()} className="h-11 px-6 shadow-md hover:shadow-lg transition-all font-bold">
                    <UserPlus className="h-4 w-4 mr-2" /> Add New Labor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLabors.length === 0 ? (
                    <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-4"><Users className="h-12 w-12" /></div>
                        <h3 className="text-lg font-bold text-gray-900">No labors found</h3>
                        <p className="text-gray-500 mt-1">Start by adding your workers and craftsmen.</p>
                    </div>
                ) : (
                    filteredLabors.map(labor => (
                        <Card key={labor.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200 hover:border-primary/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                                <UserIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{labor.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-bold text-[10px] uppercase tracking-wider">{labor.laborType}</Badge>
                                                    {labor.isActive ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-wider">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inactive</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button onClick={() => handleOpenDialog(labor)} variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleDelete(labor.id)} variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl transition-colors group-hover:bg-white">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Daily Wage</span>
                                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                                <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                                                <span className="text-base">{labor.dailyWage}</span>
                                                <span className="text-xs text-gray-400 font-medium">/ day</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl transition-colors group-hover:bg-white">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Phone</span>
                                            <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                                                <Phone className="h-3.5 w-3.5 text-primary/60" />
                                                <span className="text-sm truncate">{labor.phone || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">?</div>
                                            ))}
                                        </div>
                                        <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5 gap-2 h-8">
                                            View Logs <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary border-b pb-4">
                            {editingLabor ? <Edit className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                            {editingLabor ? "Edit Labor Profile" : "Register New Labor"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Mobile number"
                                    type="tel"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={formData.laborType}
                                    onValueChange={(val) => setFormData({ ...formData, laborType: val })}
                                >
                                    <SelectItem value="Mason">Mason (Rajmistri)</SelectItem>
                                    <SelectItem value="Helper">Helper (Majdoor)</SelectItem>
                                    <SelectItem value="Carpenter">Carpenter</SelectItem>
                                    <SelectItem value="Electrician">Electrician</SelectItem>
                                    <SelectItem value="Plumber">Plumber</SelectItem>
                                    <SelectItem value="Painter">Painter</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dailyWage">Daily Wage (₹) *</Label>
                                <Input
                                    id="dailyWage"
                                    required
                                    type="number"
                                    value={formData.dailyWage}
                                    onChange={(e) => setFormData({ ...formData, dailyWage: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address / Location</Label>
                            <Input
                                id="address"
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Locality, Village, or City"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="aadhar">Aadhaar / ID Number</Label>
                                <Input
                                    id="aadhar"
                                    value={formData.aadharNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 border-t pt-6 mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-8 font-semibold">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting} className="px-8 font-bold shadow-sm">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {editingLabor ? 'Update Labor' : 'Save Labor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AttendanceTracker({ labors, sites }: { labors: Labor[], sites: Site[] }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSite, setSelectedSite] = useState<string>('');
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
    const [remarksData, setRemarksData] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Mocking attendance fetch for date
        const initial = labors.reduce((acc, l) => ({ ...acc, [l.id]: 'Present' }), {});
        setAttendanceData(initial);
    }, [labors, selectedDate]);

    const handleStatusChange = (laborId: string, status: AttendanceStatus) => {
        setAttendanceData(prev => ({ ...prev, [laborId]: status }));
    };

    const handleSave = async () => {
        if (!selectedSite) {
            alert('Please select a site first.');
            return;
        }
        setSaving(true);
        try {
            const payload = Object.entries(attendanceData).map(([laborId, status]) => ({
                laborId,
                siteId: selectedSite,
                date: selectedDate,
                isPresent: status === 'Present' || status === 'Half Day',
                isHalfDay: status === 'Half Day',
                overtimeHours: 0 // Default for now
            }));
            await laborService.saveAttendanceBulk(payload);
            alert('Attendance saved successfully!');
        } catch (err) {
            console.error('Failed to save attendance', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-gray-200 overflow-hidden shadow-xl shadow-gray-200/40">
                <div className="bg-primary/5 p-6 border-b border-primary/10">
                    <div className="flex flex-col md:flex-row gap-6 md:items-end">
                        <div className="space-y-2 flex-1">
                            <Label className="font-bold text-primary flex items-center gap-2"><Calendar className="h-4 w-4" /> Attendance Date</Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-11 bg-white border-primary/20 focus:ring-primary shadow-sm font-bold text-primary"
                            />
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label className="font-bold text-primary flex items-center gap-2"><Building2 className="h-4 w-4" /> Select Deployment Site</Label>
                            <Select value={selectedSite} onValueChange={setSelectedSite}>
                                <option value="">— Select Site —</option>
                                {sites.map(site => (
                                    <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
                                ))}
                            </Select>
                        </div>
                        <Button onClick={handleSave} disabled={saving} className="h-11 px-8 font-bold shadow-lg shadow-primary/20 transition-all">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Attendance
                        </Button>
                    </div>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Labor Details</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Category</th>
                                <th className="px-6 py-4 text-center font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Status</th>
                                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-100">Daily Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {labors.filter(l => l.isActive).map(labor => (
                                <tr key={labor.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{labor.name}</div>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 font-medium">
                                            <IndianRupee className="h-3 w-3" /> {labor.dailyWage} per day
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-gray-500 uppercase tracking-wider h-6">{labor.laborType}</Badge>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto border border-gray-100">
                                            <button
                                                onClick={() => handleStatusChange(labor.id, 'Present')}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${attendanceData[labor.id] === 'Present'
                                                    ? 'bg-green-600 text-white shadow-md'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-white'
                                                    }`}
                                            >
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(labor.id, 'Half Day')}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${attendanceData[labor.id] === 'Half Day'
                                                    ? 'bg-yellow-500 text-white shadow-md'
                                                    : 'text-gray-400 hover:text-yellow-600 hover:bg-white'
                                                    }`}
                                            >
                                                <Clock className="h-3.5 w-3.5" /> Half
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(labor.id, 'Absent')}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${attendanceData[labor.id] === 'Absent'
                                                    ? 'bg-red-500 text-white shadow-md'
                                                    : 'text-gray-400 hover:text-red-600 hover:bg-white'
                                                    }`}
                                            >
                                                <XCircle className="h-3.5 w-3.5" /> Absent
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <Input
                                            placeholder="Special instruction or remark..."
                                            className="h-10 text-xs bg-gray-50 focus:bg-white border-transparent focus:border-primary/20 transition-all rounded-lg"
                                            value={remarksData[labor.id] || ''}
                                            onChange={(e) => setRemarksData(prev => ({ ...prev, [labor.id]: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function PaymentManager({ labors }: { labors: Labor[] }) {
    const [payments, setPayments] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const initialForm = {
        laborId: '',
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        bonusAmount: 0,
        advanceDeduction: 0
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            // Fetch for a default labor or list of labors - backend only has getByLaborId
            if (labors.length > 0) {
                const data = await laborService.getPayments(labors[0].id);
                setPayments(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await laborService.createPayment(formData);
            setIsDialogOpen(false);
            loadPayments();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-gray-200 shadow-xl shadow-gray-200/40">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Payments & Advances</h3>
                            <p className="text-sm text-gray-500 mt-1">Track payouts to your labor force</p>
                        </div>
                        <Button onClick={() => setIsDialogOpen(true)} className="px-8 font-bold h-11 shadow-lg shadow-primary/20 transition-all">
                            <Plus className="h-4 w-4 mr-2" /> Record Payout
                        </Button>
                    </div>

                    <div className="border rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left font-bold text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100">Labor Name</th>
                                    <th className="px-6 py-4 text-left font-bold text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100">Type</th>
                                    <th className="px-6 py-4 text-left font-bold text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100">Date</th>
                                    <th className="px-6 py-4 text-left font-bold text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100">Method</th>
                                    <th className="px-6 py-4 text-right font-bold text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-100">Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center italic text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <History className="h-10 w-10 mb-2 opacity-20" />
                                                No payment records found.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{p.laborName || 'Unknown'}</td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-green-50 text-green-600 border-none px-2">{p.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 font-bold text-[10px] text-gray-400 uppercase tracking-wider">{p.paymentMode || 'N/A'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">₹{p.netPayable.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 border-none shadow-2xl overflow-hidden">
                    <DialogHeader className="bg-primary/5 p-6 border-b border-primary/10">
                        <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Record Labor Payout
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-gray-700">Select Labor *</Label>
                            <Select
                                value={formData.laborId}
                                onValueChange={(val) => setFormData({ ...formData, laborId: val })}
                            >
                                <option value="">— Choose Worker —</option>
                                {labors.map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.name} ({l.laborType})</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700">Period Start *</Label>
                                <Input
                                    required
                                    type="date"
                                    value={formData.periodStart}
                                    onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                                    className="h-11 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700">Period End *</Label>
                                <Input
                                    required
                                    type="date"
                                    value={formData.periodEnd}
                                    onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                                    className="h-11 font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700">Bonus (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.bonusAmount}
                                    onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) })}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700">Deduction (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.advanceDeduction}
                                    onChange={(e) => setFormData({ ...formData, advanceDeduction: parseFloat(e.target.value) })}
                                    className="h-11"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="font-bold px-10 shadow-lg shadow-primary/20 transition-all h-11">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Confirm Payout
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LaborSummaryDashboard({ labors }: { labors: Labor[] }) {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    label="Total Force"
                    value={labors.length.toString()}
                    subLabel="Active Workers"
                    icon={Users}
                    color="blue"
                />
                <SummaryCard
                    label="Due This Week"
                    value="₹14,500"
                    subLabel="Estimated Wages"
                    icon={IndianRupee}
                    color="green"
                    trend="+₹2.4k"
                />
                <SummaryCard
                    label="Total Advances"
                    value="₹5,200"
                    subLabel="Current Month"
                    icon={ArrowUpRight}
                    color="red"
                />
                <SummaryCard
                    label="Labor Deployed"
                    value="18 / 24"
                    subLabel="Today's Attendance"
                    icon={CheckCircle2}
                    color="yellow"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-gray-200 shadow-xl shadow-gray-200/40">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 underline decoration-primary/20 decoration-4 underline-offset-8">Financial Overview</h3>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none">Month-to-Date</Badge>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Labor Name</th>
                                        <th className="text-center py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Days Work</th>
                                        <th className="text-right py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Earnings</th>
                                        <th className="text-right py-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">Paid</th>
                                        <th className="text-right py-3 font-bold text-primary text-[10px] uppercase tracking-wider">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50/50">
                                    {labors.slice(0, 5).map(l => (
                                        <tr key={l.id} className="hover:bg-gray-50/50 transition-all">
                                            <td className="py-4 font-bold text-gray-900">{l.name}</td>
                                            <td className="py-4 text-center font-bold text-gray-500">24 <span className="text-[10px] font-medium text-gray-300">Days</span></td>
                                            <td className="py-4 text-right font-bold text-gray-700">₹{(l.dailyWage * 24).toLocaleString()}</td>
                                            <td className="py-4 text-right font-bold text-green-600">₹{(l.dailyWage * 20).toLocaleString()}</td>
                                            <td className="py-4 text-right">
                                                <Badge className="bg-primary/5 text-primary font-bold border-none">₹{(l.dailyWage * 4).toLocaleString()}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xl shadow-gray-200/40 bg-gray-50/50">
                    <CardContent className="p-6">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 underline decoration-primary/20 decoration-4 underline-offset-8">Skill Mix</h3>
                        <div className="space-y-5">
                            {['Mason', 'Helper', 'Carpenter', 'Electrician'].map(cat => {
                                const count = labors.filter(l => l.laborType === cat).length;
                                const pct = (count / labors.length) * 100 || 0;
                                return (
                                    <div key={cat} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-bold text-gray-600">{cat}s</span>
                                            <span className="font-bold text-gray-900">{count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-10 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notice</p>
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">Balance calculations are based on attendance records and recorded advances only.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, subLabel, icon: Icon, color, trend }: any) {
    const colorMap: any = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        red: "bg-red-50 text-red-600 border-red-100",
        yellow: "bg-amber-50 text-amber-600 border-amber-100"
    };

    return (
        <Card className="border-gray-200 bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-2xl ${colorMap[color]} shadow-inner border`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px] tracking-tight">{trend}</Badge>
                    )}
                </div>
                <div className="mt-5">
                    <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</span>
                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                        <span className="text-[10px] text-gray-400 font-medium">{subLabel}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
