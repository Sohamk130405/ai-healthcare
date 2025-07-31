import { type NextRequest, NextResponse } from "next/server";
import { TavilyClient } from "tavily";

export const runtime = "nodejs"; // Tavily client requires Node.js runtime

export async function POST(req: NextRequest) {
  const { query, type } = await req.json();

  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json(
      { error: "TAVILY_API_KEY is not set" },
      { status: 500 }
    );
  }

  const tavily = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY! });

  let searchQuery = query;
  if (type && type !== "all") {
    // Enhance query based on type for better results
    switch (type) {
      case "news":
        searchQuery = `${query} latest health news`;
        break;
      case "article":
        searchQuery = `${query} medical research article`;
        break;
      case "blog":
        searchQuery = `${query} health and wellness blog`;
        break;
      case "video":
        searchQuery = `${query} health related youtube video`;
        break;
      default:
        break;
    }
  } else if (!query) {
    // Default query if no search term and type is 'all'
    searchQuery = "latest health news and medical articles";
  }

  try {
    const response = await tavily.search({
      query: searchQuery,
      search_depth: "basic",
      include_images: true,
      include_answer: false,
      max_results: 20, // Fetch up to 20 results
    });

    const insights = response.results.map((result: any) => {
      // Determine type based on URL or a simple heuristic
      let contentType: "news" | "article" | "blog" | "video" = "article"; // Default to article
      if (
        result.url.includes("youtube.com") ||
        result.url.includes("youtu.be")
      ) {
        contentType = "video";
      } else if (
        result.url.includes("blog") ||
        result.url.includes("medium.com")
      ) {
        contentType = "blog";
      } else if (
        result.url.includes("news") ||
        result.url.includes("cnn.com") ||
        result.url.includes("bbc.com/news")
      ) {
        contentType = "news";
      }

      return {
        id: result.url, // Use URL as ID for uniqueness
        title: result.title,
        description: result.content || "No description available.",
        thumbnailUrl:
          result.thumbnail ||
          `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(
            result.title
          )}`,
        source: new URL(result.url).hostname.replace("www.", ""), // Extract hostname as source
        url: result.url,
        type: contentType,
        publishedAt: result.published_date || new Date().toISOString(), // Fallback to current date if not available
      };
    });

    // Filter by type on the server side if a specific type was requested
    const filteredInsights =
      type && type !== "all"
        ? insights.filter((insight: any) => insight.type === type)
        : insights;

    return NextResponse.json(filteredInsights);
  } catch (error) {
    console.error("Error fetching insights from Tavily:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}
