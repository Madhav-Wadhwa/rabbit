import { GoogleGenAI } from "@google/genai";

/**
 * Generates a basic statistical summary from the raw JSON data string.
 * Used as a fallback when the AI API is unavailable.
 */
function generateBasicStats(dataString: string): string {
  try {
    const data = JSON.parse(dataString);
    if (!Array.isArray(data) || data.length === 0) return "No valid sales records found to analyze.";

    let totalRevenue = 0;
    let orderCount = data.length;
    const categories: Record<string, number> = {};

    data.forEach((row: any) => {
      // Try to find common sales column names
      const price = parseFloat(row.Price || row.Amount || row.Total || row.price || row.amount || 0);
      const qty = parseInt(row.Quantity || row.Qty || row.quantity || row.qty || 1);
      const category = row.Category || row.Product || row.category || "General";

      totalRevenue += (price * qty);
      categories[category] = (categories[category] || 0) + (price * qty);
    });

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

    return `[STATISTICAL SUMMARY - AI OFFLINE]
Total Revenue: $${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Total Orders: ${orderCount}
Average Order Value: $${(totalRevenue / orderCount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
Top Performing Category: ${topCategory ? topCategory[0] : 'N/A'} ($${topCategory ? topCategory[1].toLocaleString() : 0})`;
  } catch (e) {
    return "Unable to parse data for summary. Please ensure your file has valid headers like 'Price' and 'Quantity'.";
  }
}

export async function generateSalesSummary(data: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // If no API key, use statistical fallback immediately
  if (!apiKey || apiKey === "your_gemini_api_key") {
    console.warn("GEMINI_API_KEY missing or placeholder. Using statistical fallback.");
    return generateBasicStats(data);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are a Senior Sales Analyst at Rabbitt AI. 
      Analyze the following sales data and provide a professional, executive-ready narrative summary.
      Highlight key trends, top-performing regions/categories, and any areas of concern (like cancellations).
      The summary should be concise, data-driven, and actionable.
      
      Data:
      ${data}
      
      Format the response as a professional email body.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Failed to generate summary.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // If API fails (invalid key, quota, etc), use statistical fallback
    return generateBasicStats(data);
  }
}
