import { GoogleGenAI, Type } from "@google/genai";

export interface ProductComparison {
  platform: string;
  title: string;
  price: string;
  discount: string;
  rating: string;
  availability: string;
  link: string;
}

export interface ComparisonResult {
  productName: string;
  comparisons: ProductComparison[];
  lowestPrice: string;
  bestDeal: string;
}

const SYSTEM_INSTRUCTION = `You are a price comparison assistant for the Indian market.
Your task is to compare the price of a product across multiple e-commerce platforms such as Amazon.in, Flipkart, Croma, Reliance Digital, and other major online stores in India.

When given a product name:
1. Identify the exact product model.
2. Search for the product on multiple e-commerce platforms using Google Search.
3. Collect: Platform name, Product title, Current price (in INR), Discount (if available), Availability, Product rating, and Direct product link.
4. Return the data in a structured JSON format.

Rules:
- Only show reliable e-commerce stores.
- Prioritize the exact product model.
- Avoid duplicate listings.
- Ensure prices are current.
- If a platform doesn't have the product, skip it.`;

export async function comparePrices(query: string): Promise<ComparisonResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare prices for: ${query}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          comparisons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                title: { type: Type.STRING },
                price: { type: Type.STRING },
                discount: { type: Type.STRING },
                rating: { type: Type.STRING },
                availability: { type: Type.STRING },
                link: { type: Type.STRING },
              },
              required: ["platform", "title", "price", "link"],
            },
          },
          lowestPrice: { type: Type.STRING, description: "Summary of the lowest price found" },
          bestDeal: { type: Type.STRING, description: "Summary of the best deal based on price and rating" },
        },
        required: ["productName", "comparisons", "lowestPrice", "bestDeal"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as ComparisonResult;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to fetch comparison data. Please try again.");
  }
}
