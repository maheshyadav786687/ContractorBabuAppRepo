import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '@/services/quotationService';
import type { Quotation } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowLeft, Download, Loader2 } from 'lucide-react';

import { downloadQuotationPdf } from '@/lib/pdfUtils';

export default function QuotationView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                setLoading(true);
                const q = await quotationService.getById(id);
                setQuotation(q);
            } catch (err) {
                console.error('Failed to load quotation', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!quotation) return <div className="p-6">Quotation not found</div>;

    const calculateTotal = (items: any[]) => items.reduce((s, it) => s + (it.amount || 0), 0);
    const total = calculateTotal(quotation.items || []);

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Quotations : {quotation.quotationNumber}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                        try {
                            await downloadQuotationPdf(quotation);
                        } catch (err) {
                            console.error('PDF generation failed', err);
                            window.print();
                        }
                    }}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent id="quotation-pdf-root">
                    {/* Header: company left, QUOTATION title right */}
                    <div className="flex items-start justify-between pt-3">
                        <div>
                            <div className="text-2xl font-semibold">ConstructPro Inc.</div>
                            <div className="text-sm text-gray-500">123 Construction Ave, Metropolis</div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl tracking-wider font-semibold">Quotation</div>
                            <div className="text-sm font-semibold mt-1">#{quotation.quotationNumber}</div>
                        </div>
                    </div>

                    <hr className="border-t my-6" />

                    {/* Billed to (left) and Details (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-m font-semibold mb-2 text-muted-foreground">Quote to</div>
                            <div className="font-semibold text-lg">{quotation.clientName || '-'}</div>
                            {quotation.clientAddress && <div className="text-sm text-gray-600 mt-1">{quotation.clientAddress}</div>}
                            {quotation.clientEmail && <div className="text-sm text-gray-600 mt-1">{quotation.clientEmail}</div>}
                            {quotation.clientPhone && <div className="text-sm text-gray-600">{quotation.clientPhone}</div>}
                        </div>

                        <div className="text-right">
                            <div className="text-m font-semibold mb-2 text-muted-foreground">Details</div>
                            <div className="text-sm text-gray-500">Date: <span className="font-medium">{new Date(quotation.quotationDate).toLocaleDateString()}</span></div>
                            <div className="mt-2 text-sm text-gray-500">Status: <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${quotation.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{quotation.status || '—'}</span></div>
                            <div className="mt-2 text-sm text-gray-500">Project: <span className="font-medium">{quotation.projectName || '-'}</span></div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-6">
                        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                            <thead>
                                <tr className="text-left text-xs text-gray-500 border-b">
                                    <th className="py-3 w-[40px]">#</th>
                                    <th className="py-3 w-[180px]">Description</th>
                                    <th className="py-3 w-[70px]">Incl. Material</th>
                                    <th className="py-3 w-[110px]">Dimensions</th>
                                    <th className="py-3 w-[60px]">Area</th>
                                    <th className="py-3 w-[40px]">Qty</th>
                                    <th className="py-3 w-[50px]">Unit</th>
                                    <th className="py-3 text-right w-[80px]">Rate</th>
                                    <th className="py-3 text-right w-[90px]">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((it: any, idx: number) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="py-4 align-top">{idx + 1}</td>
                                        <td className="py-4 align-top">{it.description}</td>
                                        <td className="py-4 align-top">{it.isWithMaterial ? 'Yes' : 'No'}</td>
                                        <td className="py-4 align-top">{(it.length ?? '-') + ' × ' + (it.width ?? '-') + ' × ' + (it.height ?? '-')}</td>
                                        <td className="py-4 align-top">{it.area ?? '-'}</td>
                                        <td className="py-4 align-top">{it.quantity ?? '-'}</td>
                                        <td className="py-4 align-top">{it.unit ?? '-'}</td>
                                        <td className="py-4 text-right align-top">{it.rate?.toLocaleString ? `₹${it.rate.toLocaleString()}` : it.rate}</td>
                                        <td className="py-4 text-right font-semibold align-top">₹{(it.amount || 0).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2" />
                        <div className="md:col-span-1">
                            <div className="bg-white p-4 rounded-md shadow-sm border">
                                <div className="flex justify-between py-2 text-sm">
                                    <div>Subtotal</div>
                                    <div>₹{total.toLocaleString()}</div>
                                </div>
                                <div className="flex justify-between py-2 text-sm">
                                    <div>Tax ({quotation.taxPercentage || 0}%)</div>
                                    <div>₹{((total * (quotation.taxPercentage || 0)) / 100).toFixed(2)}</div>
                                </div>
                                <div className="flex justify-between py-2 text-sm">
                                    <div>Discount ({quotation.discountPercentage || 0}%)</div>
                                    <div className="text-red-600">- ₹{((total * (quotation.discountPercentage || 0)) / 100).toFixed(2)}</div>
                                </div>
                                <div className="flex justify-between py-4 text-lg font-bold border-t mt-2">
                                    <div className="text-m font-semibold mb-2">Grand Total</div>
                                    <div className="text-m font-semibold mb-2">₹{(total + (total * (quotation.taxPercentage || 0)) / 100 - (total * (quotation.discountPercentage || 0)) / 100).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        <div className="uppercase text-xs font-medium mb-2">Notes</div>
                        <div>{quotation.remarks || 'This quotation is valid for 30 days.'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
