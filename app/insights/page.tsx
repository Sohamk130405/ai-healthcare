"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { InsightCard } from "@/components/insights/insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12); // Number of items per page
  const [totalResults, setTotalResults] = useState<number>(0);

  const totalPages = useMemo(
    () => Math.ceil(totalResults / itemsPerPage),
    [totalResults, itemsPerPage]
  );

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/external-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchTerm,
            type: activeTab,
            page: currentPage,
            pageSize: itemsPerPage,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { insights: fetchedInsights, totalResults: fetchedTotalResults } =
          await response.json();
        setInsights(fetchedInsights);
        setTotalResults(fetchedTotalResults);
      } catch (e: any) {
        setError(e.message || "Failed to load insights.");
        console.error("Error fetching insights:", e);
        setInsights([]); // Clear insights on error
        setTotalResults(0); // Reset total results on error
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchInsights();
    }, 500); // Debounce search input

    return () => clearTimeout(debounceFetch);
  }, [activeTab, searchTerm, currentPage, itemsPerPage]); // Re-fetch when page changes

  // Reset page to 1 when tab or search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Health Insights
            </h1>
            <p className="text-gray-600 mt-1">
              Stay informed with the latest in health and wellness.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-5 bg-gray-100/80 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="news"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                News
              </TabsTrigger>
              <TabsTrigger
                value="article"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                Articles
              </TabsTrigger>
              <TabsTrigger
                value="blog"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                Blogs
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
              >
                Videos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Insights Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <Card
                key={index}
                className="h-full flex flex-col overflow-hidden border-0 shadow-md"
              >
                <Skeleton className="w-full h-48 rounded-t-lg" />
                <CardHeader className="p-4 pb-2 flex-shrink-0">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto flex-shrink-0">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <h3 className="text-lg font-medium mb-2">Error loading insights</h3>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-2">
              Please ensure your `NEWS_API_KEY` and `YOUTUBE_API_KEY` are
              correctly set in your environment variables.
            </p>
          </div>
        ) : insights.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === currentPage}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No insights found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
