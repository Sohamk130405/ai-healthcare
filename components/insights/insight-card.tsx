import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const formattedDate = new Date(insight.publishedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const getBadgeVariant = (type: Insight["type"]) => {
    switch (type) {
      case "news":
        return "default";
      case "article":
        return "secondary";
      case "blog":
        return "outline";
      case "video":
        return "destructive"; // Using destructive for video to make it stand out
      default:
        return "default";
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={
            insight.thumbnailUrl ||
            "/placeholder.svg?height=192&width=384&text=No+Image"
          }
          alt={insight.title}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
          onError={(e) => {
            e.currentTarget.src =
              "/placeholder.svg?height=192&width=384&text=No+Image";
          }}
        />
        <Badge
          variant={getBadgeVariant(insight.type)}
          className="absolute top-3 left-3 capitalize px-3 py-1 text-xs font-medium"
        >
          {insight.type}
        </Badge>
      </div>
      <CardHeader className="p-4 pb-2 flex-shrink-0">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          <Link
            href={insight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {insight.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-3">
          {insight.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 mt-auto flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Source: {insight.source}</span>
          <span>{formattedDate}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          href={insight.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Badge
            variant="outline"
            className="w-full text-center py-2 hover:bg-gray-50"
          >
            Read More
          </Badge>
        </Link>
      </CardFooter>
    </Card>
  );
}
