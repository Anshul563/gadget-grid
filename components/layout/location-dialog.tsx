"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Check, Loader2, Crosshair, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAddress, selectAddress, getUserAddresses } from "@/app/actions/address";
import { toast } from "sonner"; // Assuming you have sonner/toast installed

// List of Indian States for Dropdown
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

type Address = {
  id: number;
  label: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  mobile: string;
  isSelected: boolean | null;
};

export function LocationDialog({ currentCity }: { currentCity?: string }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "add">("list");
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  // Form States for autofill
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    pincode: "",
    address: ""
  });

  // Fetch addresses on open
  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open]);

  const loadAddresses = async () => {
    const data = await getUserAddresses();
    // @ts-ignore - Ignore type mismatch if schema update hasn't propagated to types yet
    setAddressList(data);
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    await selectAddress(id);
    await loadAddresses();
    setLoading(false);
    setOpen(false);
  };

  // --- FEATURE 1: AUTO FILL FROM PINCODE ---
  const handlePincodeLookup = async () => {
    if (formData.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit Pincode");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        const details = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: details.District,
          state: details.State
        }));
        toast.success("City & State detected!");
      } else {
        toast.error("Invalid Pincode");
      }
    } catch (e) {
      toast.error("Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  // --- FEATURE 2: USE CURRENT LOCATION ---
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap Nominatim API (Free)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          
          if (data && data.address) {
            setFormData({
              address: `${data.address.road || ''} ${data.address.suburb || ''}`.trim(),
              city: data.address.city || data.address.state_district || "",
              state: data.address.state || "",
              pincode: data.address.postcode || ""
            });
            toast.success("Location detected successfully");
          }
        } catch (error) {
          toast.error("Could not fetch address details");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        toast.error("Permission denied or location unavailable");
        setDetecting(false);
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
          <MapPin className="h-4 w-4 text-primary" />
          <div className="flex flex-col items-start text-sm">
            <span className="font-medium leading-none truncate max-w-[150px]">
              {currentCity || "Select Location"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {currentCity ? "Delivering to" : "Set address"}
            </span>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {view === "list" ? "Select Delivery Location" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>

        {view === "list" ? (
          <div className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {addressList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <MapPin className="h-8 w-8 mb-2 opacity-20" />
                  <p>No addresses saved.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addressList.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelect(addr.id)}
                      className={`relative flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-all hover:bg-accent ${
                        addr.isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-xs bg-muted px-2 py-0.5 rounded uppercase">{addr.label}</span>
                            <span className="font-semibold text-sm">{addr.name}</span>
                            <span className="text-xs text-muted-foreground">{addr.mobile}</span>
                        </div>
                        {addr.isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <span className="text-sm text-muted-foreground leading-snug">
                        {addr.address}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </span>
                      {loading && addr.isSelected && (
                         <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <Loader2 className="animate-spin h-5 w-5" />
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <Button className="w-full" onClick={() => setView("add")}>
              <Plus className="mr-2 h-4 w-4" /> Add New Address
            </Button>
          </div>
        ) : (
          <form
            action={async (formData) => {
              await addAddress(formData);
              await loadAddresses();
              setView("list");
              setFormData({ city: "", state: "", pincode: "", address: "" }); // Reset
            }}
            className="space-y-4"
          >
            {/* Detect Location Button */}
            <Button 
                type="button" 
                variant="secondary" 
                className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100"
                onClick={handleGeolocation}
                disabled={detecting}
            >
                {detecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crosshair className="mr-2 h-4 w-4" />}
                Use Current Location
            </Button>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="name">Full Name</Label>
                 <Input id="name" name="name" placeholder="John Doe" required />
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="mobile">Mobile Number</Label>
                 <Input id="mobile" name="mobile" placeholder="9876543210" required maxLength={10} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label htmlFor="altPhone">Alt. Phone (Optional)</Label>
                 <Input id="altPhone" name="altPhone" placeholder="Optional" />
               </div>
               <div className="grid gap-2">
                 <Label htmlFor="label">Address Type</Label>
                 <Select name="label" defaultValue="Home">
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                 </Select>
               </div>
            </div>

            {/* Pincode with Auto-Detect */}
            <div className="grid gap-2 relative">
              <Label htmlFor="pincode">Pincode</Label>
              <div className="flex gap-2">
                <Input 
                    id="pincode" 
                    name="pincode" 
                    placeholder="110001" 
                    required 
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                />
                <Button type="button" size="icon" variant="outline" onClick={handlePincodeLookup} title="Check Pincode">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input 
                    id="city" 
                    name="city" 
                    placeholder="Auto-filled" 
                    required 
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Select name="state" value={formData.state} onValueChange={(val) => setFormData(prev => ({...prev, state: val}))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {INDIAN_STATES.map((st) => (
                            <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Flat, House no., Building, Company</Label>
              <Input 
                id="address" 
                name="address" 
                placeholder="Sector 12, Main Street" 
                required 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input id="landmark" name="landmark" placeholder="Near Metro Station" />
            </div>

            <div className="flex gap-2 mt-4 pt-2 border-t">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Address
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}