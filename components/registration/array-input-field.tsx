"use client";

import type React from "react";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface ArrayInputFieldProps {
  label: string;
  placeholder: string;
  suggestions?: string[];
  items: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (index: number) => void;
}

export const ArrayInputField = memo(function ArrayInputField({
  label,
  placeholder,
  suggestions = [],
  items,
  onAddItem,
  onRemoveItem,
}: ArrayInputFieldProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddItem = useCallback(() => {
    if (inputValue.trim()) {
      onAddItem(inputValue.trim());
      setInputValue("");
    }
  }, [inputValue, onAddItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddItem();
      }
    },
    [handleAddItem]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (!items.includes(suggestion)) {
        onAddItem(suggestion);
      }
    },
    [items, onAddItem]
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={items.includes(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddItem}
            disabled={!inputValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
