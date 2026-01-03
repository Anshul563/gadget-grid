"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  orderId: number;
  currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleValueChange = async (newStatus: string) => {
    setIsLoading(true);
    setStatus(newStatus); // Optimistic update
    
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
      setStatus(currentStatus); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  // Color coding for badges/select
  const getColor = (s: string) => {
    switch (s) {
      case "pending": return "text-yellow-600";
      case "processing": return "text-blue-600";
      case "shipped": return "text-purple-600";
      case "delivered": return "text-green-600";
      case "cancelled": return "text-red-600";
      default: return "";
    }
  };

  return (
    <Select value={status} onValueChange={handleValueChange} disabled={isLoading}>
      <SelectTrigger className={`w-[130px] h-8 ${getColor(status)}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="shipped">Shipped</SelectItem>
        <SelectItem value="delivered">Delivered</SelectItem>
        <SelectItem value="cancelled">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}