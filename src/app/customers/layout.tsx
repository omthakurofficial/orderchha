import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OrderChha - Customers",
  description: "Manage customers and track credit balances",
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
