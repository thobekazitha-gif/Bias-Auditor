import React from 'react';
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
    ReferencesIcon
} from './icons/Icons';

interface DashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  datasetDescription: string;
  attributes: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ result, onReset, datasetDescription, attributes }) => {
    
    const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
        <div className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700 ${className}`}>
            {children}
        </div>
    );

    const CardTitle: React.FC<{children: React.ReactNode, icon: React.ReactNode}> = ({ children, icon }) => (
        <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-3">
            {icon}
            <span>{children}</span>
        </h3>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Bias Audit Report</h2>
                        <p className="text-gray-400 mt-2 max-w-3xl">
                           Analysis of: <span className="font-semibold text-gray-200">{datasetDescription}</span> for attributes: <span className="font-semibold text-gray-200">{attributes.join(', ')}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={onReset}
                        className="bg-gray-700 text-gray-300 font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Start New Analysis
                    </button>
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
                        <CardTitle icon={<MetricsIcon />}>Quantitative Fairness Metrics</CardTitle>
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
                        <CardTitle icon={<MitigationIcon />}>Bias Mitigation Strategies</CardTitle>
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
    );
};

export default Dashboard;