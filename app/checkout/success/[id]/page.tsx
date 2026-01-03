import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CheckoutSuccessPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-10 pb-8 px-6 space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="ml-2 font-mono font-medium">{id}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/orders">
                <Package className="mr-2 h-4 w-4" /> View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optional: Add confetti or similar celebrations here */}
    </div>
  );
}
