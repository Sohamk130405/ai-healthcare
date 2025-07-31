import { NextResponse } from "next/server";

interface Insight {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  source: string;
  url: string;
  type: "news" | "article" | "blog" | "video";
  publishedAt: string;
}

export async function POST(req: Request) {
  const { query, type, page = 1, pageSize = 12 } = await req.json(); // Default page and pageSize

  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!NEWS_API_KEY && (type === "news" || type === "all")) {
    console.warn("NEWS_API_KEY is not set. News insights will not be fetched.");
  }
  if (!YOUTUBE_API_KEY && (type === "video" || type === "all")) {
    console.warn(
      "YOUTUBE_API_KEY is not set. YouTube video insights will not be fetched."
    );
  }

  let allInsights: Insight[] = [];
  const defaultQuery = query || "medical-insight"; // Use "health" as a default query if none is provided

  // Fetch a larger batch from external APIs to allow server-side pagination over a combined set
  const externalApiFetchLimit = 30; // Max results to fetch from each external API per request

  try {
    // Fetch News
    if ((type === "news" || type === "all") && NEWS_API_KEY) {
      try {
        // NewsAPI supports page and pageSize directly
        const newsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(
            defaultQuery
          )}&language=en&sortBy=publishedAt&pageSize=${externalApiFetchLimit}&page=${page}&apiKey=${NEWS_API_KEY}`,
          { next: { revalidate: 3600 } } // Revalidate every hour
        );
        if (!newsResponse.ok) {
          console.error(
            `NewsAPI error: ${newsResponse.status} ${newsResponse.statusText}`
          );
          throw new Error("Failed to fetch news from NewsAPI");
        }
        const newsData = await newsResponse.json();
        const newsArticles: Insight[] = newsData.articles
          .filter(
            (article: any) => article.title && article.url && article.urlToImage
          ) // Filter out incomplete articles
          .map((article: any) => ({
            id: article.url, // Using URL as ID for uniqueness
            title: article.title,
            description: article.description || "No description available.",
            thumbnailUrl: article.urlToImage,
            source: article.source.name,
            url: article.url,
            type: "news",
            publishedAt: article.publishedAt,
          }));
        allInsights = allInsights.concat(newsArticles);
      } catch (newsError) {
        console.error("Error fetching news:", newsError);
      }
    }

    // Fetch YouTube Videos
    if ((type === "video" || type === "all") && YOUTUBE_API_KEY) {
      try {
        // YouTube API uses maxResults and pageToken. For simplicity, we fetch maxResults
        // and rely on client-side pagination over the combined set.
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            defaultQuery + " health"
          )}&type=video&key=${YOUTUBE_API_KEY}&maxResults=${externalApiFetchLimit}`, // Add "health" to query for relevance
          { next: { revalidate: 3600 } } // Revalidate every hour
        );
        if (!youtubeResponse.ok) {
          console.error(
            `YouTube API error: ${youtubeResponse.status} ${youtubeResponse.statusText}`
          );
          throw new Error("Failed to fetch videos from YouTube API");
        }
        const youtubeData = await youtubeResponse.json();
        const youtubeVideos: Insight[] = youtubeData.items
          .filter(
            (item: any) => item.id.videoId && item.snippet.thumbnails?.high?.url
          ) // Filter out incomplete videos
          .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description:
              item.snippet.description || "No description available.",
            thumbnailUrl: item.snippet.thumbnails.high.url,
            source: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            type: "video",
            publishedAt: item.snippet.publishedAt,
          }));
        allInsights = allInsights.concat(youtubeVideos);
      } catch (youtubeError) {
        console.error("Error fetching YouTube videos:", youtubeError);
      }
    }

    // For 'article' and 'blog' types, you would integrate with other APIs here.
    // For now, we'll just include some generic articles/blogs if 'all' is selected
    // or if 'article'/'blog' is specifically requested and no other API is integrated.
    if (type === "all" || type === "article" || type === "blog") {
      const genericContent: Insight[] = [
        {
          id: "article-1",
          title: "The Role of Gut Microbiome in Mental Health",
          description:
            "A deep dive into the latest research connecting gut health with neurological and psychological well-being.",
          thumbnailUrl: "/placeholder.svg?height=192&width=384",
          source: "Scientific American",
          url: "https://example.com/article/gut-mental-health",
          type: "article",
          publishedAt: "2024-07-25T07:00:00Z",
        },
        {
          id: "blog-1",
          title: "5 Healthy Habits to Boost Your Immune System This Winter",
          description:
            "Simple, actionable tips from a nutritionist to keep your immune system strong during colder months.",
          thumbnailUrl: "/placeholder.svg?height=192&width=384",
          source: "Wellness Daily Blog",
          url: "https://example.com/blog/immune-boost",
          type: "blog",
          publishedAt: "2024-07-22T09:00:00Z",
        },
        {
          id: "article-2",
          title:
            "Understanding the Link Between Sleep Deprivation and Chronic Disease",
          description:
            "Explore how insufficient sleep can contribute to a range of chronic health issues, from heart disease to obesity.",
          thumbnailUrl: "/placeholder.svg?height=192&width=384",
          source: "Healthline",
          url: "https://example.com/article/sleep-deprivation",
          type: "article",
          publishedAt: "2024-07-18T16:00:00Z",
        },
        {
          id: "blog-2",
          title: "Plant-Based Diet: A Beginner's Guide to Transitioning",
          description:
            "Tips and recipes for those looking to adopt a more plant-focused eating style for better health.",
          thumbnailUrl: "/placeholder.svg?height=192&width=384",
          source: "Green Living Blog",
          url: "https://example.com/blog/plant-based-guide",
          type: "blog",
          publishedAt: "2024-07-15T11:30:00Z",
        },
      ];
      const filteredGeneric = genericContent.filter(
        (content) =>
          content.title.toLowerCase().includes(defaultQuery.toLowerCase()) ||
          content.description.toLowerCase().includes(defaultQuery.toLowerCase())
      );
      allInsights = allInsights.concat(filteredGeneric);
    }

    // Sort all insights by published date, newest first
    allInsights.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Apply server-side pagination to the combined results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedInsights = allInsights.slice(startIndex, endIndex);

    return NextResponse.json({
      insights: paginatedInsights,
      totalResults: allInsights.length,
    });
  } catch (error) {
    console.error("Unhandled error in external insights API:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights", insights: [], totalResults: 0 },
      { status: 500 }
    );
  }
}
