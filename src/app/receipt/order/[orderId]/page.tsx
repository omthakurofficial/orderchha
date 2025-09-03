import IndividualReceiptClient from '../../../../components/receipt/individual-receipt-client';

// Generate static params for common order IDs (this is a fallback)
export async function generateStaticParams() {
  // Return empty array since we can't predict order IDs
  return [];
}

// Enable dynamic params for order-based receipts
export const dynamicParams = true;

interface IndividualReceiptPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function IndividualReceiptPage({ params }: IndividualReceiptPageProps) {
  const { orderId } = await params;
  return <IndividualReceiptClient orderId={orderId} />;
}
