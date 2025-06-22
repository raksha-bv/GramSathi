import { NextRequest, NextResponse } from "next/server";
import { fetchJobs } from "../../../lib/job-api";

export async function POST(request: NextRequest) {
  try {
    const { location, experience } = await request.json();

    if (!location || !experience) {
      return NextResponse.json(
        { error: "location and experience are required" },
        { status: 400 }
      );
    }

    const jobData = await fetchJobs(location, experience);

    return NextResponse.json({
      applyUrl: jobData.url,
      jobs: jobData.jobs,
    });
  } catch (error) {
    console.error("Job API Error:", error);
    return NextResponse.json(
      {
        error: "Sorry, unable to fetch jobs at the moment.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
