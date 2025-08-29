
'use client';

import { AddTableDialog } from "@/components/tables/add-table-dialog";
import { FloorPlan } from "@/components/tables/floor-plan";
import { useApp } from "@/context/app-context-supabase";
import { Suspense } from "react";

export default function Home() {
  const { currentUser } = useApp();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold font-headline">Table Management</h1>
            <p className="text-muted-foreground">Live view of your restaurant's floor plan.</p>
        </div>
        {currentUser?.role === 'admin' && <AddTableDialog />}
      </header>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Suspense fallback={<div>Loading tables...</div>}>
          <FloorPlan />
        </Suspense>
      </main>
    </div>
  );
}
