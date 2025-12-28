import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { Quotation } from '@/types/quotation';
import type { Tenant } from '@/types/tenant';

export const downloadQuotationPdf = async (quotation: Quotation, tenant?: Tenant | null) => {
    try {
        const total = (quotation.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
        const taxAmount = (total * (quotation.taxPercentage || 0)) / 100;
        const discountAmount = (total * (quotation.discountPercentage || 0)) / 100;
        const grandTotal = total + taxAmount - discountAmount;

        const companyName = tenant?.companyName || 'ConstructPro Inc.';
        const fullAddress = tenant ? [
            tenant.address,
            tenant.city,
            tenant.state,
            tenant.pinCode ? ` - ${tenant.pinCode}` : ''
        ].filter(Boolean).join(', ').replace(',  -', ' -') : '123 Construction Ave, Metropolis';
        const companyAddress = fullAddress;
        const companyContact = (tenant?.phone || tenant?.email) ? `<div style="font-size: 14px; color: #6b7280; margin-top: 2px;">${[tenant?.phone, tenant?.email].filter(Boolean).join(' | ')}</div>` : '';
        const companyWebsite = tenant?.website ? `<div style="font-size: 14px; color: #6b7280; margin-top: 2px;">${tenant.website}</div>` : '';
        const companyGst = tenant?.gstNumber ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">GST: ${tenant.gstNumber}</div>` : '';

        const itemsHtml = (quotation.items || []).map((it: any, idx: number) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px 0; vertical-align: top; width: 40px;">${idx + 1}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 180px;">${it.description || ''}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 70px;">${it.isWithMaterial ? 'Yes' : 'No'}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 110px;">${(it.length ?? '-') + ' × ' + (it.width ?? '-') + ' × ' + (it.height ?? '-')}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 60px;">${it.area ?? '-'}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 40px;">${it.quantity ?? '-'}</td>
                <td style="padding: 16px 0; vertical-align: top; width: 50px;">${it.unit ?? '-'}</td>
                <td style="padding: 16px 0; text-align: right; vertical-align: top; width: 80px;">${it.rate?.toLocaleString ? `₹${it.rate.toLocaleString()}` : it.rate}</td>
                <td style="padding: 16px 0; text-align: right; font-weight: 600; vertical-align: top; width: 90px;">₹${(it.amount || 0).toLocaleString()}</td>
            </tr>
        `).join('');

        const html = `
            <div id="quotation-container" style="font-family: inherit; color: #111; width: 800px; background: white; margin: 0; box-sizing: border-box; padding: 24px;">
                <!-- Header -->
                <div id="section-header" style="display: flex; justify-content: space-between; align-items: flex-start; padding-top: 12px;">
                    <div>
                        <div style="font-size: 24px; font-weight: 600; line-height: 1.2;">${companyName}</div>
                        <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">${companyAddress}</div>
                        ${companyContact}
                        ${companyWebsite}
                        ${companyGst}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: 600; letter-spacing: 0.1em; line-height: 1.2;">Quotation</div>
                        <div style="font-size: 14px; font-weight: 600; margin-top: 4px;">#${quotation.quotationNumber}</div>
                    </div>
                </div>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

                <!-- Addresses -->
                <div id="section-addresses" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Quote to</div>
                        <div style="font-size: 18px; font-weight: 600;">${quotation.clientName || '-'}</div>
                        <div style="font-size: 14px; color: #4b5563; margin-top: 4px;">${quotation.clientAddress || ''}</div>
                        <div style="font-size: 14px; color: #4b5563; margin-top: 2px;">${quotation.clientEmail || ''}</div>
                        <div style="font-size: 14px; color: #4b5563;">${quotation.clientPhone || ''}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px; font-weight: 600; color: #6b7280; margin-bottom: 8px;">Details</div>
                        <div style="font-size: 14px; color: #6b7280;">Date: <span style="font-weight: 500; color: #111;">${new Date(quotation.quotationDate).toLocaleDateString()}</span></div>
                        <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">Status: <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 14px; background: ${quotation.status?.toLowerCase() === 'approved' ? '#dcfce7' : '#f3f4f6'}; color: ${quotation.status?.toLowerCase() === 'approved' ? '#15803d' : '#374151'};">${quotation.status || '—'}</span></div>
                        <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">Project: <span style="font-weight: 500; color: #111;">${quotation.projectName || '-'}</span></div>
                    </div>
                </div>

                <!-- Table -->
                <div style="margin-top: 24px;">
                    <table id="quotation-table" style="width: 100%; border-collapse: collapse; font-size: 14px; table-layout: fixed;">
                        <thead id="table-head">
                            <tr style="text-align: left; border-bottom: 1px solid #e5e7eb; background: white;">
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 40px;">#</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 180px;">Description</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 70px;">Incl. Material</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 110px;">Dimensions</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 60px;">Area</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 40px;">Qty</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; width: 50px;">Unit</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; text-align: right; width: 80px;">Rate</th>
                                <th style="padding: 12px 0; font-size: 0.75rem; color: #6b7280; font-weight: 400; text-align: right; width: 90px;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>

                <!-- Summary -->
                <div id="section-summary" style="margin-top: 24px; display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
                    <div></div>
                    <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                            <div style="color: #111;">Subtotal</div>
                            <div style="color: #111;">₹${total.toLocaleString()}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                            <div style="color: #111;">Tax (${quotation.taxPercentage || 0}%)</div>
                            <div style="color: #111;">₹${taxAmount.toFixed(2)}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                            <div style="color: #111;">Discount (${quotation.discountPercentage || 0}%)</div>
                            <div style="color: #dc2626;">- ₹${discountAmount.toFixed(2)}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 16px 0; font-size: 18px; font-weight: 700; border-top: 1px solid #e5e7eb; margin-top: 8px;">
                            <div style="font-size: 14px; font-weight: 600;">Grand Total</div>
                            <div style="font-size: 14px; font-weight: 600;">₹${grandTotal.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div id="section-footer" style="margin-top: 24px; font-size: 14px; color: #6b7280;">
                    <div style="text-transform: uppercase; font-size: 12px; font-weight: 500; margin-bottom: 8px;">Notes</div>
                    <div style="line-height: 1.5;">${quotation.remarks || 'This quotation is valid for 30 days.'}</div>
                </div>
            </div>
        `;

        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.backgroundColor = 'white';
        container.style.margin = '0';
        container.style.boxSizing = 'border-box';
        container.innerHTML = html;
        document.body.appendChild(container);

        const tableElement = container.querySelector('#quotation-table') as HTMLElement;
        const theadElement = container.querySelector('#table-head') as HTMLElement;

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: 800
        });

        // Robust header capture: Create a temporary table to keep column widths context
        const hTable = document.createElement('table');
        hTable.style.width = tableElement.offsetWidth + 'px';
        hTable.style.borderCollapse = 'collapse';
        hTable.style.tableLayout = 'fixed';
        const theadClone = theadElement.cloneNode(true);
        hTable.appendChild(theadClone);

        const hContainer = document.createElement('div');
        hContainer.style.position = 'fixed';
        hContainer.style.left = '-9999px';
        hContainer.style.width = '800px'; // Match main container width
        hContainer.style.padding = '0 24px'; // Match side padding of main container
        hContainer.style.boxSizing = 'border-box';
        hContainer.style.backgroundColor = 'white';
        hContainer.appendChild(hTable);
        document.body.appendChild(hContainer);

        const theadCanvas = await html2canvas(hContainer, { scale: 2, backgroundColor: '#ffffff' });
        const theadImg = theadCanvas.toDataURL('image/png');
        document.body.removeChild(hContainer);

        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const marginLeft = 40;
        const marginTop = 40;
        const marginBottom = 40;
        const contentWidth = pdfWidth - (marginLeft * 2);

        // Use logical width (800) for mapping to prevent drifts
        const scale = contentWidth / 800;
        const imgHeightPt = (canvas.height / 2) * scale;

        // Calculate safe break points
        const getRelBottom = (el: HTMLElement | null) => {
            if (!el) return 0;
            return (el.offsetTop + el.offsetHeight) * scale;
        };

        const rows = Array.from(tableElement.querySelectorAll('tbody tr')) as HTMLElement[];
        const safeBreakPoints: number[] = [
            getRelBottom(container.querySelector('#section-addresses')),
            (tableElement.offsetTop + (theadElement?.offsetHeight || 0)) * scale, // After table header
            ...rows.map(r => (tableElement.offsetTop + r.offsetTop + r.offsetHeight) * scale),
            getRelBottom(container.querySelector('#section-summary')),
            getRelBottom(container.querySelector('#section-footer'))
        ].filter(p => p > 0);

        const tableTopPxVal = tableElement ? tableElement.offsetTop : 0;
        const tableHeightPx = tableElement ? tableElement.offsetHeight : 0;
        const tableBottomPt = (tableTopPxVal + tableHeightPx) * scale;

        const headerHeightPt = (theadCanvas.height / 2) * scale;

        const imgData = canvas.toDataURL('image/png');
        let yOffset = 0;
        let pageNum = 1;

        while (yOffset < imgHeightPt - 2) { // 2pt safety buffer
            if (pageNum > 1) pdf.addPage();

            let currentTopMargin = marginTop;
            let showHeader = false;

            if (pageNum > 1 && yOffset < tableBottomPt - 20) {
                showHeader = true;
                currentTopMargin += (headerHeightPt + 2); // 2pt safety gap
            }

            const printableHeight = pdfHeight - currentTopMargin - marginBottom;
            let sliceHeight = Math.min(printableHeight, imgHeightPt - yOffset);

            // ADJUST: Find safe break point
            const candidateBottom = yOffset + sliceHeight;
            if (candidateBottom < imgHeightPt - 10) { // Only adjust if not at the very end
                const bestBreak = safeBreakPoints
                    .filter(bp => bp > yOffset + 10 && bp <= candidateBottom)
                    .pop();

                if (bestBreak) {
                    sliceHeight = bestBreak - yOffset;
                }
            }

            // 1. Draw main content
            pdf.addImage(imgData, 'PNG', marginLeft, currentTopMargin - yOffset, contentWidth, imgHeightPt);

            // 2. Robust white masks with sub-pixel buffer (Draw BEFORE header)
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, currentTopMargin + 0.5, 'F');
            pdf.rect(0, currentTopMargin + sliceHeight - 0.5, pdfWidth, pdfHeight - (currentTopMargin + sliceHeight) + 1, 'F');

            if (showHeader) {
                pdf.addImage(theadImg, 'PNG', marginLeft, marginTop, contentWidth, headerHeightPt);
            }

            // 3. Add Page Numbers
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(`Page ${pageNum}`, pdfWidth - marginLeft, pdfHeight - marginBottom + 20, { align: 'right' });

            yOffset += sliceHeight;
            pageNum++;
        }

        pdf.save(`${quotation.quotationNumber}.pdf`);
        document.body.removeChild(container);
    } catch (err) {
        console.error('PDF generation failed', err);
        throw err;
    }
};
