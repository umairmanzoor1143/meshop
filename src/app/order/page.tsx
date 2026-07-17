import { Suspense } from "react";
import { OrderView } from "@/components/views/OrderView";

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <OrderView />
    </Suspense>
  );
}
