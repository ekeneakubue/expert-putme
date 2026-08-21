import { NextResponse } from "next/server";
import {
  ENROLLMENT_COOKIE,
  getCandidate,
  getMockEnrollment,
  setMockEnrollment,
} from "@/lib/candidate";
import { MOCK_FEE_NAIRA } from "@/lib/mock";
import { nairaToKobo, verifyPaystackPayment } from "@/lib/paystack";

function candidateUrl(request: Request, payment: string) {
  const url = new URL("/candidate", request.url);
  url.searchParams.set("payment", payment);
  return url;
}

export async function GET(request: Request) {
  const candidate = await getCandidate();
  if (!candidate) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(candidateUrl(request, "missing"));
  }

  const enrollment = await getMockEnrollment();
  if (!enrollment?.subjectIds?.length) {
    return NextResponse.redirect(candidateUrl(request, "missing-enrollment"));
  }

  let payment;
  try {
    payment = await verifyPaystackPayment(reference);
  } catch (error) {
    console.error("Paystack verify failed:", error);
    return NextResponse.redirect(candidateUrl(request, "failed"));
  }

  if (payment.status !== "success") {
    return NextResponse.redirect(candidateUrl(request, "failed"));
  }

  const expectedKobo = nairaToKobo(MOCK_FEE_NAIRA);
  if (payment.amount < expectedKobo) {
    return NextResponse.redirect(candidateUrl(request, "amount-mismatch"));
  }

  const metadata = payment.metadata ?? {};
  const metaSubjects = Array.isArray(metadata.subjectIds)
    ? (metadata.subjectIds as string[])
    : Array.isArray(metadata.subjectCodes)
      ? (metadata.subjectCodes as string[])
      : enrollment.subjectIds;

  const subjectIds =
    metaSubjects.length === 4 ? metaSubjects : enrollment.subjectIds;

  if (subjectIds.length !== 4) {
    return NextResponse.redirect(candidateUrl(request, "missing-enrollment"));
  }

  const paidEnrollment = {
    subjectIds,
    paid: true,
    paidAt: payment.paid_at ?? new Date().toISOString(),
    amount: MOCK_FEE_NAIRA,
    reference,
    attemptsUsed: 0,
    attempts: enrollment.attempts ?? [],
  };

  // Persist via helper (cookie + database), then ensure Set-Cookie on redirect.
  await setMockEnrollment(paidEnrollment, candidate.jambReg);

  const response = NextResponse.redirect(candidateUrl(request, "success"));
  response.cookies.set(ENROLLMENT_COOKIE, JSON.stringify(paidEnrollment), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
