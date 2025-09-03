"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, ChevronLeft, ChevronRight, Eye, FileText, Users, Clock, CreditCard, ShoppingCart } from "lucide-react";
import { formatCurrency } from '@/lib/currency';
import { useApp } from "@/context/app-context";

interface EnhancedTransactionTableProps {
  className?: string;
}

export function EnhancedTransactionTable({ className }: EnhancedTransactionTableProps) {
  const { completedTransactions, billingOrders, isLoaded, settings } = useApp();
  const [viewMode, setViewMode] = useState<'individual' | 'table'>('individual');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show more items in table format
  
  const transactions = completedTransactions || [];

  // Create a lookup map for order items from billing orders
  const orderItemsMap = useMemo(() => {
    const map = new Map();
    billingOrders?.forEach(order => {
      map.set(order.id, order.items || []);
    });
    return map;
  }, [billingOrders]);

  const processedTransactions = useMemo(() => {
    if (viewMode === 'individual') {
      return transactions
        .filter(t => t.orderId)
        .map(tx => ({
          ...tx,
          orderItems: orderItemsMap.get(tx.orderId) || []
        }))
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
            transactionCount: 0,
            allItems: []
          });
        }
        const group = tableGroups.get(tableId);
        group.amount += tx.amount || 0;
        group.transactionCount += 1;
        if (tx.orderId) {
          group.orderIds.push(tx.orderId);
          const items = orderItemsMap.get(tx.orderId);
          if (items && items.length > 0) {
            group.allItems = [...group.allItems, ...items];
          }
        }
        if (new Date(tx.timestamp) > new Date(group.timestamp)) {
          group.timestamp = tx.timestamp;
        }
      });
      return Array.from(tableGroups.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }, [transactions, viewMode, orderItemsMap]);

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

  const renderOrderItems = (items: any[]) => {
    if (!items || items.length === 0) return null;
    
    const displayItems = items.slice(0, 2);
    const remainingCount = items.length - 2;
    
    return (
      <div className="flex flex-wrap gap-1">
        {displayItems.map((item, index) => (
          <Badge 
            key={index}
            variant="outline" 
            className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700"
          >
            {item.quantity}x {item.name}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            +{remainingCount} more
          </Badge>
        )}
      </div>
    );
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
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Enhanced Transaction History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {viewMode === 'individual' ? 'Individual order transactions with item details' : 'Consolidated table transactions with summary'}
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
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {viewMode === 'individual' ? (
                      <>
                        <TableHead className="text-xs font-semibold w-24">Order ID</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Table</TableHead>
                        <TableHead className="text-xs font-semibold min-w-28">Customer</TableHead>
                        <TableHead className="text-xs font-semibold min-w-32">Items Ordered</TableHead>
                        <TableHead className="text-xs font-semibold w-20">Amount</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Method</TableHead>
                        <TableHead className="text-xs font-semibold w-20">Date</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Time</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Action</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-xs font-semibold w-16">Table</TableHead>
                        <TableHead className="text-xs font-semibold w-20">Orders</TableHead>
                        <TableHead className="text-xs font-semibold min-w-32">All Items</TableHead>
                        <TableHead className="text-xs font-semibold w-20">Amount</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Method</TableHead>
                        <TableHead className="text-xs font-semibold w-20">Date</TableHead>
                        <TableHead className="text-xs font-semibold w-16">Time</TableHead>
                        <TableHead className="text-xs font-semibold min-w-24">Order IDs</TableHead>
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
                          <TableCell className="font-mono text-xs">
                            #{transaction.orderId?.substring(0, 8) || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {transaction.tableId}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {transaction.customerName || 'Walk-in'}
                              </p>
                              {transaction.notes && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {transaction.notes}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="min-w-0">
                              {transaction.orderItems && transaction.orderItems.length > 0 ? (
                                renderOrderItems(transaction.orderItems)
                              ) : (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <ShoppingCart className="h-3 w-3" />
                                  <span>Items unavailable</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-green-600">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getPaymentMethodBadge(transaction.method).variant}
                              className={`text-xs px-1.5 py-0.5 ${getPaymentMethodBadge(transaction.method).color}`}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {transaction.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(transaction.timestamp || '')}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatTime(transaction.timestamp || '')}
                          </TableCell>
                          <TableCell>
                            {transaction.orderId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className="h-7 w-7 p-0"
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
                          <TableCell className="text-xs font-medium">
                            Table {transaction.tableId}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {transaction.transactionCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="min-w-0">
                              {transaction.allItems?.length > 0 ? (
                                renderOrderItems(transaction.allItems)
                              ) : (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <ShoppingCart className="h-3 w-3" />
                                  <span>No item details</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-green-600">
                            {formatAmount(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getPaymentMethodBadge(transaction.method).variant}
                              className={`text-xs px-1.5 py-0.5 ${getPaymentMethodBadge(transaction.method).color}`}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              {transaction.method}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(transaction.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-gray-50">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} {viewMode === 'individual' ? 'transactions' : 'tables'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-3 text-xs"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Previous
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
                          className="w-8 h-8 p-0 text-xs"
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
                    className="h-8 px-3 text-xs"
                  >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
