
import React, { useState, useCallback } from 'react';
import type { AnalysisResult, ProtectedAttribute } from './types';
import { DEFAULT_DATASETS, PROTECTED_ATTRIBUTES } from './constants';
import { generateBiasAudit } from './services/geminiService';
import Header from './components/Header';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [selectedDataset, setSelectedDataset] = useState<string>(DEFAULT_DATASETS[0].description);
    const [customDataset, setCustomDataset] = useState<string>('');
    const [selectedAttributes, setSelectedAttributes] = useState<Set<ProtectedAttribute>>(new Set(['Gender', 'Race']));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [apiKey, setApiKey] = useState<string>('');

    const hasEnvKey = !!process.env.API_KEY;

    const handleAttributeToggle = (attribute: ProtectedAttribute) => {
        setSelectedAttributes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(attribute)) {
                newSet.delete(attribute);
            } else {
                newSet.add(attribute);
            }
            return newSet;
        });
    };

    const handleRunAnalysis = useCallback(async () => {
        const keyToUse = hasEnvKey ? process.env.API_KEY! : apiKey;
        
        if (!keyToUse) {
            setError('Please provide a Gemini API key to run the analysis.');
            return;
        }

        if (selectedAttributes.size === 0) {
            setError('Please select at least one protected attribute to analyze.');
            return;
        }
        
        const datasetDescription = selectedDataset === 'custom' ? customDataset : selectedDataset;
        if (!datasetDescription) {
            setError('Please describe your custom dataset or model.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await generateBiasAudit(datasetDescription, Array.from(selectedAttributes), keyToUse);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please check the console for details.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDataset, customDataset, selectedAttributes, apiKey, hasEnvKey]);
    
    const resetAnalysis = () => {
      setAnalysisResult(null);
      setError(null);
      setSelectedDataset(DEFAULT_DATASETS[0].description);
      setCustomDataset('');
      setSelectedAttributes(new Set(['Gender', 'Race']));
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-300">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {!analysisResult && !isLoading && (
                    <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl shadow-red-900/20 border border-gray-700">
                        <h2 className="text-3xl font-bold text-red-500 mb-2">AI Bias Audit Configuration</h2>
                        <p className="text-gray-400 mb-8">Configure your bias analysis by selecting a dataset and the protected attributes you want to examine.</p>
                        
                        {!hasEnvKey && (
                            <div className="mb-8">
                                <label htmlFor="apiKey" className="block text-xl font-semibold text-gray-100 mb-3">0. Your Gemini API Key</label>
                                <input
                                    id="apiKey"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="Enter your Gemini API key"
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    aria-required="true"
                                    aria-label="Gemini API Key"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Your API key is used only for this session and not stored. Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300">Google AI Studio</a>.
                                </p>
                            </div>
                        )}

                        {/* Step 1: Dataset Selection */}
                        <div className="mb-8">
                            <label htmlFor="dataset" className="block text-xl font-semibold text-gray-100 mb-3">1. Select or Describe Your Dataset/Model</label>
                            <select
                                id="dataset"
                                value={selectedDataset}
                                onChange={(e) => setSelectedDataset(e.target.value)}
                                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            >
                                {DEFAULT_DATASETS.map(ds => (
                                    <option key={ds.name} value={ds.description}>{ds.name}</option>
                                ))}
                                <option value="custom">Custom Dataset/Model</option>
                            </select>
                            {selectedDataset === 'custom' && (
                                <textarea
                                    value={customDataset}
                                    onChange={(e) => setCustomDataset(e.target.value)}
                                    placeholder="e.g., A predictive model for loan approvals using applicant's income, credit score, age, and employment history."
                                    className="w-full mt-3 p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                                    rows={3}
                                />
                            )}
                        </div>

                        {/* Step 2: Protected Attributes */}
                        <div className="mb-8">
                             <h3 className="text-xl font-semibold text-gray-100 mb-3">2. Choose Protected Attributes for Analysis</h3>
                            <div className="flex flex-wrap gap-3">
                                {PROTECTED_ATTRIBUTES.map(attr => (
                                    <button
                                        key={attr}
                                        onClick={() => handleAttributeToggle(attr)}
                                        className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out border-2 ${
                                            selectedAttributes.has(attr)
                                                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/30'
                                                : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600 hover:border-red-500'
                                        }`}
                                    >
                                        {attr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="text-red-400 bg-red-900/50 border border-red-500/50 p-3 rounded-lg mb-6">{error}</div>}

                        {/* Step 3: Run Analysis */}
                        <div className="text-center mt-8">
                            <button
                                onClick={handleRunAnalysis}
                                disabled={isLoading || selectedAttributes.size === 0 || (!hasEnvKey && !apiKey)}
                                className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-red-500/40"
                            >
                                Run Bias Analysis
                            </button>
                        </div>
                    </div>
                )}
                
                {isLoading && <Loader />}

                {analysisResult && (
                    <Dashboard 
                      result={analysisResult} 
                      onReset={resetAnalysis} 
                      datasetDescription={selectedDataset === 'custom' ? customDataset : selectedDataset}
                      attributes={Array.from(selectedAttributes)}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
