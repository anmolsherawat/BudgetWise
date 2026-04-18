import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToCSV = (transactions, budgets) => {
    // CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";

    // Transactions Section
    csvContent += "--- TRANSACTIONS ---\n";
    csvContent += "Date,Type,Category,Amount,Description\n";
    (transactions || []).forEach(t => {
        const date = t.date ? format(new Date(t.date), 'yyyy-MM-dd') : 'N/A';
        const type = t.type || 'N/A';
        const category = t.category || 'Uncategorized';
        const amount = t.amount || 0;
        const desc = (t.description || '').replace(/,/g, ''); // prevent csv breaks
        csvContent += `${date},${type},${category},${amount},${desc}\n`;
    });

    csvContent += "\n--- BUDGETS ---\n";
    csvContent += "Category,Amount,Spent,Remaining\n";
    (budgets || []).forEach(b => {
        const category = b.category || 'N/A';
        const amount = b.amount || 0;
        const spent = b.spent || 0;
        const remaining = amount - spent;
        csvContent += `${category},${amount},${spent},${remaining}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (transactions, budgets, user) => {
    const doc = new jsPDF();
    const userName = user?.name || 'Valued User';

    // Theme Colors
    const primary = [5, 150, 105]; // emerald-600
    const textDark = [15, 23, 42]; // slate-900
    const textMuted = [100, 116, 139]; // slate-500
    const textLight = [255, 255, 255];
    const bgHeader = [15, 23, 42]; // slate-900

    // Currency Formatter
    const formatCurr = (val) => `$${(parseFloat(val) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // ================= HEADER BLOCK =================
    doc.setFillColor(bgHeader[0], bgHeader[1], bgHeader[2]);
    doc.rect(0, 0, 210, 45, 'F');

    // Main Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(textLight[0], textLight[1], textLight[2]);
    doc.text('FINANCIAL OVERVIEW', 14, 25);

    // Subtext & Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, 196, 25, { align: 'right' });
    doc.text('Confidential Intelligence Report', 14, 33);

    let currentY = 60;

    // ================= USER INFO =================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('PREPARED FOR', 14, currentY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(userName.toUpperCase(), 14, currentY + 8);
    if (user?.email) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(user.email, 14, currentY + 14);
        currentY += 14;
    } else {
        currentY += 8;
    }

    // ================= EXECUTIVE METRICS =================
    currentY += 20;
    const totalIncome = (transactions || []).filter(t => t.type === 'income').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const totalExpenses = (transactions || []).filter(t => t.type === 'expense').reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
    const netSavings = totalIncome - totalExpenses;

    const drawCard = (idx, title, amount, bgColor, titleColor, valColor) => {
        const cardWidth = 55;
        const x = 14 + (idx * (cardWidth + 8));

        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        doc.roundedRect(x, currentY, cardWidth, 24, 3, 3, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
        doc.text(title.toUpperCase(), x + (cardWidth / 2), currentY + 8, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(valColor[0], valColor[1], valColor[2]);
        doc.text(formatCurr(amount), x + (cardWidth / 2), currentY + 18, { align: 'center' });
    };

    // Render Cards
    drawCard(0, "Total Income", totalIncome, [236, 253, 245], [5, 150, 105], [4, 120, 87]); // Emerald
    drawCard(1, "Total Expenses", totalExpenses, [255, 241, 242], [225, 29, 72], [190, 18, 60]); // Rose
    drawCard(2, "Net Capital", netSavings, [248, 250, 252], [71, 85, 105], [15, 23, 42]); // Slate

    currentY += 45;

    // ================= BUDGET TRACKING =================
    if (budgets && budgets.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text('BUDGET TRACKING', 14, currentY);

        currentY += 8;
        const budgetData = budgets.map(b => {
            const amt = parseFloat(b.amount) || 0;
            const spt = parseFloat(b.spent) || 0;
            const rem = amt - spt;
            return [
                b.category || 'Uncategorized',
                formatCurr(amt),
                formatCurr(spt),
                formatCurr(rem)
            ];
        });

        autoTable(doc, {
            startY: currentY,
            head: [['Category', 'Allocated Budget', 'Amount Spent', 'Remaining']],
            body: budgetData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 6, lineColor: [226, 232, 240] },
            headStyles: { fillColor: [248, 250, 252], textColor: [71, 85, 105], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            margin: { left: 14, right: 14 }
        });
        currentY = doc.lastAutoTable?.finalY + 15 || currentY + 20;
    }

    // ================= TRANSACTION LEDGER =================
    if (transactions && transactions.length > 0) {
        if (currentY > 220) {
            doc.addPage();
            currentY = 30; // buffer past header if new page
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text('TRANSACTION LEDGER', 14, currentY);

        currentY += 8;
        const transactionData = transactions.map(t => [
            t.date ? format(new Date(t.date), 'MMM dd, yyyy') : 'N/A',
            t.description || t.category || 'Transaction',
            t.category || 'Uncategorized',
            t.type === 'income' ? 'CREDIT' : 'DEBIT',
            formatCurr(t.amount)
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Execution Date', 'Description', 'Category', 'Type', 'Net Volume']],
            body: transactionData,
            theme: 'striped',
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 5 },
            headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { textColor: [30, 41, 59] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 35 },
                3: { cellWidth: 25, fontStyle: 'bold' },
                4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 }
        });
    }

    // ================= PAGE FOOTERS =================
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(`FINANCE TRACKER PRO`, 14, 288);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${i} of ${pageCount}`, 196, 288, { align: 'right' });

        // Header fallback bar on subsequent pages to look clean
        if (i > 1) {
            doc.setFillColor(bgHeader[0], bgHeader[1], bgHeader[2]);
            doc.rect(0, 0, 210, 10, 'F');
        }
    }

    doc.save(`Finance_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
