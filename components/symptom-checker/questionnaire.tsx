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
import { AlertCircle, HelpCircle, Loader2 } from "lucide-react";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const answers = [];
    const newErrors: Record<string, string> = {};

    // Validate and collect answers based on question type
    if (question.type === "single") {
      const item = question.items[0];
      const answer = selectedAnswers[item.id];
      if (!answer) {
        newErrors[item.id] = "Please select an answer";
      } else {
        answers.push({ id: item.id, choice_id: answer });
      }
    } else if (question.type === "group_single") {
      question.items.forEach((item) => {
        const answer = selectedAnswers[item.id];
        if (!answer) {
          newErrors[item.id] = "Please select an answer";
        } else {
          answers.push({ id: item.id, choice_id: answer });
        }
      });
    } else if (question.type === "group_multiple") {
      question.items.forEach((item) => {
        const isSelected = selectedAnswers[item.id];
        if (isSelected) {
          answers.push({ id: item.id, choice_id: "present" });
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(answers);
  };

  const handleRadioChange = (itemId: string, choiceId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [itemId]: choiceId }));
    if (errors[itemId]) {
      setErrors((prev) => ({ ...prev, [itemId]: "" }));
    }
  };

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setSelectedAnswers((prev) => ({ ...prev, [itemId]: checked }));
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
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
              value={selectedAnswers[singleItem.id] as string}
              onValueChange={(value) => handleRadioChange(singleItem.id, value)}
            >
              <div className="space-y-3">
                {singleItem.choices.map((choice) => (
                  <div key={choice.id} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={choice.id}
                      id={`${singleItem.id}-${choice.id}`}
                    />
                    <Label
                      htmlFor={`${singleItem.id}-${choice.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {choice.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            {errors[singleItem.id] && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors[singleItem.id]}</span>
              </div>
            )}
          </div>
        );

      case "group_single":
        return (
          <div className="space-y-6">
            {question.items.map((item) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{item.name}</p>
                </div>
                <RadioGroup
                  value={selectedAnswers[item.id] as string}
                  onValueChange={(value) => handleRadioChange(item.id, value)}
                >
                  <div className="space-y-2 ml-6">
                    {item.choices.map((choice) => (
                      <div
                        key={choice.id}
                        className="flex items-center space-x-3"
                      >
                        <RadioGroupItem
                          value={choice.id}
                          id={`${item.id}-${choice.id}`}
                        />
                        <Label
                          htmlFor={`${item.id}-${choice.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {choice.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                {errors[item.id] && (
                  <div className="flex items-center space-x-2 text-destructive text-sm ml-6">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors[item.id]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "group_multiple":
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Select all that apply:
            </p>
            {question.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50"
              >
                <Checkbox
                  id={item.id}
                  checked={!!selectedAnswers[item.id]}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item.id, !!checked)
                  }
                />
                <Label
                  htmlFor={item.id}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {item.name}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Question type not supported: {question.type}
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {getQuestionTypeLabel(question.type)}
            </Badge>
            {questionNumber && (
              <Badge variant="secondary" className="text-xs">
                Question {questionNumber}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg leading-relaxed">
          {question.text}
        </CardTitle>
        <CardDescription className="text-sm">
          Please provide accurate information to help with the diagnosis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderQuestion()}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Your answers help improve diagnosis accuracy
            </p>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Next Question"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
