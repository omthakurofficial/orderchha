# TypeScript Issues Resolution Guide

The project contains several TypeScript errors related to hybrid database configuration. These errors don't affect the current application functionality since we're using Supabase as the primary database.

## Quick Fixes for Common Issues

1. **Missing Total Property in KitchenOrder**
   - This has been fixed by adding `total: number` to the KitchenOrder interface in `src/types/index.ts`
   - We also ensured all instances of KitchenOrder objects include this property

2. **Firebase-Bridge Import Errors**
   - The firebase-bridge.ts file contains TypeScript errors because it's not currently being used
   - You can either:
     - Ignore these errors as they don't affect functionality
     - Update the file with the latest type definitions
     - Delete the file if it's no longer needed

3. **Hybrid Database Issues**
   - The hybrid database setup is not currently active
   - Files like `app-context-hybrid.tsx` and `multi-database.ts` contain TypeScript errors
   - These can be ignored unless you plan to use the hybrid database setup

## How to Fix Table Type Issues

If you're seeing errors related to Table status types, make sure the Table interface in `src/types/index.ts` includes all possible statuses:

```typescript
export interface Table {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'billing' | 'disabled';
  capacity: number;
  location: string;
}
```

## Payment Processing

The payment processing flow works as follows:

1. Tables in 'occupied' status can be changed to 'billing' status using the BillingActions component
2. Tables in 'billing' or 'cleaning' status will appear in the Active Bills section
3. Each table card has a "Process Payment" button
4. When clicked, a payment dialog appears with options for payment methods
5. After payment is processed, the table status changes to 'available'
6. A transaction record is created and appears in the Recent Transactions list

If you encounter issues with payment processing:

1. Check if the table is in 'billing' or 'cleaning' status
2. Make sure you're logged in with admin or cashier permissions
3. Check browser console for any errors
4. Try refreshing the page if needed
