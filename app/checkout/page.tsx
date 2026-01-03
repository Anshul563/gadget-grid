import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { CheckoutClient } from "./checkout-client";
import { getUserAddresses, getActiveAddress } from "@/app/actions/address";
import { getCart } from "@/app/actions/cart";

export const metadata = {
  title: "Checkout - GadgetGrid",
};

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/"); // Or to login
  }

  const [addresses, activeAddress, cartItems] = await Promise.all([
    getUserAddresses(),
    getActiveAddress(),
    getCart(),
  ]);

  // @ts-ignore
  if (cartItems.length === 0) {
    redirect("/products");
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      <CheckoutClient
        // @ts-ignore
        initialAddresses={addresses}
        activeAddressId={activeAddress?.id || null}
        // @ts-ignore
        cartItems={cartItems}
      />
    </div>
  );
}
