// CustomerStatementPDF.jsx — Canvas-rendered PDF-style customer statement
import React, { useRef, useCallback } from 'react';
import { X, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Utilities ──────────────────────────────────────────────
const formatINR = (v) => '₹' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
}).format(Math.abs(v || 0));

const formatDate = (d) => {
    if (!d) return '';
    try {
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return ''; }
};

const formatShortDate = (d) => {
    if (!d) return '';
    try {
        return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return ''; }
};

// Elegant Color System (Charcoal & Warm Bronze)
const COLORS = {
    primary: '#0F172A',      // Slate 900 (deep charcoal for major headers, primary text)
    secondary: '#334155',    // Slate 700 (secondary headers/details)
    accent: '#854D0E',       // Yellow 800 (warm bronze/gold for elegant accents & highlights)
    textDark: '#1E293B',     // Slate 800 (main body text)
    textMuted: '#64748B',    // Slate 500 (secondary text)
    textLight: '#94A3B8',    // Slate 400 (captions & placeholders)
    bgLight: '#F8FAFC',      // Slate 50 (soft backgrounds)
    border: '#E2E8F0',       // Slate 200 (crisp, delicate borders)
    success: '#16803D',      // Green 700 (payments, paid totals)
};

// ─── Canvas PDF Renderer ────────────────────────────────────
const renderStatement = (canvas, { customer, bills, payments, summary, shop, dateRange }) => {
    const ctx = canvas.getContext('2d');
    const W = 794;  // A4 width at 96dpi
    const margin = 45;
    const contentW = W - margin * 2;
    let y = 0;

    // Group bills and payments chronologically
    const transactions = [];
    (bills || []).forEach(bill => {
        const dateStr = formatDate(bill.billDate || bill.createdAt);
        const itemNames = (bill.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ');
        transactions.push({
            date: dateStr,
            rawDate: new Date(bill.billDate || bill.createdAt),
            type: 'Bill',
            reference: bill.billNumber ? `Bill #${bill.billNumber.slice(-8)}` : 'Bill',
            particulars: 'Sales Invoice',
            subText: itemNames.length > 45 ? itemNames.slice(0, 42) + '...' : itemNames || 'Goods purchased',
            debit: bill.grandTotal || 0,
            credit: 0
        });
    });

    (payments || []).forEach(pay => {
        const dateStr = formatDate(pay.date || pay.createdAt);
        transactions.push({
            date: dateStr,
            rawDate: new Date(pay.date || pay.createdAt),
            type: 'Payment',
            reference: `Payment (${pay.paymentMethod ? pay.paymentMethod.toUpperCase().replace('_', ' ') : 'CASH'})`,
            particulars: pay.notes || 'Received Payment',
            subText: `Receipt ref #${pay._id.toString().slice(-6).toUpperCase()}`,
            debit: 0,
            credit: pay.amount || 0
        });
    });

    // Sort chronologically (oldest first)
    transactions.sort((a, b) => a.rawDate - b.rawDate);

    // Compute running balance
    let runningBal = 0;
    transactions.forEach(t => {
        runningBal += t.debit - t.credit;
        t.balance = runningBal;
    });

    // Estimate height dynamically based on items list
    const headerH = 220;
    const tableHeaderH = 32;
    const rowH = 34; // increased to fit two lines
    const footerH = 220;
    const estimatedH = headerH + tableHeaderH + (transactions.length * rowH) + footerH + 120;
    const H = Math.max(1123, estimatedH); // Min A4 height

    canvas.width = W * 2;   // 2x for retina
    canvas.height = H * 2;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(2, 2);

    // ─── Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // ─── Top Brand Bars
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, 6, W, 2);
    y = 8 + 30;

    // ─── Title & Subtitle (Left side)
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.fillText('STATEMENT OF ACCOUNT', margin, y);
    y += 18;

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText('Summary of customer transactions and outstanding balance', margin, y);

    // ─── Statement Metadata (Right side)
    const rightAlignX = W - margin;
    let ry = y - 18; // align vertically with the title
    
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('STATEMENT NO.', rightAlignX, ry);
    ry += 14;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    const stmtNum = `#STM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    ctx.fillText(stmtNum, rightAlignX, ry);
    ry += 16;

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('DATE OF ISSUE', rightAlignX, ry);
    ry += 14;

    ctx.fillStyle = COLORS.primary;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(formatShortDate(new Date()), rightAlignX, ry);
    ctx.textAlign = 'left'; // Reset alignment

    y = Math.max(y + 15, ry + 15);

    // ─── Separator
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(W - margin, y);
    ctx.stroke();
    y += 20;

    // ─── Cards for Store and Customer details
    const cardW = (contentW - 20) / 2;
    const rightX = margin + cardW + 20;

    // Store Info Card (Left)
    ctx.fillStyle = COLORS.bgLight;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin, y, cardW, 110, 8);
    ctx.fill();
    ctx.stroke();

    // Customer Info Card (Right)
    ctx.beginPath();
    ctx.roundRect(rightX, y, cardW, 110, 8);
    ctx.fill();
    ctx.stroke();

    // Fill Left Card (Store Info)
    let syOffset = y + 16;
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('FROM (STORE)', margin + 16, syOffset);
    syOffset += 16;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText(shop?.shopName || 'Your Store', margin + 16, syOffset);
    syOffset += 16;

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    if (shop?.address) {
        const addr = [shop.address.street, shop.address.city, shop.address.state].filter(Boolean).join(', ');
        if (addr) { ctx.fillText(addr, margin + 16, syOffset); syOffset += 14; }
    }
    if (shop?.phone) { ctx.fillText(`📞 ${shop.phone}`, margin + 16, syOffset); syOffset += 14; }
    if (shop?.email) { ctx.fillText(`✉️ ${shop.email}`, margin + 16, syOffset); syOffset += 14; }

    // Fill Right Card (Customer Info)
    let cyOffset = y + 16;
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('BILL TO (CUSTOMER)', rightX + 16, cyOffset);
    cyOffset += 16;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText(customer?.name || 'Customer', rightX + 16, cyOffset);
    cyOffset += 16;

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    if (customer?.address) {
        const addr = typeof customer.address === 'string' ? customer.address : [customer.address?.street, customer.address?.city].filter(Boolean).join(', ');
        if (addr) { ctx.fillText(addr, rightX + 16, cyOffset); cyOffset += 14; }
    }
    if (customer?.phone) { ctx.fillText(`📞 ${customer.phone}`, rightX + 16, cyOffset); cyOffset += 14; }
    if (customer?.email && !customer.email.includes('@auto.gen')) { ctx.fillText(`✉️ ${customer.email}`, rightX + 16, cyOffset); cyOffset += 14; }

    y += 110 + 15;

    // ─── Period Banner
    ctx.fillStyle = COLORS.bgLight;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin, y, contentW, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    const fromDateStr = bills.length > 0 ? formatDate(bills[bills.length - 1]?.billDate || bills[bills.length - 1]?.createdAt) : '';
    const toDateStr = bills.length > 0 ? formatDate(bills[0]?.billDate || bills[0]?.createdAt) : '';
    ctx.fillText('STATEMENT PERIOD', margin + 12, y + 20);
    
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.fillText(`${fromDateStr}  —  ${toDateStr}`, margin + 135, y + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(`Total Bills: ${bills.length}`, W - margin - 12, y + 20);
    ctx.textAlign = 'left';

    y += 32 + 15;

    // ═══ TABLE ═══
    const cols = [
        { label: 'DATE', w: 85, align: 'left' },
        { label: 'TRANSACTION', w: 110, align: 'left' },
        { label: 'PARTICULARS', w: 220, align: 'left' },
        { label: 'DEBIT (+)', w: 95, align: 'right' },
        { label: 'CREDIT (-)', w: 95, align: 'right' },
        { label: 'BALANCE', w: contentW - 85 - 110 - 220 - 95 - 95, align: 'right' },
    ];

    // Table header
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.roundRect(margin, y, contentW, tableHeaderH, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    let cx = margin;
    cols.forEach(col => {
        ctx.textAlign = col.align;
        const tx = col.align === 'right' ? cx + col.w - 8 : col.align === 'center' ? cx + col.w / 2 : cx + 8;
        ctx.fillText(col.label, tx, y + 20);
        cx += col.w;
    });
    ctx.textAlign = 'left';
    y += tableHeaderH;

    // Table rows
    transactions.forEach((tx, idx) => {
        const isEven = idx % 2 === 0;
        ctx.fillStyle = isEven ? '#F8FAFC' : '#FFFFFF';
        ctx.fillRect(margin, y, contentW, rowH);

        // Thin bottom border
        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, y + rowH);
        ctx.lineTo(W - margin, y + rowH);
        ctx.stroke();

        ctx.font = '10px Inter, system-ui, sans-serif';
        cx = margin;

        // Date
        ctx.fillStyle = COLORS.textDark;
        ctx.fillText(tx.date, cx + 8, y + 21);
        cx += cols[0].w;

        // Transaction Type / Reference
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillStyle = tx.type === 'Bill' ? COLORS.primary : COLORS.success;
        ctx.fillText(tx.reference, cx + 8, y + 21);
        cx += cols[1].w;

        // Particulars (Two-line cell: Title & Subtitle)
        ctx.fillStyle = COLORS.textDark;
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillText(tx.particulars, cx + 8, y + 15);
        
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = '8.5px Inter, system-ui, sans-serif';
        ctx.fillText(tx.subText, cx + 8, y + 26);
        cx += cols[2].w;

        // Debit (+)
        ctx.textAlign = 'right';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = COLORS.textDark;
        ctx.fillText(tx.debit > 0 ? formatINR(tx.debit) : '—', cx + cols[3].w - 8, y + 21);
        cx += cols[3].w;

        // Credit (-)
        ctx.fillStyle = COLORS.success;
        ctx.fillText(tx.credit > 0 ? formatINR(tx.credit) : '—', cx + cols[4].w - 8, y + 21);
        cx += cols[4].w;

        // Balance
        ctx.fillStyle = tx.balance > 0 ? '#B91C1C' : tx.balance < 0 ? COLORS.success : COLORS.textDark;
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        const balanceVal = tx.balance > 0 ? `${formatINR(tx.balance)} Dr` : tx.balance < 0 ? `${formatINR(Math.abs(tx.balance))} Cr` : 'Clear';
        ctx.fillText(balanceVal, cx + cols[5].w - 8, y + 21);
        ctx.textAlign = 'left';

        y += rowH;
    });

    // Table bottom line
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(W - margin, y);
    ctx.stroke();
    y += 20;

    // ─── Item count & Notes (Left Side)
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`${transactions.length} transaction(s) recorded`, margin, y + 5);

    let ny = y + 25;
    ctx.fillStyle = COLORS.textLight;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('STATEMENT NOTES / TERMS', margin, ny);
    ny += 15;
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillText('Please verify all transactions listed above. If you have any questions', margin, ny);
    ny += 12;
    ctx.fillText(`regarding this statement, please contact ${shop?.shopName || 'our store'}.`, margin, ny);

    // ─── Summary (Right Side)
    const summaryW = 240;
    const summaryX = W - margin - summaryW;
    let sy = y;

    const drawSummaryLine = (label, value, isBold = false, color = COLORS.textDark) => {
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = `${isBold ? 'bold ' : ''}11px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(label, summaryX, sy);
        
        ctx.fillStyle = color;
        ctx.font = `${isBold ? 'bold ' : ''}${isBold ? '13' : '11'}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(value, summaryX + summaryW, sy);
        
        ctx.textAlign = 'left';
        sy += isBold ? 22 : 18;
    };

    const totalPayments = summary?.totalPaymentsReceived !== undefined ? summary.totalPaymentsReceived : (summary?.totalPaid || 0);
    drawSummaryLine('Total Billed Amount:', formatINR(summary?.totalBilled || 0));
    drawSummaryLine('Total Payments Received:', formatINR(totalPayments), false, COLORS.success);

    // Grand total bar
    sy += 6;
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.roundRect(summaryX, sy - 2, summaryW, 36, 6);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    
    ctx.textAlign = 'left';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.fillText('Current Balance', summaryX + 12, sy + 16);
    
    ctx.textAlign = 'right';
    ctx.font = 'bold 15px Inter, system-ui, sans-serif';
    const outstandingVal = customer?.currentBalance !== undefined ? customer.currentBalance : (summary?.totalOutstanding || 0);
    const balanceStr = outstandingVal > 0 ? `${formatINR(outstandingVal)} Dr` : outstandingVal < 0 ? `${formatINR(Math.abs(outstandingVal))} Cr` : 'Clear';
    ctx.fillText(balanceStr, summaryX + summaryW - 12, sy + 16);
    
    ctx.textBaseline = 'alphabetic'; // Reset
    ctx.textAlign = 'left';

    sy += 48;
    y = Math.max(ny + 15, sy);

    // ─── Payment Stats Bar
    const paidBills = bills.filter(b => b.paymentStatus === 'paid').length;
    const pendingBills = bills.filter(b => b.paymentStatus === 'pending').length;
    const partialBills = bills.length - paidBills - pendingBills;

    y += 20;
    ctx.fillStyle = COLORS.bgLight;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin, y, contentW, 30, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('BILL SUMMARY:', margin + 12, y + 19);

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(`✅ Fully Paid: ${paidBills}    ⏳ Unpaid/Pending: ${pendingBills}    📝 Partially Paid: ${partialBills}`, margin + 95, y + 19);

    y += 45;

    // ─── Footer separator
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(W - margin, y);
    ctx.stroke();
    y += 20;

    // Footer content
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText('Thank you for your business!', margin, y);
    y += 18;

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillText('This is a system-generated statement. No physical signature is required.', margin, y);
    y += 14;

    ctx.fillStyle = COLORS.textLight;
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillText(`Generated on ${new Date().toLocaleString('en-IN')} | Powered by ${shop?.shopName || 'Store Manager'}`, margin, y);
    y += 30;

    // Bottom brand bars
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, y, W, 6);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, y + 6, W, 2);
    y += 8;

    // Resize canvas dynamically to fit content
    const finalH = y + 10;
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = canvas.width;
    tmpCanvas.height = finalH * 2;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(canvas, 0, 0);
    canvas.height = finalH * 2;
    canvas.style.height = finalH + 'px';
    ctx.drawImage(tmpCanvas, 0, 0);
};

// ═══════════════════════════════════════════════════════════
// ─── STATEMENT MODAL COMPONENT ──────────────────────────────
// ═══════════════════════════════════════════════════════════
const CustomerStatementPDF = ({ isOpen, onClose, customer, bills, payments, summary, shop }) => {
    const canvasRef = useRef(null);

    const drawCanvas = useCallback(() => {
        if (!canvasRef.current || !customer || !bills) return;
        renderStatement(canvasRef.current, { customer, bills, payments, summary, shop });
    }, [customer, bills, payments, summary, shop]);

    // Draw when modal opens
    React.useEffect(() => {
        if (isOpen) {
            // Small delay for canvas mount
            setTimeout(drawCanvas, 100);
        }
    }, [isOpen, drawCanvas]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `Statement_${customer?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
        toast?.success?.('Statement downloaded!');
    };

    const handlePrint = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head><title>Statement - ${customer?.name}</title>
                    <style>
                        body { margin: 0; display: flex; justify-content: center; }
                        img { max-width: 100%; height: auto; }
                        @media print { body { margin: 0; } img { width: 100%; } }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    <img src="${dataUrl}" />
                </body>
            </html>
        `);
        win.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-2 sm:p-4 lg:p-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-[850px] w-full my-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <div className="mr-2">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Statement</h2>
                        <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{customer?.name} • {bills?.length} bills</p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl transition active:scale-95 shadow-sm"
                            title="Download Statement"
                        >
                            <Download size={15} />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition active:scale-95"
                            title="Print Statement"
                        >
                            <Printer size={15} />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition"
                            title="Close"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Swipe Tip for Mobile */}
                <div className="block md:hidden bg-amber-50/80 border-b border-amber-100/50 px-4 py-2 text-center text-[10px] text-amber-800">
                    💡 Swipe left or right to scroll the full statement document.
                </div>

                {/* Canvas preview with horizontal scroll support */}
                <div className="p-2 sm:p-4 lg:p-6 bg-gray-50 overflow-x-auto scrollbar-thin">
                    <div className="mx-auto shadow-md sm:shadow-xl rounded-lg overflow-hidden bg-white" style={{ maxWidth: '794px' }}>
                        <canvas
                            ref={canvasRef}
                            className="block min-w-[750px] md:min-w-0 md:w-full h-auto mx-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerStatementPDF;
