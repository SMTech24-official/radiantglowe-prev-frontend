/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface Metadata {
  landlordId?: string;
  propertyId?: string;
  tenantId?: string;
  packageId?: string;
  type?: string;
}

interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const useInitializePaystackTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeTransaction = async (
    email: string,
    price: number,
    metadata: Metadata
  ): Promise<InitializeTransactionResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
        },
        body: JSON.stringify({
          email,
          amount: parseFloat(price.toString()) * 100,
          currency: "NGN",
          metadata,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to initialize transaction");
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { initializeTransaction, loading, error };
};
