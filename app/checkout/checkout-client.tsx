"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, MapPin, Check, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";

import { addAddress, selectAddress } from "@/app/actions/address";
import { placeOrder } from "@/app/actions/checkout";

// Reuse types from LocationDialog if possible, but defining here for speed
type Address = {
  id: number;
  label: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  landmark?: string | null;
  altPhone?: string | null;
  isSelected?: boolean | null;
};

type CartItem = {
  id: number;
  quantity: number;
  product: {
    name: string;
    price: string;
    salePrice: string | null;
    images: string[] | null;
  };
};

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

export function CheckoutClient({
  initialAddresses,
  activeAddressId,
  cartItems,
}: {
  initialAddresses: Address[];
  activeAddressId: number | null;
  cartItems: CartItem[];
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    activeAddressId?.toString() || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    name: "",
    mobile: "",
    altPhone: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [isLocating, setIsLocating] = useState(false);

  // Totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product.salePrice || item.product.price);
    return sum + price * item.quantity;
  }, 0);
  const discount = 0;
  const total = subtotal - discount;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p);

  // Handle Address Selection
  const handleAddressSelect = async (val: string) => {
    setSelectedAddressId(val);
    await selectAddress(parseInt(val));
    router.refresh(); // Refresh to update server state if needed
  };

  // Handle Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsPlacingOrder(true);
    const formData = new FormData();
    formData.append("paymentMethod", paymentMethod);

    try {
      await placeOrder(formData);
      // specific error handling could be improved if placeOrder returned state
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to place order");
      setIsPlacingOrder(false);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (formData: FormData) => {
    await addAddress(formData);
    toast.success("Address added");
    setAddressForm({
      label: "Home",
      name: "",
      mobile: "",
      altPhone: "",
      address: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
    });
    setIsAddingAddress(false);
    router.refresh();
  };

  // Pincode Lookup (Simplified version of LocationDialog's)
  const handlePincodeLookup = async () => {
    if (addressForm.pincode.length !== 6) {
      toast.error("Invalid Pincode");
      return;
    }

    setIsLocating(true);
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${addressForm.pincode}`
      );
      const data = await res.json();

      if (data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setAddressForm((prev) => ({
          ...prev,
          city: details.District,
          state: details.State,
        }));
        toast.success("City & State detected!");
      } else {
        toast.error("Invalid Pincode");
      }
    } catch (e) {
      toast.error("Failed to fetch details");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* LEFT COLUMN: ADDRESS & PAYMENT */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. SHIPPING ADDRESS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  No addresses found.
                </p>
                <Button onClick={() => setIsAddingAddress(true)}>
                  Add New Address
                </Button>
              </div>
            ) : (
              <RadioGroup
                value={selectedAddressId}
                onValueChange={handleAddressSelect}
                className="grid gap-4"
              >
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-all ${
                      selectedAddressId === addr.id.toString()
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <RadioGroupItem
                      value={addr.id.toString()}
                      id={`addr-${addr.id}`}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none w-full">
                      <Label
                        htmlFor={`addr-${addr.id}`}
                        className="font-semibold cursor-pointer"
                      >
                        {addr.label}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({addr.name})
                        </span>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {addr.address},{" "}
                        {addr.landmark ? `${addr.landmark}, ` : ""}
                        {addr.city}, {addr.state} -{" "}
                        <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Mobile: {addr.mobile}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            )}

            {addresses.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingAddress(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add New Address
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. PAYMENT METHOD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* COD */}
              <div
                className={`cursor-pointer rounded-lg border p-4 flex items-center gap-4 transition-all ${
                  paymentMethod === "cod" ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <RadioGroupItem value="cod" id="pm-cod" />
                <Label htmlFor="pm-cod" className="flex-1 cursor-pointer">
                  <span className="font-semibold block">Cash on Delivery</span>
                  <span className="text-sm text-muted-foreground">
                    Pay when you receive connection
                  </span>
                </Label>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* RAZORPAY (Disabled for now or placeholder) */}
              <div
                className={`cursor-pointer rounded-lg border p-4 flex items-center gap-4 transition-all opacity-50`}
              >
                <RadioGroupItem value="online" id="pm-online" disabled />
                <Label htmlFor="pm-online" className="flex-1 cursor-pointer">
                  <span className="font-semibold block">Online Payment</span>
                  <span className="text-sm text-muted-foreground">
                    Coming Soon
                  </span>
                </Label>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: ORDER SUMMARY */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>{cartItems.length} Items in Cart</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] w-full px-6">
              <div className="space-y-4 pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                      <Image
                        src={
                          Array.isArray(item.product.images) &&
                          item.product.images[0]
                            ? item.product.images[0]
                            : "/images/placeholder.png"
                        }
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-muted-foreground">
                        Qty: {item.quantity} x{" "}
                        {formatPrice(
                          parseFloat(
                            item.product.salePrice || item.product.price
                          )
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
              >
                {isPlacingOrder && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADD ADDRESS DIALOG */}
      <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <form action={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={addressForm.name}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  required
                  maxLength={10}
                  value={addressForm.mobile}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, mobile: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pincode">Pincode</Label>
                <div className="flex gap-2">
                  <Input
                    id="pincode"
                    name="pincode"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handlePincodeLookup}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Type</Label>
                <Select name="label" defaultValue="Home">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  required
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Select
                  name="state"
                  value={addressForm.state}
                  onValueChange={(val) =>
                    setAddressForm({ ...addressForm, state: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">
                Address (Flat, House no., Building, Company)
              </Label>
              <Input
                id="address"
                name="address"
                required
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, address: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                name="landmark"
                value={addressForm.landmark}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, landmark: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="altPhone">Alt Phone</Label>
              <Input
                id="altPhone"
                name="altPhone"
                value={addressForm.altPhone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, altPhone: e.target.value })
                }
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsAddingAddress(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Address
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
