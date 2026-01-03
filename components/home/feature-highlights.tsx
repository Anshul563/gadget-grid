import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over ₹499",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% protected transactions",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team",
  },
];

export function FeatureHighlights() {
  return (
    <div className="w-full py-8 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4 group hover:bg-muted/50 p-4 rounded-lg transition-colors"
            >
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-xs md:text-base leading-none">
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}