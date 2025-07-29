import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Calendar,
  Stethoscope,
  TrendingUp,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Condition {
  id: string;
  name: string;
  common_name: string;
  probability: number;
}

interface ResultsSectionProps {
  results: {
    conditions: Condition[];
  };
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const getSeverityColor = (probability: number) => {
    if (probability > 0.7) return "bg-red-100 text-red-800 border-red-200";
    if (probability > 0.4)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getSeverityLabel = (probability: number) => {
    if (probability > 0.7) return "High Risk";
    if (probability > 0.4) return "Medium Risk";
    return "Low Risk";
  };

  const getSeverityIcon = (probability: number) => {
    if (probability > 0.7) return <AlertCircle className="h-4 w-4" />;
    if (probability > 0.4) return <TrendingUp className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const getRecommendedAction = (probability: number) => {
    if (probability > 0.7) {
      return {
        text: "Seek immediate medical attention",
        urgency: "high",
        color: "bg-red-50 border-red-200 text-red-800",
      };
    } else if (probability > 0.4) {
      return {
        text: "Consider consulting a healthcare provider",
        urgency: "medium",
        color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      };
    } else {
      return {
        text: "Monitor symptoms and consult if they worsen",
        urgency: "low",
        color: "bg-blue-50 border-blue-200 text-blue-800",
      };
    }
  };

  if (!results.conditions || results.conditions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Specific Conditions Identified
          </h3>
          <p className="text-muted-foreground mb-4">
            Based on your symptoms, we couldn't identify specific conditions.
            This doesn't mean nothing is wrong.
          </p>
          <Button asChild>
            <Link href="/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Consult a Doctor
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const topCondition = results.conditions[0];
  const recommendation = getRecommendedAction(topCondition.probability);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Stethoscope className="h-6 w-6" />
          Diagnosis Results
        </h2>
        <p className="text-muted-foreground">
          Based on your symptoms, here are the most likely conditions
        </p>
      </div>

      {/* Top Recommendation */}
      <Card className={`border-2 ${recommendation.color}`}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Recommended Action</p>
              <p className="text-sm">{recommendation.text}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions List */}
      <div className="space-y-4">
        {results.conditions.map((condition, index) => (
          <Card
            key={condition.id || index}
            className={`hover:shadow-md transition-shadow ${
              index === 0 ? "ring-2 ring-primary/20" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        Most Likely
                      </Badge>
                    )}
                    <Badge
                      className={`${getSeverityColor(
                        condition.probability
                      )} flex items-center gap-1`}
                    >
                      {getSeverityIcon(condition.probability)}
                      {getSeverityLabel(condition.probability)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {condition.common_name || condition.name}
                  </CardTitle>
                  {condition.common_name &&
                    condition.common_name !== condition.name && (
                      <CardDescription className="text-sm">
                        Medical name: {condition.name}
                      </CardDescription>
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Probability */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Match Probability</span>
                  <span className="font-semibold">
                    {Math.round(condition.probability * 100)}%
                  </span>
                </div>
                <Progress value={condition.probability * 100} className="h-2" />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/appointments">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/chat">Ask AI Doctor</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link
                    href={`https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(
                      condition.common_name || condition.name
                    )}`}
                    target="_blank"
                  >
                    Learn More
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Advice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">
                Important Notes
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>
                  • This analysis is based on the symptoms you provided and
                  should not replace professional medical advice
                </li>
                <li>
                  • If symptoms worsen or you're concerned, please consult a
                  healthcare provider immediately
                </li>
                <li>
                  • Consider keeping a symptom diary to track changes over time
                </li>
                <li>
                  • Emergency symptoms require immediate medical attention
                  regardless of this analysis
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
