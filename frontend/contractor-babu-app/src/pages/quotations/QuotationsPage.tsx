import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { quotationService } from '@/services/quotationService';
import { projectService } from '@/services/projectService';
import { siteService } from '@/services/siteService';
import { clientService } from '@/services/clientService';
import type { Site } from '@/types/site';
import type { Quotation, CreateQuotationDto, UpdateQuotationDto, CreateQuotationItemDto } from '@/types/quotation';
import type { Project } from '@/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/dropdown';
import { Plus, Search, Edit, Trash2, FileText, Calendar, IndianRupee, Grid3x3, List, Loader2, Eye, MoreVertical, Download, ChevronDown, X, Save, FolderKanban } from 'lucide-react';
import QuotationItemsEditor from '@/components/quotations/QuotationItemsEditor';

// PDF generation uses a printable HTML fallback when PDF libs are not installed.

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [sites, setSites] = useState<Site[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
    const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const initialFormState: CreateQuotationDto = {
        projectId: '',
        siteId: '',
        description: '',
        remarks: '',
        taxPercentage: 0,
        discountPercentage: 0,
        items: []
    };

    const [formData, setFormData] = useState<CreateQuotationDto>(initialFormState);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Calculated values for the form
    const subTotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subTotal * (formData.taxPercentage / 100);
    const discountAmount = subTotal * (formData.discountPercentage / 100);
    const grandTotal = subTotal + taxAmount - discountAmount;

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const siteId = searchParams.get("siteId");
        const projectId = searchParams.get("projectId");

        if (projectId && projects.length > 0) {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                setSearchTerm(project.name);
                return; // Prioritize project search
            }
        }

        if (siteId && sites.length > 0) {
            const site = sites.find(s => s.id === siteId);
            if (site) {
                setSearchTerm(site.name);
            }
        }
    }, [sites, projects, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [quotationsData, projectsData, sitesData, clientsData] = await Promise.all([
                quotationService.getAll(),
                projectService.getAll(),
                siteService.getAll(),
                clientService.getAll()
            ]);
            setQuotations(quotationsData);
            setProjects(projectsData);
            setSites(sitesData as Site[]);
            setClients(clientsData || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const [nextQuotationNumber, setNextQuotationNumber] = useState<string>('');

    const handleOpenDialog = async (quotation?: Quotation) => {
        if (quotation) {
            setEditingQuotation(quotation);
            setFormData({
                projectId: quotation.projectId,
                siteId: quotation.siteId || undefined,
                description: quotation.description || '',
                remarks: quotation.remarks || '',
                quotationDate: quotation.quotationDate,
                taxPercentage: quotation.taxPercentage,
                discountPercentage: quotation.discountPercentage,
                items: quotation.items.map(item => ({
                    id: item.id,
                    description: item.description,
                    quantity: item.quantity,
                    area: item.area,
                    length: (item as any).length,
                    width: (item as any).width,
                    height: (item as any).height,
                    unit: item.unit,
                    rate: item.rate,
                    amount: item.amount,
                    isWithMaterial: item.isWithMaterial,
                    sequence: item.sequence
                }))
            });
            setNextQuotationNumber(''); // Not needed for edit
        } else {
            setEditingQuotation(null);
            setFormData({
                ...initialFormState,
                quotationDate: new Date().toISOString().split('T')[0]
            });
            try {
                const number = await quotationService.getNextNumber();
                setNextQuotationNumber(number);
            } catch (error) {
                console.error('Failed to get next quotation number', error);
                setNextQuotationNumber('QT-????-????');
            }
        }
        // If opening create dialog and sites loaded, pre-select first site (optional)
        if (!quotation && sites.length > 0) {
            setFormData(prev => ({ ...prev, siteId: prev.siteId ?? sites[0].id }));
        }
        setIsDialogOpen(true);
    };

    // When site selection changes, auto-fill project dropdown with the first project for that site (if any)
    // If siteId is empty, do not change project.
    useEffect(() => {
        const siteId = formData.siteId;
        if (!siteId) return;

        const matched = projects.find(p => (p.siteId ?? '') === siteId);
        if (matched) {
            setFormData(prev => ({ ...prev, projectId: matched.id }));
        } else {
            // No project for this site — clear project selection
            setFormData(prev => ({ ...prev, projectId: '' }));
        }
    }, [formData.siteId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingQuotation) {
                // Update top-level quotation fields
                const updatePayload = {
                    description: formData.description,
                    remarks: formData.remarks,
                    quotationDate: formData.quotationDate,
                    taxPercentage: formData.taxPercentage,
                    discountPercentage: formData.discountPercentage
                } as UpdateQuotationDto;

                await quotationService.update(editingQuotation.id, updatePayload);

                // Reconcile items: deletes, updates, adds
                const originalIds = (editingQuotation.items || []).map(i => i.id);
                const formIds = (formData.items || []).map((i: any) => i.id).filter(Boolean as any) as string[];

                const toDelete = originalIds.filter(id => !formIds.includes(id));
                // delete removed items
                await Promise.all(toDelete.map(id => quotationService.removeItem(id)));

                // upsert current items
                const itemPromises: Promise<any>[] = [];
                for (const it of formData.items || []) {
                    if ((it as any).id) {
                        const updateItemDto = {
                            description: it.description,
                            quantity: it.quantity,
                            area: it.area,
                            length: (it as any).length,
                            width: (it as any).width,
                            height: (it as any).height,
                            unit: it.unit,
                            rate: it.rate,
                            amount: it.amount,
                            isWithMaterial: it.isWithMaterial,
                            sequence: it.sequence
                        };
                        itemPromises.push(quotationService.updateItem((it as any).id, updateItemDto));
                    } else {
                        const createItemDto = {
                            description: it.description,
                            quantity: it.quantity,
                            area: it.area,
                            length: (it as any).length,
                            width: (it as any).width,
                            height: (it as any).height,
                            unit: it.unit,
                            rate: it.rate,
                            amount: it.amount,
                            isWithMaterial: it.isWithMaterial,
                            sequence: it.sequence
                        } as CreateQuotationItemDto;
                        itemPromises.push(quotationService.addItem(editingQuotation.id, createItemDto));
                    }
                }

                await Promise.all(itemPromises);
            } else {
                await quotationService.create(formData);
            }
            setIsDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error('Failed to save quotation:', err);
            alert(err.response?.data?.message || 'Failed to save quotation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quotation?')) return;
        try {
            await quotationService.delete(id);
            loadData();
        } catch (err) {
            console.error('Failed to delete quotation:', err);
            alert('Failed to delete quotation');
        }
    };

    const getSiteNameFromProjectId = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (project && project.siteId) {
            const site = sites.find(s => s.id === project.siteId);
            return site?.name || "";
        }
        return "";
    }

    const filteredQuotations = quotations.filter(q => {
        const siteName = getSiteNameFromProjectId(q.projectId);
        return q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.projectName && q.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (siteName && siteName.toLowerCase().includes(searchTerm.toLowerCase()))
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'approved': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const calculateTotal = (items: any[]) => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const handleDownloadPdf = async (quotation: Quotation) => {
        // Generate PDF in-page using html2canvas + jsPDF so we don't open a new window (avoids popup blockers).
        try {
            const itemsHtml = quotation.items.map((it: any, idx: number) => `
                <tr>
                    <td style="padding:8px;border:1px solid #ddd">${idx + 1}</td>
                    <td style="padding:8px;border:1px solid #ddd">${it.description || ''}</td>
                    <td style="padding:8px;border:1px solid #ddd">${(it.length ?? '-') + ' × ' + (it.width ?? '-') + ' × ' + (it.height ?? '-')}</td>
                    <td style="padding:8px;border:1px solid #ddd;text-align:right">${it.quantity ?? ''}</td>
                    <td style="padding:8px;border:1px solid #ddd;text-align:right">${it.rate?.toLocaleString?.() ?? it.rate ?? ''}</td>
                    <td style="padding:8px;border:1px solid #ddd;text-align:right">${(it.amount ?? 0).toLocaleString()}</td>
                </tr>
            `).join('');

            const total = calculateTotal(quotation.items || []);
            const html = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:20px; color:#111; width:800px">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                        <div>
                            <h1 style="margin:0;font-size:20px">Quotation: ${quotation.quotationNumber}</h1>
                            <div>${quotation.projectName ?? ''}</div>
                            <div>${new Date(quotation.quotationDate).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align:right">
                            <div><strong>Status:</strong> ${quotation.status}</div>
                            <div>${quotation.remarks ?? ''}</div>
                        </div>
                    </div>

                    <table style="border-collapse:collapse;width:100%;margin-top:12px">
                        <thead>
                            <tr>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:left;width:48px">#</th>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:left">Description</th>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:left;width:160px">Dimensions</th>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:right;width:100px">Qty</th>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:right;width:120px">Rate</th>
                                <th style="padding:8px;border:1px solid #ddd;background:#f9fafb;text-align:right;width:140px">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="display:flex;justify-content:flex-end;margin-top:16px;font-size:16px">
                        <div style="min-width:200px;text-align:right">
                            <div>Sub Total: ₹${total.toLocaleString()}</div>
                            <div>Tax: ₹${(total * ((quotation.taxPercentage || 0) / 100)).toFixed(2)}</div>
                            <div>Discount: -₹${(total * ((quotation.discountPercentage || 0) / 100)).toFixed(2)}</div>
                            <div style="font-weight:700;margin-top:8px">Grand Total: ₹${(total + (total * ((quotation.taxPercentage || 0) / 100)) - (total * ((quotation.discountPercentage || 0) / 100))).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;

            // dynamically import libraries (they are installed in package.json)
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import('html2canvas'),
                import('jspdf')
            ]);

            // render offscreen container
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.innerHTML = html;
            document.body.appendChild(container);

            const canvas = await html2canvas(container, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`${quotation.quotationNumber || 'quotation'}.pdf`);
            document.body.removeChild(container);
        } catch (err) {
            console.error('PDF generation failed', err);
            // As a final fallback open printable view in new tab (user can save as PDF)
            try {
                const itemsHtml = quotation.items.map((it: any, idx: number) => `
                    <tr>
                        <td style="padding:8px;border:1px solid #ddd">${idx + 1}</td>
                        <td style="padding:8px;border:1px solid #ddd">${it.description || ''}</td>
                        <td style="padding:8px;border:1px solid #ddd">${(it.length ?? '-') + ' × ' + (it.width ?? '-') + ' × ' + (it.height ?? '-')}</td>
                        <td style="padding:8px;border:1px solid #ddd;text-align:right">${it.quantity ?? ''}</td>
                        <td style="padding:8px;border:1px solid #ddd;text-align:right">${it.rate?.toLocaleString?.() ?? it.rate ?? ''}</td>
                        <td style="padding:8px;border:1px solid #ddd;text-align:right">${(it.amount ?? 0).toLocaleString()}</td>
                    </tr>
                `).join('');

                const total = calculateTotal(quotation.items || []);
                const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Quotation - ${quotation.quotationNumber}</title></head><body><div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; padding:20px; color:#111">` +
                    `<h1>Quotation: ${quotation.quotationNumber}</h1><div>${quotation.projectName ?? ''}</div><div>${new Date(quotation.quotationDate).toLocaleDateString()}</div>` +
                    `<table style="border-collapse:collapse;width:100%;margin-top:12px"><thead><tr><th style="padding:8px;border:1px solid #ddd">#</th><th style="padding:8px;border:1px solid #ddd">Description</th><th style="padding:8px;border:1px solid #ddd">Qty</th><th style="padding:8px;border:1px solid #ddd">Rate</th><th style="padding:8px;border:1px solid #ddd">Amount</th></tr></thead><tbody>` +
                    itemsHtml +
                    `</tbody></table><div style="text-align:right;margin-top:12px">Sub Total: ₹${total.toLocaleString()}</div></div></body></html>`;

                const w = window.open('', '_blank', 'noopener,noreferrer');
                if (w) {
                    w.document.open();
                    w.document.write(html);
                    w.document.close();
                    w.focus();
                    setTimeout(() => w.print(), 500);
                } else {
                    alert('Popup blocked. Please allow popups for this site to download/save PDF.');
                }
            } catch (err2) {
                console.error('Final fallback failed', err2);
                alert('Failed to generate or open PDF.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                            <FileText className="h-6 w-6 text-primary" />
                            Quotations
                        </h1>
                        <p className="text-gray-500">Manage project quotations and estimates</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quotation
                </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        placeholder="Search quotations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-md">
                    <Button
                        variant={viewMode === 'card' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('card')}
                        className={viewMode === 'card' ? 'border-primary text-primary bg-white hover:bg-white hover:text-primary' : 'text-gray-600 hover:border-primary hover:text-primary hover:bg-transparent border border-transparent'}
                    >
                        <Grid3x3 className="h-4 w-4 mr-2" />
                        Cards
                    </Button>
                    <Button
                        variant={viewMode === 'table' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className={viewMode === 'table' ? 'border-primary text-primary bg-white hover:bg-white hover:text-primary' : 'text-gray-600 hover:border-primary hover:text-primary hover:bg-transparent border border-transparent'}
                    >
                        <List className="h-4 w-4 mr-2" />
                        Table
                    </Button>
                </div>
            </div>

            {/* Content */}
            {filteredQuotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="rounded-full bg-blue-100 p-4 mb-4">
                        <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No quotations found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        {searchTerm ? "Try adjusting your search" : "Create your first quotation"}
                    </p>
                </div>
            ) : viewMode === 'card' ? (
                /* Card View */
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredQuotations.map((quotation) => (
                        <Card key={quotation.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-gray-200 hover:border-primary/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shadow-inner">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{quotation.quotationNumber}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <FolderKanban className="h-3 w-3" />
                                                    <span>{quotation.projectName}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <DropdownMenu>
                                                <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === quotation.id ? null : quotation.id)} data-dropdown-trigger>
                                                    <Button variant="ghostPrimary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownContent open={openActionMenu === quotation.id} onClose={() => setOpenActionMenu(null)}>
                                                    <DropdownItem onClick={() => { navigate(`/quotations/${quotation.id}`); setOpenActionMenu(null); }} icon={Eye}>
                                                        View
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleOpenDialog(quotation); setOpenActionMenu(null); }} icon={Edit}>
                                                        Edit
                                                    </DropdownItem>
                                                    <DropdownItem onClick={() => { handleDelete(quotation.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                        Delete
                                                    </DropdownItem>
                                                </DropdownContent>
                                            </DropdownMenu>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(quotation.status)}`}>
                                                {quotation.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        {quotation.description ? (
                                            <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] italic">
                                                "{quotation.description}"
                                            </p>
                                        ) : (
                                            <div className="min-h-[40px] flex items-center text-gray-300 italic text-sm">No description provided</div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="p-2.5 rounded-lg bg-gray-50/50 border border-gray-100">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Amount</span>
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="h-3 w-3 text-green-600" />
                                                <span className="font-bold text-gray-900 leading-none">{calculateTotal(quotation.items).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-gray-50/50 border border-gray-100">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Date</span>
                                            <div className="flex items-center gap-1 text-gray-900 font-bold leading-none">
                                                <Calendar className="h-3 w-3 text-blue-600" />
                                                <span>{new Date(quotation.quotationDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDownloadPdf(quotation)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group/link border border-primary/10"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-white shadow-sm">
                                                <Download className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">Download PDF</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-primary/60">{quotation.items.length} items</span>
                                            <X className="h-3 w-3 text-primary/30 rotate-45" />
                                        </div>
                                    </button>
                                </div>
                                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* Table View */
                <Card>
                    <div className="bg-transparent rounded-md border border-gray-200">
                        <div>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quotation</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredQuotations.map((quotation) => (
                                        <tr key={quotation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{quotation.quotationNumber}</div>
                                                    {quotation.description && (
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{quotation.description}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{quotation.projectName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(quotation.quotationDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}>
                                                    {quotation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500 truncate max-w-[150px]">{quotation.remarks || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-semibold text-gray-900">₹{calculateTotal(quotation.items).toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">{quotation.items.length} items</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownTrigger onClick={() => setOpenActionMenu(openActionMenu === quotation.id ? null : quotation.id)} data-dropdown-trigger>
                                                        <Button variant="ghostPrimary" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownContent open={openActionMenu === quotation.id} onClose={() => setOpenActionMenu(null)} align="right">
                                                        <DropdownItem onClick={() => { navigate(`/quotations/${quotation.id}`); setOpenActionMenu(null); }} icon={Eye}>
                                                            View
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => { handleOpenDialog(quotation); setOpenActionMenu(null); }} icon={Edit}>
                                                            Edit
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => { handleDelete(quotation.id); setOpenActionMenu(null); }} icon={Trash2} className="text-red-600 hover:bg-red-50">
                                                            Delete
                                                        </DropdownItem>
                                                    </DropdownContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} className='p-0'>
                <DialogContent className="w-full sm:max-w-[1200px] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden mt-0">
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingQuotation ? <Edit className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                            {editingQuotation ? 'Edit Quotation' : 'Create Quotation'}
                        </DialogTitle>
                        {editingQuotation && (
                            <div className="text-sm text-gray-500">
                                {editingQuotation.quotationNumber}
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                        <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Top Section */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="quotationNumber">Quotation No.</Label>
                                    <Input
                                        id="quotationNumber"
                                        value={editingQuotation ? editingQuotation.quotationNumber : nextQuotationNumber}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quotationDate">Quotation Date</Label>
                                    <Input
                                        id="quotationDate"
                                        type="date"
                                        value={formData.quotationDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteId">Site *</Label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            className="w-full text-left flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white"
                                            onClick={() => setIsSiteDropdownOpen(o => !o)}
                                        >
                                            <span className="truncate">{sites.find(s => s.id === formData.siteId)?.name || 'Select Site'}</span>
                                            <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isSiteDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <div className={`absolute z-20 mt-1 w-full bg-white border rounded shadow-sm max-h-56 overflow-auto ${isSiteDropdownOpen ? 'block' : 'hidden'}`}>
                                            {sites.length === 0 ? (
                                                <div className="p-3 text-sm text-gray-500">No sites found</div>
                                            ) : (
                                                clients.length > 0 ? (
                                                    clients.map(client => {
                                                        const clientSites = sites.filter(s => s.clientId === client.id)
                                                        if (clientSites.length === 0) return null
                                                        return (
                                                            <div key={client.id} className="border-b last:border-b-0">
                                                                <div className="px-3 py-2 bg-gray-50 text-sm font-medium text-gray-800">{client.name}</div>
                                                                {clientSites.map(site => (
                                                                    <div
                                                                        key={site.id}
                                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm pl-6"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, siteId: site.id }))
                                                                            setIsSiteDropdownOpen(false)
                                                                        }}
                                                                    >
                                                                        <div className="text-gray-900">{site.name}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    })
                                                ) : (
                                                    sites.map(site => (
                                                        <div
                                                            key={site.id}
                                                            className="p-3 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, siteId: site.id }))
                                                                setIsSiteDropdownOpen(false)
                                                            }}
                                                        >
                                                            <div className="font-medium text-gray-900 pl-6">{site.name}</div>
                                                            <div className="text-xs text-gray-500 pl-9">{site.clientName || 'Unknown client'}</div>
                                                        </div>
                                                    ))
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="projectId">Project</Label>
                                    <Select
                                        id="projectId"
                                        value={formData.projectId ?? ''}
                                        onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                                    >
                                        <option value="">Select a project</option>
                                        {projects.map((project) => (
                                            <SelectItem key={project.id} value={project.id.toString()}>
                                                {project.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        id="status"
                                        value={editingQuotation ? editingQuotation.status : "Draft"}
                                        disabled
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Sent">Sent</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="min-h-[80px]"
                                />
                            </div>

                            {/* Items Section */}
                            <div className="space-y-2">
                                <Label>Quotation Items</Label>
                                <QuotationItemsEditor
                                    items={formData.items}
                                    onChange={(items) => setFormData({ ...formData, items })}
                                />
                            </div>

                            {/* Footer Section: Notes and Totals */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Notes</Label>
                                    <Textarea
                                        id="remarks"
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        className="min-h-[100px]"
                                        placeholder="Add any notes or remarks here..."
                                    />
                                </div>

                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h3 className="font-semibold text-gray-900 border-b pb-2">Summary</h3>

                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Sub Total:</span>
                                        <span className="font-medium">₹{subTotal.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 text-sm">Tax (%):</span>
                                            <Input
                                                type="number"
                                                className="w-20 h-8 text-right"
                                                value={formData.taxPercentage}
                                                onChange={(e) => setFormData({ ...formData, taxPercentage: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <span className="font-medium text-sm">₹{taxAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-600 text-sm">Discount (%):</span>
                                            <Input
                                                type="number"
                                                className="w-20 h-8 text-right"
                                                value={formData.discountPercentage}
                                                onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <span className="font-medium text-sm text-red-600">- ₹{discountAmount.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="font-bold text-gray-900">Grand Total:</span>
                                        <span className="font-bold text-lg text-blue-600">₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <DialogFooter className="p-6 pt-2 shrink-0">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="quotation-form"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : editingQuotation ? (
                                <Save className="mr-2 h-4 w-4" />
                            ) : (
                                <Plus className="mr-2 h-4 w-4" />
                            )}
                            {editingQuotation ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
