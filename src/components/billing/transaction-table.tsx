"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, ChevronLeft, ChevronRight, Eye, FileText, Users, Clock, CreditCard } from "lucide-react";
import { formatCurrency } from '@/lib/currency';
import { useApp } from "@/context/app-context";

interface TransactionTableProps {
  className?: string;
}

export function TransactionTable({ className }: TransactionTableProps) {
  const { completedTransactions, isLoaded, settings } = useApp();
  const [viewMode, setViewMode] = useState<'individual' | 'table'>('individual');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
  
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
      
      return Array.from(tableGroups.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [transactions, viewMode]);

  // Pagination calculations
  const totalItems = processedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = processedTransactions.slice(startIndex, endIndex);

  // Reset to first page when view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);
  
  // Handle keyboard navigation for pagination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard navigation when the component is visible in viewport
      const card = document.querySelector('.transaction-history-card');
      if (card && card.getBoundingClientRect().top <= window.innerHeight) {
        if (e.key === 'ArrowLeft' && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages]);

  const formatAmount = (amount: number) => {
    return formatCurrency(amount, settings?.currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const badgeProps = {
      cash: { variant: "default" as const, color: "bg-green-100 text-green-800" },
      card: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      online: { variant: "outline" as const, color: "bg-purple-100 text-purple-800" },
      mixed: { variant: "destructive" as const, color: "bg-orange-100 text-orange-800" }
    };
    
    return badgeProps[method as keyof typeof badgeProps] || badgeProps.cash;
  };

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading transaction history...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transaction-history-card ${className || ''} max-w-full`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {viewMode === 'individual' ? 'Individual order transactions' : 'Consolidated table transactions'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value: 'individual' | 'table') => setViewMode(value)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual" className="text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Individual Orders
                  </div>
                </SelectItem>
                <SelectItem value="table" className="text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Table Consolidated
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {paginatedTransactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Receipt className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-gray-400 mt-1">
              {viewMode === 'individual' 
                ? 'No individual order transactions to display' 
                : 'No consolidated table transactions to display'
              }
            </p>
          </div>
        ) : (
          <div className="transaction-table-container" style={{ maxHeight: '65vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="overflow-x-auto relative" style={{ maxWidth: '100%', overscrollBehavior: 'contain' }}>
              <Table className="w-full table-fixed" style={{ minWidth: '650px' }}>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {viewMode === 'individual' ? (
                      <>
                        <TableHead className="text-xs font-semibold w-[12%]">Order ID</TableHead>
                        <TableHead className="text-xs font-semibold w-[8%]">Table</TableHead>
                        <TableHead className="text-xs font-semibold w-[20%]">Customer</TableHead>
                        <TableHead className="text-xs font-semibold w-[12%]">Amount</TableHead>
                        <TableHead className="text-xs font-semibold w-[12%]">Method</TableHead>
                        <TableHead className="text-xs font-semibold w-[14%]">Date</TableHead>
                        <TableHead className="text-xs font-semibold w-[12%]">Time</TableHead>
                        <TableHead className="text-xs font-semibold w-[10%]">Action</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-xs font-semibold w-[10%]">Table</TableHead>
                        <TableHead className="text-xs font-semibold w-[10%]">Orders</TableHead>
                        <TableHead className="text-xs font-semibold w-[15%]">Amount</TableHead>
                        <TableHead className="text-xs font-semibold w-[15%]">Method</TableHead>
                        <TableHead className="text-xs font-semibold w-[15%]">Date</TableHead>
                        <TableHead className="text-xs font-semibold w-[15%]">Time</TableHead>
                        <TableHead className="text-xs font-semibold w-[20%]">Order IDs</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction: any) => (
                    <TableRow 
                      key={transaction.id || `${transaction.orderId}-${transaction.timestamp}`}
                      className="hover:bg-gray-50"
                    >
                      {viewMode === 'individual' ? (
                        <>
                          <TableCell className="font-mono text-xs whitespace-nowrap truncate">
                            #{transaction.orderId?.substring(0, 8) || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            {transaction.tableId}
                          </TableCell>
                          <TableCell className="text-xs truncate max-w-[120px]">
                            {transaction.customerName || 'Walk-in'}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-green-600 whitespace-nowrap">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge 
                              variant={getPaymentMethodBadge(transaction.method).variant}
                              className={`text-xs px-1.5 py-0.5 ${getPaymentMethodBadge(transaction.method).color}`}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {transaction.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(transaction.timestamp || '')}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatTime(transaction.timestamp || '')}
                          </TableCell>
                          <TableCell className="text-center">
                            {transaction.orderId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-7 w-7 p-0 mx-auto"
                              >
                                <a
                                  href={`/receipt/order/${transaction.orderId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="View Receipt"
                                >
                                  <Eye className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-xs font-medium whitespace-nowrap">
                            Table {transaction.tableId}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {transaction.transactionCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-green-600 whitespace-nowrap">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge 
                              variant={getPaymentMethodBadge(transaction.method).variant}
                              className={`text-xs px-1.5 py-0.5 ${getPaymentMethodBadge(transaction.method).color}`}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {transaction.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(transaction.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatTime(transaction.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex flex-wrap gap-1">
                              {transaction.orderIds?.slice(0, 2).map((orderId: string) => (
                                <Badge 
                                  key={orderId} 
                                  variant="secondary" 
                                  className="text-xs px-1 py-0 font-mono"
                                >
                                  #{orderId.substring(0, 6)}
                                </Badge>
                              ))}
                              {transaction.orderIds?.length > 2 && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  +{transaction.orderIds.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Enhanced Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap gap-y-2 justify-between p-3 border-t bg-gray-50">
                {/* Pagination Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} {viewMode === 'individual' ? 'transactions' : 'tables'}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs mr-1">Show:</span>
                    <Select 
                      value={String(itemsPerPage)} 
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                    >
                      <SelectTrigger className="h-7 w-16 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10" className="text-xs">10</SelectItem>
                        <SelectItem value="25" className="text-xs">25</SelectItem>
                        <SelectItem value="50" className="text-xs">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Page Navigation */}
                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-7 w-7 p-0 text-xs hidden sm:flex items-center justify-center"
                    title="First Page"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    <ChevronLeft className="h-3 w-3 -ml-1" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-7 px-2 text-xs"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Prev
                  </Button>
                  
                  {/* Desktop page numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {/* First page button if we're not at the beginning */}
                    {currentPage > 3 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className="w-7 h-7 p-0 text-xs"
                        >
                          1
                        </Button>
                        {currentPage > 4 && (
                          <span className="text-xs text-gray-500 px-1">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Page number buttons */}
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                      // Center the current page
                      const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
                      const page = startPage + i;
                      return page <= totalPages ? (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-7 h-7 p-0 text-xs"
                        >
                          {page}
                        </Button>
                      ) : null;
                    })}
                    
                    {/* Last page button if we're not at the end */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="text-xs text-gray-500 px-1">...</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-7 h-7 p-0 text-xs"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Mobile page indicator */}
                  <div className="flex sm:hidden items-center">
                    <span className="text-xs text-gray-600 px-1">
                      {currentPage}/{totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="h-7 px-2 text-xs"
                  >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-7 w-7 p-0 text-xs hidden sm:flex items-center justify-center"
                    title="Last Page"
                  >
                    <ChevronRight className="h-3 w-3" />
                    <ChevronRight className="h-3 w-3 -ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
