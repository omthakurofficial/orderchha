  const processPayment = useCallback((tableId: number, method: 'cash' | 'online', applyVat: boolean) => {
    // Find orders for this table that are completed
    const ordersForTable = kitchenOrders.filter(o => o.tableId === tableId && o.status === 'completed');
    
    // Calculate totals
    const subtotal = ordersForTable.reduce((acc, order) => acc + (order.total || order.totalAmount), 0);
    const vat = applyVat ? subtotal * 0.13 : 0;
    const total = subtotal + vat;
    
    // Create a transaction
    const transaction: Transaction = {
      id: `tr-${Date.now()}`,
      tableId,
      amount: total,
      method,
      timestamp: new Date().toISOString(),
    };
    
    // Complete the transaction
    completeTransaction(transaction)
      .then(() => {
        // Update table status
        return updateTableStatus(tableId, 'available');
      })
      .catch(error => {
        console.error('Payment processing error:', error);
      });
  }, [kitchenOrders, completeTransaction, updateTableStatus]);
