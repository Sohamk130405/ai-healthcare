"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Brain,
  Lightbulb,
  Download,
  Share,
  FileImage,
  BookOpen,
  User,
  Calendar,
} from "lucide-react";

interface OCRResultsProps {
  results: {
    pages: Array<{
      index: number;
      markdown: string;
      images: any[];
      dimensions: {
        dpi: number;
        height: number;
        width: number;
      };
    }>;
    documentAnnotation: any;
    model: string;
    usageInfo: {
      pages_processed: number;
      doc_size_bytes: number;
    };
    fileUrl: string;
    fileName: string;
    uploadDate: string;
  };
}

export function OCRResults({ results }: OCRResultsProps) {
  const [activeTab, setActiveTab] = useState("text");

  // Extract all text from pages
  const getAllText = () => {
    return results.pages.map((page) => page.markdown).join("\n\n");
  };

  // Generate insights based on document annotation and content
  const generateInsights = () => {
    const insights = [];

    if (results.documentAnnotation) {
      // Check for student information
      if (results.documentAnnotation.student_info) {
        insights.push(
          `Student document detected for ${results.documentAnnotation.student_info.name}`
        );
        insights.push(
          `Roll number: ${results.documentAnnotation.student_info.roll_no}`
        );
      }

      // Check for tutorial/educational content
      if (results.documentAnnotation.tutorial) {
        insights.push(
          `Educational content: ${results.documentAnnotation.tutorial.title}`
        );
        insights.push(
          `Contains ${
            results.documentAnnotation.tutorial.questions?.length || 0
          } questions and answers`
        );
      }

      // Check for medical content patterns
      const allText = getAllText().toLowerCase();
      if (
        allText.includes("patient") ||
        allText.includes("medical") ||
        allText.includes("diagnosis")
      ) {
        insights.push("Medical document detected");
      }
      if (allText.includes("prescription") || allText.includes("medication")) {
        insights.push("Prescription information found");
      }
      if (
        allText.includes("test") ||
        allText.includes("result") ||
        allText.includes("lab")
      ) {
        insights.push("Test results or lab report detected");
      }
    }

    // Default insights
    if (insights.length === 0) {
      insights.push(
        `Document successfully processed with ${results.pages.length} pages`
      );
      insights.push(`Text extraction completed using ${results.model}`);
      insights.push(
        `Document size: ${(
          results.usageInfo.doc_size_bytes /
          1024 /
          1024
        ).toFixed(2)} MB`
      );
    }

    return insights;
  };

  // Generate recommendations
  const generateRecommendations = () => {
    const recommendations = [];

    if (results.documentAnnotation?.tutorial) {
      recommendations.push(
        "Review the extracted questions and answers for study purposes"
      );
      recommendations.push("Save this document to your academic records");
      recommendations.push("Share with classmates or instructors if needed");
    } else {
      recommendations.push("Review the extracted text for accuracy");
      recommendations.push("Save important information to your records");
      recommendations.push(
        "Consult with relevant professionals if this is a medical document"
      );
    }

    return recommendations;
  };

  const insights = generateInsights();
  const recommendations = generateRecommendations();

  // Format markdown text for better display
  const formatMarkdown = (markdown: string) => {
    return markdown
      .split("\n")
      .map((line, i) => {
        // Convert markdown table format to HTML
        if (line.includes("|")) {
          const cells = line.split("|").filter((cell) => cell.trim());
          if (cells.length > 0) {
            return `<div class="grid grid-cols-${
              cells.length
            } gap-2 border-b py-1">${cells
              .map((cell) => `<div class="text-sm p-1">${cell.trim()}</div>`)
              .join("")}</div>`;
          }
        }
        // Highlight headers (lines starting with #)
        if (line.startsWith("#")) {
          const level = line.match(/^#+/)?.[0].length || 1;
          return `<h${level} class="font-bold text-lg mt-3 mb-1">${line.replace(
            /^#+\s*/,
            ""
          )}</h${level}>`;
        }
        // Bold text
        if (line.includes("**")) {
          line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        }
        return line;
      })
      .join("<br />");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Analysis Complete</h2>
        <p className="text-muted-foreground">
          AI has processed your document and extracted {results.pages.length}{" "}
          pages of content
        </p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>Model: {results.model}</span>
          <span>•</span>
          <span>
            Size: {(results.usageInfo.doc_size_bytes / 1024 / 1024).toFixed(2)}{" "}
            MB
          </span>
        </div>
      </div>

      <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Extracted Text</span>
          </TabsTrigger>
          <TabsTrigger value="structured" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Structured Data</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            <span>Document</span>
          </TabsTrigger>
        </TabsList>

        {/* Extracted Text Tab */}
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Extracted Text ({results.pages.length} pages)
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([getAllText()], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${results.fileName.split(".")[0]}-text.txt`;
                      a.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {results.pages.map((page, index) => (
                  <AccordionItem key={index} value={`page-${index}`}>
                    <AccordionTrigger>
                      Page {page.index + 1} ({page.dimensions.width}x
                      {page.dimensions.height}px)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                        <div
                          className="text-sm whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: formatMarkdown(page.markdown),
                          }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Structured Data Tab */}
        <TabsContent value="structured">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Structured Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.documentAnnotation ? (
                <div className="space-y-4">
                  {/* Student Info */}
                  {results.documentAnnotation.student_info && (
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <User className="h-5 w-5 mr-2" />
                          Student Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Name:</span>{" "}
                            {results.documentAnnotation.student_info.name}
                          </div>
                          <div>
                            <span className="font-medium">Roll No:</span>{" "}
                            {results.documentAnnotation.student_info.roll_no}
                          </div>
                          <div>
                            <span className="font-medium">Division:</span>{" "}
                            {results.documentAnnotation.student_info.div}
                          </div>
                          <div>
                            <span className="font-medium">PRN:</span>{" "}
                            {results.documentAnnotation.student_info.prn}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tutorial Content */}
                  {results.documentAnnotation.tutorial && (
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          {results.documentAnnotation.tutorial.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          {results.documentAnnotation.tutorial.questions?.map(
                            (q: any, index: number) => (
                              <AccordionItem
                                key={index}
                                value={`question-${index}`}
                              >
                                <AccordionTrigger className="text-left">
                                  Q{index + 1}: {q.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3">
                                    <p className="text-sm">
                                      {q.answer.description}
                                    </p>
                                    {q.answer.properties && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium">
                                          Properties:
                                        </h4>
                                        {q.answer.properties.map(
                                          (prop: any, i: number) => (
                                            <div
                                              key={i}
                                              className="border-l-2 border-blue-200 pl-3"
                                            >
                                              <div className="font-medium">
                                                {prop.name}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {prop.description}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                    {q.answer.architectures && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium">
                                          Architectures:
                                        </h4>
                                        {q.answer.architectures.map(
                                          (arch: any, i: number) => (
                                            <div
                                              key={i}
                                              className="border-l-2 border-green-200 pl-3 space-y-1"
                                            >
                                              <div className="font-medium">
                                                {arch.name}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {arch.description}
                                              </div>
                                              {arch.advantages && (
                                                <div>
                                                  <span className="text-sm font-medium text-green-700">
                                                    Advantages:
                                                  </span>
                                                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                    {arch.advantages.map(
                                                      (
                                                        adv: string,
                                                        j: number
                                                      ) => (
                                                        <li key={j}>{adv}</li>
                                                      )
                                                    )}
                                                  </ul>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No structured data extracted from this document</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Badge variant="secondary" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Badge variant="outline" className="mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Document Tab */}
        <TabsContent value="document">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Original Document
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="max-w-full overflow-hidden rounded-md border">
                {results.fileUrl &&
                  (results.fileUrl.endsWith(".pdf") ? (
                    <div className="bg-muted/50 p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF Document
                      </p>
                      <Button
                        onClick={() => window.open(results.fileUrl, "_blank")}
                        variant="outline"
                      >
                        View PDF
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={results.fileUrl || "/placeholder.svg"}
                      alt="Uploaded document"
                      className="max-w-full h-auto max-h-[500px] object-contain"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Processing Info */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">
                  Processing Complete
                </p>
                <p className="text-sm text-purple-700">
                  Processed {results.usageInfo.pages_processed} pages •{" "}
                  {new Date(results.uploadDate).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button size="sm" variant="outline">
                Save to Records
              </Button>
              <Button size="sm" variant="outline">
                Share Document
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
