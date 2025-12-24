import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '@/services/quotationService';
import type { Quotation } from '@/types/quotation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';

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

    if (loading) return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;
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
                        // generate PDF by capturing the rendered view
                        try {
                            const el = document.getElementById('quotation-pdf-root');
                            if (!el) throw new Error('Quotation root not found');

                            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                                import('html2canvas'),
                                import('jspdf')
                            ]);

                            const canvas = await html2canvas(el as HTMLElement, { scale: 2, useCORS: true });
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
                        } catch (err) {
                            console.error('PDF generation failed', err);
                            // fallback: open printable HTML in new tab
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
                    }}>
                        Download PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent id="quotation-pdf-root">
                    {/* Header: company left, QUOTATION title right */}
                    <div className="flex items-start justify-between pt-3">
                        <div>
                            <div className="text-2xl font-semibold text-muted-foreground">ConstructPro Inc.</div>
                            <div className="text-sm text-gray-500">123 Construction Ave, Metropolis</div>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl tracking-wider font-semibold text-muted-foreground">Quotation</div>
                            <div className="text-sm text-gray-500 mt-1">#{quotation.quotationNumber}</div>
                        </div>
                    </div>

                    <hr className="border-t my-6" />

                    {/* Billed to (left) and Details (right) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-gray-600 font-bold uppercase mb-2">Quote to</div>
                            <div className="font-semibold text-lg">{quotation.clientName || '-'}</div>
                            {quotation.clientAddress && <div className="text-sm text-gray-600 mt-1">{quotation.clientAddress}</div>}
                            {quotation.clientEmail && <div className="text-sm text-gray-600 mt-1">{quotation.clientEmail}</div>}
                            {quotation.clientPhone && <div className="text-sm text-gray-600">{quotation.clientPhone}</div>}
                        </div>

                        <div className="text-right">
                            <div className="text-xs text-gray-600 font-bold uppercase mb-2">Details</div>
                            <div className="text-sm text-gray-500">Date: <span className="font-medium">{new Date(quotation.quotationDate).toLocaleDateString()}</span></div>
                            <div className="mt-2 text-sm text-gray-500">Status: <span className={`inline-block px-2 py-0.5 rounded-full text-sm ${quotation.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{quotation.status || '—'}</span></div>
                            <div className="mt-2 text-sm text-gray-500">Project: <span className="font-medium">{quotation.projectName || '-'}</span></div>
                        </div>
                    </div>

                    <div className="overflow-x-auto mt-6">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 border-b">
                                    <th className="py-3 w-[40px]">#</th>
                                    <th className="py-3">Description</th>
                                    <th className="py-3">Dimensions</th>
                                    <th className="py-3">Incl. Material</th>
                                    <th className="py-3">Area</th>
                                    <th className="py-3">Qty</th>
                                    <th className="py-3">Unit</th>
                                    <th className="py-3 text-right">Rate</th>
                                    <th className="py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotation.items.map((it: any, idx: number) => (
                                    <tr key={idx} className="border-b hover:bg-gray-50">
                                        <td className="py-4 align-top">{idx + 1}</td>
                                        <td className="py-4 align-top">{it.description}</td>
                                        <td className="py-4 align-top">{(it.length ?? '-') + ' × ' + (it.width ?? '-') + ' × ' + (it.height ?? '-')}</td>
                                        <td className="py-4 align-top">{it.isWithMaterial ? 'Yes' : 'No'}</td>
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
                                    <div>Grand Total</div>
                                    <div>₹{(total + (total * (quotation.taxPercentage || 0)) / 100 - (total * (quotation.discountPercentage || 0)) / 100).toLocaleString()}</div>
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
