'use client';

import { useApp } from "@/context/app-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Eye, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { IndividualPaymentDialog } from "./individual-payment-dialog";

interface OrderDetailsDialogProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onPayment: (orderId: string) => void;
}

function OrderDetailsDialog({ order, isOpen, onClose, onPayment }: OrderDetailsDialogProps) {
  const { settings } = useApp();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Review order details before processing payment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Order ID:</span>
              <div className="text-muted-foreground">{order.id.substring(0, 8)}</div>
            </div>
            <div>
              <span className="font-medium">Table:</span>
              <div className="text-muted-foreground">{order.tableId}</div>
            </div>
            <div>
              <span className="font-medium">Customer:</span>
              <div className="text-muted-foreground">{order.customer_name || 'Walk-in'}</div>
            </div>
            <div>
              <span className="font-medium">Time:</span>
              <div className="text-muted-foreground">
                {order.timestamp ? new Date(order.timestamp).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Items Ordered</h4>
            <div className="space-y-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-1 border-b">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency(item.price, settings?.currency)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.price * item.quantity, settings?.currency)}
                  </div>
                </div>
              )) || (
                <div className="text-muted-foreground text-center py-2">No items found</div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Amount:</span>
            <span>{formatCurrency(order.totalAmount || 0, settings?.currency)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => onPayment(order.id)} 
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function IndividualOrdersBilling() {
  const { billingOrders, isLoaded, refreshDataFromDatabase, settings } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 tables per page

  // Group orders by table for better organization
  const ordersByTable = useMemo(() => {
    const grouped = billingOrders.reduce((acc, order) => {
      const tableId = order.tableId;
      if (!acc[tableId]) {
        acc[tableId] = [];
      }
      acc[tableId].push(order);
      return acc;
    }, {} as Record<number, any[]>);
    
    return grouped;
  }, [billingOrders]);

  // Pagination for tables
  const tableEntries = Object.entries(ordersByTable);
  const totalTables = tableEntries.length;
  const totalPages = Math.ceil(totalTables / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTables = tableEntries.slice(startIndex, endIndex);

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleProcessIndividualPayment = (orderId: string) => {
    const order = billingOrders.find(o => o.id === orderId);
    if (order) {
      setPaymentOrder(order);
      setShowPaymentDialog(true);
    }
    setShowOrderDetails(false);
  };

  const handlePaymentComplete = () => {
    refreshDataFromDatabase();
    setShowPaymentDialog(false);
    setPaymentOrder(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Individual Orders</CardTitle>
              <CardDescription className="text-xs">
                Process payments for individual orders separately.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshDataFromDatabase} className="h-7 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {!isLoaded ? (
            <div className="text-center p-4">
              <div className="animate-pulse text-sm">Loading orders...</div>
            </div>
          ) : Object.keys(ordersByTable).length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <p className="text-sm">No individual orders waiting for payment.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedTables.map(([tableId, orders]) => (
                  <div key={tableId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">Table {tableId}</h3>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {orders.length} order{orders.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="flex items-center justify-between p-2 border rounded bg-muted/30"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                #{order.id.substring(0, 8)}
                              </span>
                              <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                                {order.items?.length || 0} items
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {order.items?.slice(0, 2).map((item: any, index: number) => (
                                <span key={index}>
                                  {item.name} {item.quantity > 1 && `x${item.quantity}`}
                                  {index < Math.min((order.items?.length || 0), 2) - 1 && ', '}
                                </span>
                              ))}
                              {(order.items?.length || 0) > 2 && '...'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.timestamp ? new Date(order.timestamp).toLocaleTimeString() : 'Recent'}
                            </div>
                            <div className="text-sm font-semibold mt-1">
                              {formatCurrency(order.totalAmount || 0, settings?.currency)}
                            </div>
                          </div>
                          
                          <div className="flex gap-1 flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewOrderDetails(order)}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleProcessIndividualPayment(order.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {orders.length > 1 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-blue-800">
                            <strong>Table Total:</strong> {formatCurrency(
                              orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0), 
                              settings?.currency
                            )}
                          </span>
                          <Button variant="outline" size="sm" className="text-blue-800 border-blue-400">
                            Pay All Together
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>
                      {startIndex + 1}-{Math.min(endIndex, totalTables)} of {totalTables} tables
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
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          isOpen={showOrderDetails}
          onClose={() => setShowOrderDetails(false)}
          onPayment={handleProcessIndividualPayment}
        />
      )}

      {paymentOrder && (
        <IndividualPaymentDialog
          order={paymentOrder}
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
