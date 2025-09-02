
'use client';

import { useApp } from "@/context/app-context";
import { TableCard } from "./table-card";

export function FloorPlan() {
  const { tables } = useApp();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {tables.map((table) => (
        <TableCard key={table.id} table={table} />
      ))}
    </div>
  );
}
