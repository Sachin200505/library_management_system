import React from 'react';
import ReportService from '../../services/report.service';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
    const handleDownload = async (action, filename) => {
        try {
            const blob = await action();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("Download failed");
        }
    };

    const reports = [
        { name: 'Issued Books (PDF)', action: ReportService.downloadIssuedPdf, filename: 'issued_books.pdf', type: 'PDF' },
        { name: 'Issued Books (CSV)', action: ReportService.downloadIssuedCsv, filename: 'issued_books.csv', type: 'CSV' },
        { name: 'Overdue Books (CSV)', action: ReportService.downloadOverdueCsv, filename: 'overdue_books.csv', type: 'CSV' },
        { name: 'Fines (CSV)', action: ReportService.downloadFinesCsv, filename: 'fines.csv', type: 'CSV' },
        { name: 'Suggestions (CSV)', action: ReportService.downloadSuggestionsCsv, filename: 'suggestions.csv', type: 'CSV' },
        { name: 'Suggestions (PDF)', action: ReportService.downloadSuggestionsPdf, filename: 'suggestions.pdf', type: 'PDF' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full text-slate-800">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="text-blue-600 w-8 h-8" />
                    </div>
                    Reports Center
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${report.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {report.type}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">{report.name}</h3>
                        <p className="text-slate-500 text-sm mb-8 leading-relaxed">Download a comprehensive {report.type} report generated from the latest library data.</p>
                        <button
                            onClick={() => handleDownload(report.action, report.filename)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Generate Report
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
