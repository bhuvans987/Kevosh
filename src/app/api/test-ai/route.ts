import { NextResponse } from "next/server";
import { generateAISummary, generateAttributionSummary, SourceStat } from "@/lib/ai-summary";

export async function GET() {
  const sampleDashboardData: SourceStat[] = [
    { source_label: "Product Hunt", signups: 40, converted: 2, conversion_rate: 0.05 },
    { source_label: "X Thread", signups: 8, converted: 3, conversion_rate: 0.375 },
    { source_label: "LinkedIn Ads", signups: 25, converted: 1, conversion_rate: 0.04 },
    { source_label: "Direct / Organic", signups: 15, converted: 4, conversion_rate: 0.267 },
  ];

  const result = await generateAttributionSummary(sampleDashboardData);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "error",
        error: result.error,
        instruction: "Please ensure GROQ_API_KEY is defined in your environment (.env.local).",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    status: "success",
    inputData: sampleDashboardData,
    modelUsed: result.modelUsed,
    summary: result.summary,
  });
}

