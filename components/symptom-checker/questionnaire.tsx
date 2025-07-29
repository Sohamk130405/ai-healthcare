"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Loader2, ChevronRight } from "lucide-react";

interface Choice {
  id: string;
  label: string;
}

interface Item {
  id: string;
  name: string;
  choices: Choice[];
}

interface Question {
  type: "single" | "group_single" | "group_multiple";
  text: string;
  items: Item[];
}

interface QuestionnaireProps {
  question: Question;
  onSubmit: (answers: any) => void;
  isLoading?: boolean;
  questionNumber?: number;
}

export function Questionnaire({
  question,
  onSubmit,
  isLoading = false,
  questionNumber,
}: QuestionnaireProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | boolean>
  >({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors([]);
    //@ts-ignore
    const answers = [];
    const requiredItems = question.items.filter(
      (item) => question.type === "single" || question.type === "group_single"
    );

    // Validation for required questions
    if (question.type === "single" || question.type === "group_single") {
      const missingAnswers = requiredItems.filter(
        (item) => !selectedAnswers[item.id]
      );
      if (missingAnswers.length > 0) {
        setErrors(missingAnswers.map((item) => `Please answer: ${item.name}`));
        return;
      }
    }

    // Format answers based on question type
    if (question.type === "group_multiple") {
      question.items.forEach((item) => {
        if (selectedAnswers[item.id]) {
          answers.push({ id: item.id, choice_id: "present" });
        }
      });
    } else {
      Object.entries(selectedAnswers).forEach(([itemId, choiceId]) => {
        if (choiceId) {
          answers.push({ id: itemId, choice_id: choiceId });
        }
      });
    }
    // @ts-ignore
    onSubmit(answers);
  };

  const handleRadioChange = (itemId: string, choiceId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    setErrors([]);
  };

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [itemId]: checked }));
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case "single":
        return "Single Choice";
      case "group_single":
        return "Multiple Questions";
      case "group_multiple":
        return "Multiple Selection";
      default:
        return "Question";
    }
  };

  const renderQuestion = () => {
    switch (question.type) {
      case "single":
        const singleItem = question.items[0];
        return (
          <div className="space-y-4">
            <RadioGroup
              value={(selectedAnswers[singleItem.id] as string) || ""}
              onValueChange={(value) => handleRadioChange(singleItem.id, value)}
            >
              <div className="grid gap-3">
                {singleItem.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem
                      value={choice.id}
                      id={`${singleItem.id}-${choice.id}`}
                    />
                    <Label
                      htmlFor={`${singleItem.id}-${choice.id}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {choice.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case "group_single":
        return (
          <div className="space-y-6">
            {question.items.map((item, index) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                </div>
                <RadioGroup
                  value={(selectedAnswers[item.id] as string) || ""}
                  onValueChange={(value) => handleRadioChange(item.id, value)}
                >
                  <div className="grid gap-2 ml-6">
                    {item.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <RadioGroupItem
                          value={choice.id}
                          id={`${item.id}-${choice.id}`}
                        />
                        <Label
                          htmlFor={`${item.id}-${choice.id}`}
                          className="flex-1 cursor-pointer text-sm font-normal"
                        >
                          {choice.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {index < question.items.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </div>
        );

      case "group_multiple":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Select all symptoms that apply to you:
            </p>
            <div className="grid gap-3">
              {question.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={item.id}
                    checked={(selectedAnswers[item.id] as boolean) || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(item.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={item.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {item.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Question type not supported.</p>
          </div>
        );
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getQuestionTypeLabel()}
              </Badge>
              {questionNumber && (
                <Badge variant="outline" className="text-xs">
                  Question {questionNumber}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {question.text}
            </CardTitle>
          </div>
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        {question.type === "group_multiple" && (
          <CardDescription>
            You can select multiple options or none if they don't apply.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <div
                  key={index}
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Question Content */}
          {renderQuestion()}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
