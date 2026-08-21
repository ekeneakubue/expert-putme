import { MOCK_FEE_NAIRA } from "@/lib/mock";

const PAYSTACK_BASE = "https://api.paystack.co";

function normalizePaystackKey(value: string | undefined) {
  if (!value) return "";

  let key = value.trim().replace(/^["']|["']$/g, "");
  const match = key.match(/sk_(?:test|live)_[a-f0-9]+/i);
  if (match) return match[0];

  const publicMatch = key.match(/pk_(?:test|live)_[a-f0-9]+/i);
  if (publicMatch) return publicMatch[0];

  return key;
}

function getSecretKey() {
  const key = normalizePaystackKey(process.env.PAYSTACK_SECRET_KEY);
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }
  if (!key.startsWith("sk_")) {
    throw new Error("PAYSTACK_SECRET_KEY looks invalid. Use sk_test_... or sk_live_...");
  }
  return key;
}

export function getPaystackPublicKey() {
  return normalizePaystackKey(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);
}

export function nairaToKobo(amountNaira: number) {
  return Math.round(amountNaira * 100);
}

type InitializeInput = {
  email: string;
  amountNaira?: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    metadata?: Record<string, unknown>;
  };
};

export async function initializePaystackPayment(input: InitializeInput) {
  const amount = nairaToKobo(input.amountNaira ?? MOCK_FEE_NAIRA);

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const payload = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new Error(payload.message || "Could not start Paystack checkout.");
  }

  return payload.data;
}

export async function verifyPaystackPayment(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message || "Could not verify Paystack payment.");
  }

  return payload.data;
}
