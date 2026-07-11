// PastRecordStatementPDF.jsx — Canvas-rendered PDF-style archived statement
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

// Deep Teal / Emerald Color System (Archived feel)
const COLORS = {
    primary: '#064E3B',      // Emerald 900 (deep green for headers)
    secondary: '#065F46',    // Emerald 800
    accent: '#0D9488',       // Teal 600 (vivid accent)
    accentLight: '#14B8A6',  // Teal 500 (lighter accent)
    textDark: '#1E293B',     // Slate 800
    textMuted: '#64748B',    // Slate 500
    textLight: '#94A3B8',    // Slate 400
    bgLight: '#F0FDFA',      // Teal 50
    bgStripe: '#F0FDF4',     // Green 50 (alt row)
    border: '#D1FAE5',       // Emerald 100 (soft green borders)
    borderDark: '#A7F3D0',   // Emerald 200
    success: '#16803D',      // Green 700
    cleared: '#059669',      // Emerald 600 (for cleared stamp)
    stamp: '#10B981',        // Emerald 500 (watermark)
    white: '#FFFFFF',
};

// ─── Canvas Renderer ────────────────────────────────────────
const renderPastRecordStatement = (canvas, { record }) => {
    const ctx = canvas.getContext('2d');
    const W = 794;  // A4 width at 96dpi
    const margin = 45;
    const contentW = W - margin * 2;
    let y = 0;

    const ledger = record.ledger || [];
    const summary = record.summary || {};
    const shopSnap = record.shopSnapshot || {};

    // Estimate canvas height
    const headerH = 240;
    const tableHeaderH = 32;
    const rowH = 34;
    const footerH = 260;
    const estimatedH = headerH + tableHeaderH + (ledger.length * rowH) + footerH + 120;
    const H = Math.max(1123, estimatedH);

    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(2, 2);

    // ─── Background
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, W, H);

    // ─── Top Brand Bars (Teal gradient look)
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, 6, W, 2);
    y = 8 + 30;

    // ─── Title & Subtitle (Left side)
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.fillText('ARCHIVED STATEMENT', margin, y);
    y += 18;

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText('Completed transaction cycle — all dues cleared', margin, y);

    // ─── Statement Metadata (Right side)
    const rightAlignX = W - margin;
    let ry = y - 18;

    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('STATEMENT NO.', rightAlignX, ry);
    ry += 14;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText(`#${record.statementNumber || 'STM-000000'}`, rightAlignX, ry);
    ry += 16;

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('CYCLE', rightAlignX, ry);
    ry += 14;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText(`#${record.cycleNumber || 1}`, rightAlignX, ry);
    ctx.textAlign = 'left';

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
    ctx.fillText(shopSnap.shopName || 'Store', margin + 16, syOffset);
    syOffset += 16;

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    if (shopSnap.address) { ctx.fillText(shopSnap.address, margin + 16, syOffset); syOffset += 14; }
    if (shopSnap.phone) { ctx.fillText(`📞 ${shopSnap.phone}`, margin + 16, syOffset); syOffset += 14; }
    if (shopSnap.email) { ctx.fillText(`✉️ ${shopSnap.email}`, margin + 16, syOffset); syOffset += 14; }

    // Fill Right Card (Customer Info)
    let cyOffset = y + 16;
    ctx.fillStyle = COLORS.accent;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('BILL TO (CUSTOMER)', rightX + 16, cyOffset);
    cyOffset += 16;

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText(record.customerName || 'Customer', rightX + 16, cyOffset);
    cyOffset += 16;

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    if (record.customerAddress) { ctx.fillText(record.customerAddress, rightX + 16, cyOffset); cyOffset += 14; }
    if (record.customerPhone) { ctx.fillText(`📞 ${record.customerPhone}`, rightX + 16, cyOffset); cyOffset += 14; }
    if (record.customerEmail && !record.customerEmail.includes('@auto.gen')) { ctx.fillText(`✉️ ${record.customerEmail}`, rightX + 16, cyOffset); cyOffset += 14; }

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
    ctx.fillText('STATEMENT PERIOD', margin + 12, y + 20);

    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.fillText(`${formatDate(record.startDate)}  —  ${formatDate(record.endDate)}`, margin + 135, y + 20);

    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(`Total Bills: ${summary.billCount || 0}`, W - margin - 12, y + 20);
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

    // Table header (deep teal)
    ctx.fillStyle = COLORS.primary;
    ctx.beginPath();
    ctx.roundRect(margin, y, contentW, tableHeaderH, [6, 6, 0, 0]);
    ctx.fill();

    ctx.fillStyle = COLORS.white;
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
    ledger.forEach((entry, idx) => {
        const isEven = idx % 2 === 0;
        ctx.fillStyle = isEven ? COLORS.bgLight : COLORS.white;
        ctx.fillRect(margin, y, contentW, rowH);

        // Thin bottom border
        ctx.strokeStyle = COLORS.border;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(margin, y + rowH);
        ctx.lineTo(W - margin, y + rowH);
        ctx.stroke();

        ctx.font = '10px Inter, system-ui, sans-serif';
        cx = margin;

        // Date
        ctx.fillStyle = COLORS.textDark;
        ctx.fillText(formatDate(entry.date), cx + 8, y + 21);
        cx += cols[0].w;

        // Transaction
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        if (entry.type === 'bill') {
            ctx.fillStyle = COLORS.primary;
            ctx.fillText(`Bill #${(entry.billNumber || '').slice(-8) || 'N/A'}`, cx + 8, y + 21);
        } else {
            ctx.fillStyle = COLORS.cleared;
            const method = (entry.paymentMethod || 'cash').toUpperCase().replace('_', ' ');
            ctx.fillText(`Payment (${method})`, cx + 8, y + 21);
        }
        cx += cols[1].w;

        // Particulars (Two-line cell)
        const lines = (entry.particulars || '').split('\n');
        ctx.fillStyle = COLORS.textDark;
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        ctx.fillText(lines[0] || '', cx + 8, y + 15);

        if (lines[1]) {
            ctx.fillStyle = COLORS.textMuted;
            ctx.font = '8.5px Inter, system-ui, sans-serif';
            const subText = lines[1].length > 45 ? lines[1].slice(0, 42) + '...' : lines[1];
            ctx.fillText(subText, cx + 8, y + 26);
        }
        cx += cols[2].w;

        // Debit (+)
        ctx.textAlign = 'right';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = COLORS.textDark;
        ctx.fillText(entry.debit > 0 ? formatINR(entry.debit) : '—', cx + cols[3].w - 8, y + 21);
        cx += cols[3].w;

        // Credit (-)
        ctx.fillStyle = COLORS.success;
        ctx.fillText(entry.credit > 0 ? formatINR(entry.credit) : '—', cx + cols[4].w - 8, y + 21);
        cx += cols[4].w;

        // Balance
        ctx.fillStyle = entry.balance > 0 ? '#B91C1C' : entry.balance < 0 ? COLORS.success : COLORS.cleared;
        ctx.font = 'bold 10px Inter, system-ui, sans-serif';
        const balanceVal = entry.balance > 0
            ? `${formatINR(entry.balance)} Dr`
            : entry.balance < 0
                ? `${formatINR(Math.abs(entry.balance))} Cr`
                : 'Clear';
        ctx.fillText(balanceVal, cx + cols[5].w - 8, y + 21);
        ctx.textAlign = 'left';

        y += rowH;
    });

    // Table bottom line
    ctx.strokeStyle = COLORS.borderDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(W - margin, y);
    ctx.stroke();
    y += 20;

    // ─── Item count & Notes (Left Side)
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`${summary.transactionCount || ledger.length} transaction(s) recorded`, margin, y + 5);

    let ny = y + 25;
    ctx.fillStyle = COLORS.textLight;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('STATEMENT NOTES / TERMS', margin, ny);
    ny += 15;
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillText('This is an archived statement. All transactions have been settled.', margin, ny);
    ny += 12;
    ctx.fillText(`If you have questions, please contact ${shopSnap.shopName || 'the store'}.`, margin, ny);

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

    drawSummaryLine('Total Billed Amount:', formatINR(summary.totalBilled || 0));
    drawSummaryLine('Total Payments Received:', formatINR(summary.totalPaid || 0), false, COLORS.success);

    // Grand total bar — "CLEARED" style
    sy += 6;
    ctx.fillStyle = COLORS.cleared;
    ctx.beginPath();
    ctx.roundRect(summaryX, sy - 2, summaryW, 36, 6);
    ctx.fill();

    ctx.fillStyle = COLORS.white;
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    ctx.fillText('Final Balance', summaryX + 12, sy + 16);

    ctx.textAlign = 'right';
    ctx.font = 'bold 15px Inter, system-ui, sans-serif';
    ctx.fillText('✅ Cleared', summaryX + summaryW - 12, sy + 16);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    sy += 48;
    y = Math.max(ny + 15, sy);

    // ─── Cleared Stamp (rotated watermark style badge)
    const stampX = W - margin - 160;
    const stampY = y + 5;

    ctx.save();
    ctx.translate(stampX + 70, stampY + 18);
    ctx.rotate(-5 * Math.PI / 180);

    // Stamp border
    ctx.strokeStyle = COLORS.stamp;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-70, -18, 140, 36, 6);
    ctx.stroke();

    // Stamp text
    ctx.fillStyle = COLORS.stamp;
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLEARED', 0, 6);
    ctx.textAlign = 'left';

    ctx.restore();

    // ─── Bill Summary Bar
    y += 50;
    ctx.fillStyle = COLORS.bgLight;
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(margin, y, contentW, 30, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLORS.textMuted;
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.fillText('CYCLE SUMMARY:', margin + 12, y + 19);

    ctx.fillStyle = COLORS.textDark;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText(
        `📋 Bills: ${summary.billCount || 0}    💰 Payments: ${summary.paymentCount || 0}    ✅ Status: All Cleared`,
        margin + 115, y + 19
    );

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
    ctx.fillText('This is a system-generated archived statement. No physical signature is required.', margin, y);
    y += 14;

    ctx.fillStyle = COLORS.textLight;
    ctx.font = '9px Inter, system-ui, sans-serif';
    ctx.fillText(
        `Archived on ${formatDate(record.clearedAt)} | Cycle #${record.cycleNumber || 1} | Powered by ${shopSnap.shopName || 'Store Manager'}`,
        margin, y
    );
    y += 30;

    // Bottom brand bars
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(0, y, W, 6);
    ctx.fillStyle = COLORS.accent;
    ctx.fillRect(0, y + 6, W, 2);
    y += 8;

    // Resize canvas to fit content
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
// ─── PAST RECORD STATEMENT MODAL ────────────────────────────
// ═══════════════════════════════════════════════════════════
const PastRecordStatementPDF = ({ isOpen, onClose, record }) => {
    const canvasRef = useRef(null);

    const drawCanvas = useCallback(() => {
        if (!canvasRef.current || !record) return;
        renderPastRecordStatement(canvasRef.current, { record });
    }, [record]);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(drawCanvas, 100);
        }
    }, [isOpen, drawCanvas]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const name = (record?.customerName || 'Customer').replace(/\s+/g, '_');
        const cycle = record?.cycleNumber || 1;
        const link = document.createElement('a');
        link.download = `Archived_Statement_${name}_Cycle${cycle}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
        toast?.success?.('Archived statement downloaded!');
    };

    const handlePrint = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head><title>Archived Statement - ${record?.customerName} - Cycle #${record?.cycleNumber || 1}</title>
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

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-2 sm:p-4 lg:p-8">
            <div className="bg-white rounded-2xl shadow-2xl max-w-[850px] w-full my-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-emerald-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <div className="mr-2">
                        <h2 className="text-base sm:text-lg font-bold text-emerald-900 leading-tight">
                            Archived Statement
                        </h2>
                        <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">
                            {record.customerName} • Cycle #{record.cycleNumber} • {record.statementNumber}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium rounded-xl transition active:scale-95 shadow-sm"
                            title="Download Statement"
                            id="download-past-record-btn"
                        >
                            <Download size={15} />
                            <span className="hidden sm:inline">Download</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-xl transition active:scale-95"
                            title="Print Statement"
                            id="print-past-record-btn"
                        >
                            <Printer size={15} />
                            <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 transition"
                            title="Close"
                            id="close-past-record-pdf"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Swipe Tip for Mobile */}
                <div className="block md:hidden bg-emerald-50/80 border-b border-emerald-100/50 px-4 py-2 text-center text-[10px] text-emerald-800">
                    💡 Swipe left or right to scroll the full statement document.
                </div>

                {/* Canvas preview */}
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

export default PastRecordStatementPDF;
