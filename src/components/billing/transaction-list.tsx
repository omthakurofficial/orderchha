"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Filter, Users, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency } from '@/lib/currency';
import Link from "next/link";
import { useApp } from "@/context/app-context";

export function TransactionList() {
  const { completedTransactions, isLoaded, settings } = useApp();
  const [viewMode, setViewMode] = useState<'individual' | 'table'>('individual');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const transactions = completedTransactions || [];

  const processedTransactions = useMemo(() => {
    if (viewMode === 'individual') {
      return transactions
        .filter(t => t.orderId) // Only show transactions with order IDs
        .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
    } else {
      // Table consolidated view - group by tableId
      const tableGroups = new Map();
      
      transactions.forEach(tx => {
        const tableId = tx.tableId;
        if (!tableGroups.has(tableId)) {
          tableGroups.set(tableId, {
            id: `table-${tableId}-${Date.now()}`,
            tableId: tableId,
            amount: 0,
            method: 'mixed',
            timestamp: tx.timestamp,
            orderIds: [],
            transactionCount: 0
          });
        }
        
        const group = tableGroups.get(tableId);
        group.amount += tx.amount || 0;
        group.transactionCount += 1;
        if (tx.orderId) {
          group.orderIds.push(tx.orderId);
        }
        
        if (new Date(tx.timestamp) > new Date(group.timestamp)) {
          group.timestamp = tx.timestamp;
        }
      });
      
      return Array.from(tableGroups.values());
    }
  }, [transactions, viewMode]);

  // Pagination calculations
  const totalItems = processedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = processedTransactions.slice(startIndex, endIndex);

  // Reset to first page when view mode changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, settings?.currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="view-mode" className="text-xs font-medium">View:</label>
          <Select value={viewMode} onValueChange={(value: 'individual' | 'table') => setViewMode(value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual" className="text-xs">Individual Orders</SelectItem>
              <SelectItem value="table" className="text-xs">Table Consolidated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === 'individual' ? (
        <div className="space-y-3">
          {paginatedTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                <p className="text-sm">No individual order transactions found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedTransactions.map((transaction: any) => (
                <Card key={transaction.id || `${transaction.orderId}-${transaction.timestamp}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">Order #{transaction.orderId}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">
                          Table {transaction.tableId} • {formatDate(transaction.timestamp || '')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-green-600">
                          {formatAmount(transaction.amount)}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs px-1 py-0">
                          {transaction.method}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    {transaction.orderId && (
                      <div className="text-xs">
                        <a
                          href={`/receipt/order/${transaction.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Receipt →
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination Controls for Individual View */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-6 h-7 p-0 text-xs"
                          >
                            {page}
                          </Button>
                        ) : null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                <p className="text-sm">No consolidated transactions found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedTransactions.map((group: any, index: number) => (
                <Card key={`table-${group.tableId}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold">Table {group.tableId}</CardTitle>
                        <p className="text-xs text-gray-600 mt-1">
                          {group.transactionCount} orders • {formatDate(group.timestamp)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-green-600">
                          {formatAmount(group.amount)}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs px-1 py-0">
                          Consolidated
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span>{group.transactionCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination Controls for Table View */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} tables
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-6 h-7 p-0 text-xs"
                          >
                            {page}
                          </Button>
                        ) : null;
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 px-2 text-xs"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
