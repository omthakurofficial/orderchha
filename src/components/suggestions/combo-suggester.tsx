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
    <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white/90 shadow-sm">
      <CardHeader className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <CardTitle className="font-headline text-lg text-slate-900 sm:text-xl">Need a recommendation?</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Quick AI suggestions for upsells or meal combinations.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
        <Button
          onClick={handleGetSuggestions}
          disabled={isPending}
          className="h-10 rounded-full bg-orange-500 px-4 text-sm text-white shadow-sm hover:bg-orange-600"
        >
          {isPending && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Thinking..." : "Get Suggestions"}
        </Button>

        {isPending && !error && suggestions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                Finding the best deals for you...
            </div>
        )}

        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h4 className="mb-2 text-sm font-semibold text-slate-900">You might like</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="rounded-lg bg-white px-3 py-2 shadow-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
