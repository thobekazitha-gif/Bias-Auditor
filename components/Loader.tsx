import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Initializing bias audit...",
  "Implementing quantitative fairness metrics...",
  "Identifying affected demographic groups...",
  "Analyzing statistical representation of bias patterns...",
  "Applying bias mitigation techniques for comparison...",
  "Connecting findings to real-world implications...",
  "Generating ethics framework and recommendations...",
  "Finalizing your comprehensive report...",
];

const Loader: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh]">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-100 mb-2">Analyzing...</h2>
            <p className="text-gray-400 max-w-md transition-opacity duration-500 ease-in-out">{loadingMessages[messageIndex]}</p>
        </div>
    );
};

export default Loader;