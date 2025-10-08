import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

export const generateBiasAudit = async (datasetDescription: string, protectedAttributes: string[]): Promise<AnalysisResult> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("The Gemini API key is missing. Please ensure the API_KEY environment variable is set.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Define the strict JSON schema for the expected response from the Gemini API.
    // This ensures the data structure is consistent and matches our `AnalysisResult` type.
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A high-level executive summary of the bias audit findings." },
        fairness_metrics: {
          type: Type.ARRAY,
          description: "An array of quantitative fairness metrics.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the fairness metric (e.g., 'Equal Opportunity Difference')." },
              description: { type: Type.STRING, description: "A brief explanation of what the metric measures." },
              scores: {
                type: Type.ARRAY,
                description: "Scores for different demographic groups.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    group: { type: Type.STRING, description: "The demographic group (e.g., 'Male', 'Female')." },
                    score: { type: Type.NUMBER, description: "The metric score for this group (between 0 and 1)." },
                  },
                  required: ['group', 'score'],
                },
              },
            },
            required: ['name', 'description', 'scores'],
          },
        },
        mitigation_strategies: {
          type: Type.ARRAY,
          description: "Proposed strategies to mitigate the identified biases.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the mitigation strategy." },
              description: { type: Type.STRING, description: "Detailed description of how to implement the strategy." },
              metric_name: { type: Type.STRING, description: "The primary metric this strategy aims to improve."},
              before_after_metrics: {
                type: Type.OBJECT,
                description: "Simulated metric scores before and after applying the strategy.",
                properties: {
                  before: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        group: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                      },
                      required: ['group', 'score'],
                    },
                  },
                  after: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        group: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                      },
                      required: ['group', 'score'],
                    },
                  },
                },
                required: ['before', 'after'],
              },
            },
            required: ['name', 'description', 'metric_name', 'before_after_metrics'],
          },
        },
        dataset_recommendations: {
          type: Type.ARRAY,
          description: "Specific, actionable recommendations for improving the dataset to reduce bias.",
          items: { type: Type.STRING },
        },
        real_world_implications: {
          type: Type.STRING,
          description: "A narrative on the potential real-world impact and ethical consequences of the identified biases."
        },
        ethics_framework: {
            type: Type.OBJECT,
            description: "An ethical framework to guide the responsible use of the model.",
            properties: {
                title: { type: Type.STRING, description: "The title of the ethical framework."},
                principles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "Name of the ethical principle."},
                            description: { type: Type.STRING, description: "Description of the principle."},
                        },
                        required: ['name', 'description'],
                    }
                }
            },
            required: ['title', 'principles'],
        },
        ethics_statement: {
            type: Type.STRING,
            description: "A formal ethics statement regarding the model's development and deployment."
        },
        references: {
          type: Type.ARRAY,
          description: "A list of academic papers or resources relevant to the analysis.",
          items: { type: Type.STRING },
        },
      },
      required: [
        'summary',
        'fairness_metrics',
        'mitigation_strategies',
        'dataset_recommendations',
        'real_world_implications',
        'ethics_framework',
        'ethics_statement',
        'references'
      ],
    };

    // Construct the detailed prompt for the AI model.
    const prompt = `
      You are an expert AI Ethicist and Data Scientist specializing in fairness, accountability, and transparency in machine learning.
      Your task is to conduct a comprehensive bias audit.

      **Dataset/Model Description:**
      ${datasetDescription}

      **Protected Attributes to Analyze:**
      ${protectedAttributes.join(', ')}

      **Instructions:**
      1.  **Analyze Potential Biases:** Based on the provided description and protected attributes, identify potential sources and types of bias (e.g., selection bias, representation bias, historical bias).
      2.  **Quantitative Fairness Metrics:** Generate realistic, hypothetical scores for at least three relevant quantitative fairness metrics (e.g., Demographic Parity, Equal Opportunity, Predictive Equality). For each metric, provide scores for different subgroups within the protected attributes. Ensure the scores clearly illustrate potential disparities. The scores should be between 0.0 and 1.0.
      3.  **Bias Mitigation Strategies:** Propose two concrete mitigation strategies (e.g., re-sampling, re-weighing, adversarial de-biasing, post-processing adjustments). For each strategy, describe it and provide a hypothetical "before" and "after" comparison of a relevant fairness metric to show its potential impact.
      4.  **Dataset Recommendations:** Provide a list of actionable recommendations for improving the dataset itself to reduce bias.
      5.  **Real-World Implications:** Write a paragraph on the potential real-world, negative consequences if the identified biases are not addressed.
      6.  **Ethics Framework:** Propose a relevant ethics framework (e.g., based on principles like Fairness, Transparency, Accountability) with a title and a few key principles and their descriptions.
      7.  **Ethics Statement:** Draft a formal ethics statement that could be used for this model.
      8.  **References:** List two fictional but plausible academic-style references related to AI bias or fairness in this domain.

      Provide your entire analysis in a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or explanations outside of the JSON object itself.
    `;

    try {
      // Call the Gemini API with the prompt and schema configuration.
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      // Parse the JSON response text and cast it to our AnalysisResult type.
      const resultText = response.text.trim();
      const result = JSON.parse(resultText);
      return result as AnalysisResult;

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      let errorMessage = "An error occurred while generating the bias audit.";
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "The Gemini API key is invalid or missing. Please check your environment configuration.";
        } else if (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('network')) {
            errorMessage = "A network error occurred while contacting the Gemini API. Please check your internet connection and ensure you can access Google services.";
        } else {
          errorMessage = `An unexpected error occurred with the Gemini API: ${error.message}`;
        }
      }
      throw new Error(errorMessage);
    }
};