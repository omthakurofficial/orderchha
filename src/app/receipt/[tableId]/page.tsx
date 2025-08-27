import ReceiptClient from '@/components/receipt/receipt-client';

// Generate static params for common table IDs (1-20)
export async function generateStaticParams() {
  const tableIds = Array.from({ length: 20 }, (_, i) => ({ tableId: (i + 1).toString() }));
  return tableIds;
}

interface ReceiptPageProps {
  params: {
    tableId: string;
  };
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  return <ReceiptClient tableId={params.tableId} />;
}
