
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief, 1-2 paragraph overview of the key bias findings." },
        fairness_metrics: {
            type: Type.ARRAY,
            description: "An array of exactly 3 quantitative fairness metrics.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the fairness metric (e.g., 'Statistical Parity')." },
                    description: { type: Type.STRING, description: "A brief explanation of the metric." },
                    scores: {
                        type: Type.ARRAY,
                        description: "Scores for different demographic groups. Score should be a value between 0 and 1.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                group: { type: Type.STRING, description: "Name of the demographic group." },
                                score: { type: Type.NUMBER, description: "The fairness score for this group." }
                            },
                            required: ["group", "score"]
                        }
                    }
                },
                required: ["name", "description", "scores"]
            }
        },
        mitigation_strategies: {
            type: Type.ARRAY,
            description: "An array of exactly 2 bias mitigation techniques.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the mitigation technique (e.g., 'Reweighing')." },
                    description: { type: Type.STRING, description: "How this technique works." },
                    metric_name: { type: Type.STRING, description: "The primary fairness metric this strategy is targeting." },
                    before_after_metrics: {
                        type: Type.OBJECT,
                        description: "Comparison of a key metric before and after mitigation.",
                        properties: {
                            before: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { group: { type: Type.STRING }, score: { type: Type.NUMBER } },
                                    required: ["group", "score"]
                                }
                            },
                            after: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { group: { type: Type.STRING }, score: { type: Type.NUMBER } },
                                    required: ["group", "score"]
                                }
                            }
                        },
                        required: ["before", "after"]
                    }
                },
                required: ["name", "description", "metric_name", "before_after_metrics"]
            }
        },
        dataset_recommendations: {
            type: Type.ARRAY,
            description: "A list of actionable recommendations for improving the dataset.",
            items: { type: Type.STRING }
        },
        real_world_implications: {
            type: Type.STRING,
            description: "A paragraph connecting findings to potential real-world harms."
        },
        ethics_framework: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A title for the ethics framework, specific to the use case." },
                principles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Name of an ethical principle." },
                            description: { type: Type.STRING, description: "Description of the principle." }
                        },
                        required: ["name", "description"]
                    }
                }
            },
            required: ["title", "principles"]
        },
        ethics_statement: {
            type: Type.STRING,
            description: "A 400-500 word ethics statement connecting findings to broader AI ethics principles."
        },
        references: {
            type: Type.ARRAY,
            description: "A list of relevant fairness research papers and frameworks.",
            items: { type: Type.STRING }
        }
    },
    required: ["summary", "fairness_metrics", "mitigation_strategies", "dataset_recommendations", "real_world_implications", "ethics_framework", "ethics_statement", "references"]
};


export const generateBiasAudit = async (datasetDescription: string, protectedAttributes: string[]): Promise<AnalysisResult> => {
    const prompt = `
        You are an expert AI Ethicist and Data Scientist specializing in fairness audits.
        Your task is to conduct a thorough bias audit for the following scenario and provide the results in a single, valid JSON object.
        Do not include any text, markdown formatting, or code fences before or after the JSON object.

        Scenario Details:
        - Dataset/Model Description: "${datasetDescription}"
        - Protected Attributes to Analyze: ${protectedAttributes.join(', ')}

        Please generate a detailed analysis. For fairness scores, simulate realistic but illustrative values that clearly demonstrate potential biases. Ensure the 'after' scores for mitigation strategies show a clear improvement in fairness (i.e., scores for different groups are closer together). The ethics statement must be between 400 and 500 words.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Basic validation
        if (!result.summary || !result.fairness_metrics || result.fairness_metrics.length === 0) {
            throw new Error("Invalid JSON structure received from API.");
        }

        return result as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate bias audit from the AI model.");
    }
};
