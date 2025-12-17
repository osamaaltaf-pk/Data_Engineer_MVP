import { GoogleGenAI } from "@google/genai";
import { DataRow, DataProfile, MergeStrategy } from "../types";

// @ts-ignore
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const cleanDataWithGemini = async (
  data: DataRow[],
  instruction: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<DataRow[]> => {
  try {
    const isSampled = data.length > 80; // Increased sample size slightly
    const dataToProcess = isSampled ? data.slice(0, 80) : data;

    const prompt = `
      You are an expert Data Engineer.
      User Instruction: "${instruction}"
      
      Input Data (JSON):
      ${JSON.stringify(dataToProcess)}
      
      Task: Apply the cleaning instruction to the data.
      
      Strict Output Rules:
      1. Return ONLY valid JSON array.
      2. No markdown code blocks.
      3. No conversational text.
      4. If the instruction requires removing rows, do so.
      5. If the instruction requires changing schema, do so.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    const rawText = response.text || "[]";
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    if (!Array.isArray(parsedData)) {
      throw new Error("Model returned invalid data format");
    }

    return parsedData;

  } catch (error) {
    console.error("Gemini Cleaning Error:", error);
    throw error;
  }
};

export const suggestCleaningRules = async (data: DataRow[]): Promise<string[]> => {
  try {
     const sample = data.slice(0, 10);
     const prompt = `
      Analyze this data sample and suggest 3 short, actionable data cleaning rules.
      Data: ${JSON.stringify(sample)}
      Return ONLY a JSON array of strings, e.g. ["Remove duplicates", "Standardize date format"].
     `;

     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.4 }
     });

     const text = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || "[]";
     return JSON.parse(text);
  } catch (e) {
    return ["Standardize formats", "Remove duplicates", "Fill missing values"];
  }
}

export const generateProfileSummary = async (profile: DataProfile): Promise<string> => {
    try {
        const prompt = `
          Data Profile:
          - Rows: ${profile.totalRows}
          - Columns: ${profile.columns.map(c => c.name).join(', ')}
          - Missing Values: ${profile.columns.reduce((acc, c) => acc + c.missingCount, 0)}
          - Completeness: ${profile.completenessScore}%
          
          Provide a 2-sentence summary of the data quality and what needs attention.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 100 }
        });

        return response.text || "Data analysis unavailable.";
    } catch (e) {
        return "Unable to generate AI summary at this time.";
    }
}

// --- Feature 11: Merge Strategy Suggester ---

export const suggestMergeStrategy = async (
  headers1: string[], 
  sample1: DataRow[], 
  headers2: string[], 
  sample2: DataRow[]
): Promise<MergeStrategy> => {
  try {
    const prompt = `
      I have two datasets I want to merge.
      
      Dataset 1 Headers: ${headers1.join(', ')}
      Dataset 1 Sample: ${JSON.stringify(sample1.slice(0, 3))}
      
      Dataset 2 Headers: ${headers2.join(', ')}
      Dataset 2 Sample: ${JSON.stringify(sample2.slice(0, 3))}
      
      Recommend the best merge strategy. 
      Identify the common column (ID, Email, etc.) to join on.
      Recommend "inner" if it seems like an intersection is needed, "left" if Dataset 1 is the main table, or "outer" if we want everything.
      
      Return JSON ONLY:
      {
        "joinType": "inner" | "left" | "outer",
        "primaryKey": "column_name_from_dataset_1",
        "secondaryKey": "column_name_from_dataset_2",
        "confidence": 0.95,
        "reasoning": "Reasoning string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);

  } catch (e) {
    console.error("Merge suggestion error", e);
    // Fallback default
    return {
      joinType: 'left',
      primaryKey: headers1[0],
      secondaryKey: headers2[0],
      confidence: 0,
      reasoning: "Automatic detection failed. Please select keys manually."
    };
  }
};