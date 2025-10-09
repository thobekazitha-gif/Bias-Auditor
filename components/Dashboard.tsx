import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import MetricChart from './MetricChart';
import { 
    InfoIcon, 
    CheckIcon,
    SummaryIcon,
    MetricsIcon,
    MitigationIcon,
    StatementIcon,
    ImplicationsIcon,
    RecommendationsIcon,
    FrameworkIcon,
    ReferencesIcon,
    DownloadIcon,
    GoogleDriveIcon,
    CloseIcon
} from './icons/Icons';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  datasetDescription: string;
  attributes: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset, datasetDescription, attributes }) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showDriveInstructions, setShowDriveInstructions] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const downloadFile = (content: string, fileName: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const handleExportJson = () => {
        const jsonString = JSON.stringify(result, null, 2);
        downloadFile(jsonString, 'bias_audit_report.json', 'application/json');
    };
    
    const handleExportPdf = async () => {
        if (!reportRef.current || isGeneratingPdf) return;

        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            console.error("PDF generation libraries (jspdf, html2canvas) not found.");
            alert("Error: PDF generation libraries could not be loaded. Please refresh the page and try again.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;

        setIsGeneratingPdf(true);
        setShowExportMenu(false);

        const reportElement = reportRef.current;
        window.scrollTo(0, 0);

        try {
            const canvas = await html2canvas(reportElement, {
                scale: 2,
                backgroundColor: '#111827',
                useCORS: true,
                logging: false,
                ignoreElements: (element) => element.classList.contains('pdf-export-ignore'),
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasHeight / canvasWidth;
            const projectedImageHeight = pdfWidth * canvasAspectRatio;

            let heightLeft = projectedImageHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, projectedImageHeight, undefined, 'FAST');
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, projectedImageHeight, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            pdf.save('ai-bias-audit-report.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert("An error occurred while generating the PDF. Please check the console for details.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };


    const handleExportMetricsCsv = () => {
        let csvContent = '"Metric Name","Group","Score"\n';
        result.fairness_metrics.forEach(metric => {
            metric.scores.forEach(score => {
                csvContent += `"${metric.name}","${score.group}",${score.score}\n`;
            });
        });
        downloadFile(csvContent, 'fairness_metrics.csv', 'text/csv');
    };

    const handleExportMitigationCsv = () => {
        let csvContent = '"Strategy Name","Metric Name","Status","Group","Score"\n';
        result.mitigation_strategies.forEach(strategy => {
            strategy.before_after_metrics.before.forEach(score => {
                csvContent += `"${strategy.name}","${strategy.metric_name}","Before","${score.group}",${score.score}\n`;
            });
            strategy.before_after_metrics.after.forEach(score => {
                csvContent += `"${strategy.name}","${strategy.metric_name}","After","${score.group}",${score.score}\n`;
            });
        });
        downloadFile(csvContent, 'mitigation_strategies.csv', 'text/csv');
    };
    
    const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
        <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 ${className}`}>
            {children}
        </div>
    );

    const CardTitle: React.FC<{children: React.ReactNode, icon: React.ReactNode, action?: React.ReactNode}> = ({ children, icon, action }) => (
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-100 flex items-center gap-3">
                {icon}
                <span>{children}</span>
            </h3>
            {action}
        </div>
    );

    const ExportButton: React.FC<{onClick: () => void, title: string}> = ({ onClick, title }) => (
        <button onClick={onClick} title={title} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
            <DownloadIcon className="h-5 w-5" />
        </button>
    );

    return (
        <div className="animate-fade-in">
             {showDriveInstructions && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-lg w-full relative shadow-2xl shadow-red-900/40">
                        <button onClick={() => setShowDriveInstructions(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <CloseIcon className="h-6 w-6" />
                        </button>
                        <h3 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-3"><GoogleDriveIcon className="h-7 w-7" /> Save to Google Drive</h3>
                        <div className="space-y-4 text-gray-300">
                            <p><span className="font-bold text-red-400">Step 1:</span> First, download the report to your computer using the 'Download Report' option.</p>
                            <p><span className="font-bold text-red-400">Step 2:</span> Open <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">drive.google.com</a> in a new tab.</p>
                            <p><span className="font-bold text-red-400">Step 3:</span> Click the <span className="font-semibold text-white">'+ New'</span> button in Google Drive, select 'File Upload', and choose the <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">bias_audit_report.json</code> file you downloaded.</p>
                        </div>
                         <button onClick={() => setShowDriveInstructions(false)} className="mt-6 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                            Got it
                        </button>
                    </div>
                </div>
            )}
            <div ref={reportRef} className="space-y-8">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Bias Audit Report</h2>
                            <p className="text-gray-400 mt-2 max-w-3xl">
                               Analysis of: <span className="font-semibold text-gray-200">{datasetDescription}</span> for attributes: <span className="font-semibold text-gray-200">{attributes.join(', ')}</span>.
                            </p>
                        </div>
                         <div className="pdf-export-ignore flex items-center gap-4 flex-shrink-0">
                            <div className="relative" ref={exportMenuRef}>
                                <button 
                                    onClick={() => setShowExportMenu(prev => !prev)}
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:bg-red-800 disabled:cursor-wait"
                                    disabled={isGeneratingPdf}
                                >
                                    {isGeneratingPdf ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span className="ml-2">Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <DownloadIcon className="h-5 w-5" />
                                            <span>Export Report</span>
                                        </>
                                    )}
                                </button>
                                {showExportMenu && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-40 animate-fade-in-fast">
                                        <ul className="py-2">
                                            <li>
                                                <button onClick={handleExportJson} disabled={isGeneratingPdf} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <DownloadIcon className="h-5 w-5 text-gray-400" />
                                                    Download Report (.json)
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={handleExportPdf} disabled={isGeneratingPdf} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <DownloadIcon className="h-5 w-5 text-gray-400" />
                                                    {isGeneratingPdf ? 'Generating PDF...' : 'Download Report (.pdf)'}
                                                </button>
                                            </li>
                                            <li>
                                                 <button onClick={() => { setShowDriveInstructions(true); setShowExportMenu(false); }} disabled={isGeneratingPdf} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <GoogleDriveIcon className="h-5 w-5 text-gray-400" />
                                                    Save to Google Drive
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={onReset}
                                className="bg-gray-700 text-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isGeneratingPdf}
                            >
                                New Analysis
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardTitle icon={<SummaryIcon />}>Executive Summary</CardTitle>
                            <p className="text-gray-400 leading-relaxed">{result.summary}</p>
                        </Card>

                        <Card>
                            <CardTitle 
                                icon={<MetricsIcon />}
                                action={<ExportButton onClick={handleExportMetricsCsv} title="Export Metrics as CSV"/>}
                            >
                                Quantitative Fairness Metrics
                            </CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {result.fairness_metrics.map((metric, index) => (
                                    <div key={index} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700">
                                        <h4 className="font-bold text-gray-200">{metric.name}</h4>
                                        <p className="text-xs text-gray-500 mb-2">{metric.description}</p>
                                        <MetricChart data={metric.scores} />
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                             <CardTitle 
                                icon={<MitigationIcon />}
                                action={<ExportButton onClick={handleExportMitigationCsv} title="Export Mitigation Data as CSV" />}
                            >
                                Bias Mitigation Strategies
                            </CardTitle>
                            <div className="space-y-6">
                                 {result.mitigation_strategies.map((strategy, index) => (
                                    <div key={index} className="p-4 border border-gray-700 rounded-lg">
                                        <h4 className="text-lg font-semibold text-gray-200">{strategy.name}</h4>
                                        <p className="text-sm text-gray-400 mb-4">{strategy.description}</p>
                                        <p className="text-sm font-medium text-gray-300 mb-2">Effect on {strategy.metric_name}:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="text-center font-semibold text-sm mb-1 text-red-400">Before</h5>
                                                <MetricChart data={strategy.before_after_metrics.before} />
                                            </div>
                                            <div>
                                                <h5 className="text-center font-semibold text-sm mb-1 text-green-400">After</h5>
                                                <MetricChart data={strategy.before_after_metrics.after} color="#4ade80"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <CardTitle icon={<StatementIcon />}>Ethics Statement</CardTitle>
                            <div className="prose prose-invert prose-sm max-w-none text-gray-400 whitespace-pre-wrap">
                                {result.ethics_statement}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <Card>
                            <CardTitle icon={<ImplicationsIcon />}>Real-World Implications</CardTitle>
                             <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <InfoIcon className="h-5 w-5 text-yellow-500 mt-1" />
                                </div>
                                <p className="text-gray-400">{result.real_world_implications}</p>
                            </div>
                        </Card>

                        <Card>
                            <CardTitle icon={<RecommendationsIcon />}>Dataset Recommendations</CardTitle>
                            <ul className="space-y-3">
                                {result.dataset_recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start space-x-3">
                                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-400">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        <Card>
                            <CardTitle icon={<FrameworkIcon />}>{result.ethics_framework.title}</CardTitle>
                            <div className="space-y-4">
                                {result.ethics_framework.principles.map((principle, index) => (
                                    <div key={index}>
                                        <h4 className="font-semibold text-gray-200">{principle.name}</h4>
                                        <p className="text-sm text-gray-400">{principle.description}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                         <Card>
                            <CardTitle icon={<ReferencesIcon />}>References</CardTitle>
                            <ul className="space-y-2 list-disc list-inside">
                                {result.references.map((ref, index) => (
                                    <li key={index} className="text-sm text-red-400 hover:underline cursor-pointer">{ref}</li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;