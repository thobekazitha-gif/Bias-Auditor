import React, { useState, useCallback } from 'react';
import type { AnalysisResult, ProtectedAttribute } from './types';
import { DEFAULT_DATASETS, PROTECTED_ATTRIBUTES } from './constants';
import { generateBiasAudit } from './services/geminiService';
import Header from './components/Header';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [isSampleKeyVisible, setIsSampleKeyVisible] = useState<boolean>(false);
    const [selectedDataset, setSelectedDataset] = useState<string>(DEFAULT_DATASETS[0].description);
    const [customDataset, setCustomDataset] = useState<string>('');
    const [selectedAttributes, setSelectedAttributes] = useState<Set<ProtectedAttribute>>(new Set(['Gender', 'Race']));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    
    const SAMPLE_API_KEY = 'YOUR_API-KEY';

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
        if (!apiKey) {
            setError('Please provide your Gemini API key.');
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
            const result = await generateBiasAudit(datasetDescription, Array.from(selectedAttributes), apiKey);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please check the console for details.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDataset, customDataset, selectedAttributes, apiKey]);
    
    const resetAnalysis = () => {
      setAnalysisResult(null);
      setError(null);
      setApiKey('');
      setIsSampleKeyVisible(false);
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

                        {/* Step 3: API Key */}
                        <div className="mb-8">
                            <label htmlFor="apiKey" className="block text-xl font-semibold text-gray-100 mb-3">3. Provide Your Gemini API Key</label>
                            
                            <div className="flex items-center gap-2 p-2 bg-gray-900 border border-gray-600 rounded-lg mb-3">
                                <span className="text-sm font-medium text-gray-400 flex-shrink-0 px-2">Sample Key:</span>
                                <code className="flex-grow text-gray-300 bg-gray-700 px-2 py-1 rounded text-xs tracking-wider overflow-x-auto whitespace-nowrap">
                                    {isSampleKeyVisible ? SAMPLE_API_KEY : '●'.repeat(SAMPLE_API_KEY.length)}
                                </code>
                                <button
                                    onClick={() => setIsSampleKeyVisible(prev => !prev)}
                                    className="px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                                    title={isSampleKeyVisible ? "Hide key" : "View key"}
                                >
                                    {isSampleKeyVisible ? 'Hide' : 'View'}
                                </button>
                                <button
                                    onClick={() => setApiKey(SAMPLE_API_KEY)}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                                >
                                    Use Key
                                </button>
                            </div>

                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key or use the sample key above"
                                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                            />
                            <p className="text-xs text-gray-500 mt-2">Your key is used only for this session and is not stored. Using environment variables is recommended for production.</p>
                        </div>


                        {error && <div className="text-red-400 bg-red-900/50 border border-red-500/50 p-3 rounded-lg mb-6">{error}</div>}

                        {/* Step 4: Run Analysis */}
                        <div className="text-center mt-8">
                            <button
                                onClick={handleRunAnalysis}
                                disabled={isLoading || selectedAttributes.size === 0 || !apiKey}
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
