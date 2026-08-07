/**
 * Account-Agnostic AI Client Wrapper
 *
 * Uses Groq's high-speed LPU inference engine with open-source models like Llama 3.3 70B
 * or Llama 3.1 8B. This wrapper is account-agnostic and designed to accept arbitrary
 * prompt data and system instructions for generation without hardcoded tenant context.
 */

export interface AISummaryOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AISummaryResponse {
  success: boolean;
  summary?: string;
  modelUsed?: string;
  error?: string;
}

/**
 * Generate an AI summary or insights using Groq API.
 *
 * @param userPrompt - The data or query string to process.
 * @param options - Configurable generation options (model, temperature, maxTokens, systemPrompt).
 */
export async function generateAISummary(
  userPrompt: string,
  options: AISummaryOptions = {}
): Promise<AISummaryResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "GROQ_API_KEY environment variable is missing. Please set GROQ_API_KEY in your .env.local file.",
    };
  }

  const model = options.model || "llama-3.3-70b-versatile";
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 1000;
  const systemPrompt =
    options.systemPrompt ||
    "You are an expert marketing analytics AI assistant. Provide concise, clear, and actionable insights based on attribution and revenue data.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || `Groq API returned HTTP status ${response.status}`;
      return {
        success: false,
        error: `Groq API Error: ${errorMessage}`,
      };
    }

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return {
        success: false,
        error: "Empty or missing response content from Groq API.",
      };
    }

    return {
      success: true,
      summary,
      modelUsed: data?.model || model,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "An unexpected network or system error occurred while invoking Groq API.",
    };
  }
}

export interface SourceStat {
  source_label: string;
  signups: number;
  converted: number;
  conversion_rate: number;
}

/**
 * Generates a 3-5 sentence plain-English summary from aggregated attribution source data
 * (source_label, signups, converted, conversion_rate).
 *
 * Prompts the model to be concise, specific with numbers, and highlight the biggest gap
 * between signup volume and conversion rate as the core insight.
 *
 * @param sources - Aggregated source data array from the Day 3 dashboard query.
 * @param options - Optional AISummaryOptions (model, temperature, etc.)
 */
export async function generateAttributionSummary(
  sources: SourceStat[],
  options: AISummaryOptions = {}
): Promise<AISummaryResponse> {
  if (!sources || sources.length === 0) {
    return {
      success: true,
      summary:
        "No attribution source data is currently available. Once signups and conversions are recorded across your channels, performance summaries will appear here.",
    };
  }

  const formattedSources = sources
    .map((s) => {
      const ratePct =
        s.conversion_rate <= 1 && s.conversion_rate > 0
          ? s.conversion_rate * 100
          : s.conversion_rate;
      const formattedRate = Number.isInteger(ratePct)
        ? `${ratePct}%`
        : `${ratePct.toFixed(1)}%`;
      return `- Source: "${s.source_label}" | Signups: ${s.signups} | Converted: ${s.converted} | Conversion Rate: ${formattedRate}`;
    })
    .join("\n");

  const systemPrompt =
    options.systemPrompt ||
    "You are an expert marketing analytics AI assistant. Summarize attribution and conversion performance concisely in plain English for executive founders.";

  const userPrompt = `Below is aggregated attribution source data from the marketing dashboard (source_label, signups, converted, conversion_rate):

${formattedSources}

Write a plain-English summary of this attribution data adhering to the following rules:

1. Style & Tone: Write in a concise, direct plain-English style similar to:
   "Your Product Hunt launch drove 40 signups but only 2 conversions (5%). Your X thread drove 8 signups but 3 conversions (37%)."
2. Sentence Count: Keep the entire response strictly between 3 and 5 sentences.
3. Numerical Precision: Be specific with exact numbers — include signups, conversions, and conversion rate percentages for key channels.
4. Core Insight: Explicitly highlight the biggest gap between signup volume and conversion rate (for example, identifying channels with high signup volume but poor conversion efficiency versus lower volume channels with high conversion efficiency).`;

  return generateAISummary(userPrompt, {
    systemPrompt,
    temperature: options.temperature ?? 0.5,
    maxTokens: options.maxTokens ?? 350,
    model: options.model,
  });
}

// Alias for flexibility
export const generateSourceDataSummary = generateAttributionSummary;

