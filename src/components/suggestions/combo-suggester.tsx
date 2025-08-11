"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, LoaderCircle } from "lucide-react";
import { getSuggestions } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ComboSuggester() {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = () => {
    startTransition(async () => {
      setError(null);
      setSuggestions([]);
      const result = await getSuggestions();
      if (result.error) {
        setError(result.error);
      } else if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-accent-foreground" />
            <div>
                <CardTitle className="font-headline">Need a Recommendation?</CardTitle>
                <CardDescription>
                Let our AI help you find the perfect meal combination!
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGetSuggestions} disabled={isPending}>
          {isPending && <LoaderCircle className="animate-spin" />}
          {isPending ? "Thinking..." : "Get Suggestions"}
        </Button>

        {isPending && !error && suggestions.length === 0 && (
            <div className="mt-4 flex items-center justify-center text-muted-foreground">
                <p>Finding the best deals for you...</p>
            </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <h4 className="font-bold mb-2">You might like:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
