const JOB_API_BASE_URL = process.env.JOB_API_URL || "http://127.0.0.1:5003";

export interface JobInfo {
  JobTitle: string;
  Location: string;
  Organization: string;
  SalaryRange: string;
  SkillRequired: string;
}

export interface JobApiResponse {
  url: string;
  jobs: JobInfo[];
}

export async function fetchJobs(location: string, experience: string): Promise<JobApiResponse> {
  try {
    const params = new URLSearchParams({
      location,
      experience,
    });

    const url = `${JOB_API_BASE_URL}/request?${params.toString()}`;
    console.log("Fetching jobs from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Job API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      throw new Error("Invalid response format from job API");
    }

    return {
      url: data[0],
      jobs: data[1],
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw new Error("Failed to fetch jobs");
  }
}