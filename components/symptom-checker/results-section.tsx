import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, User, Calendar } from "lucide-react"
import Link from "next/link"

interface Condition {
  name: string
  probability: number
  description: string
  severity: string
  specialists: string[]
}

interface ResultsSectionProps {
  results: {
    conditions: Condition[]
  }
}

export function ResultsSection({ results }: ResultsSectionProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-green-100 text-green-800"
      case "moderate":
        return "bg-yellow-100 text-yellow-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <p className="text-muted-foreground">Based on your symptoms, here are the most likely conditions</p>
      </div>

      <div className="grid gap-4">
        {results.conditions.map((condition, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{condition.name}</CardTitle>
                  <CardDescription>{condition.description}</CardDescription>
                </div>
                <Badge className={getSeverityColor(condition.severity)}>{condition.severity}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Probability Match</span>
                  <span className="font-medium">{condition.probability}%</span>
                </div>
                <Progress value={condition.probability} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Recommended Specialists:
                </p>
                <div className="flex flex-wrap gap-2">
                  {condition.specialists.map((specialist, idx) => (
                    <Badge key={idx} variant="outline">
                      {specialist}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild>
                  <Link href="/appointments">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/chat">Ask AI Doctor</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-800">Next Steps</p>
              <p className="text-sm text-blue-700">
                Consider booking an appointment with one of the recommended specialists for a proper diagnosis and
                treatment plan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
