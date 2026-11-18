import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OngDashboard, { type OngReviewRecord } from "@/components/specific/OngDashboard/ong-dashboard";
import {
  OngsProfileService,
  type OngAsaasKycSummary,
  type OngMyProfile,
} from "@/services/ongs-profile.service";
import { DonationService, type DonationService as DonationRecord } from "@/services/donations.service";
import type { BankAccountData } from "@/services/bank-account.service";
import { decodeJwtRole, ssrFetchJson } from "@/utils/ssrFetch";

export const dynamic = "force-dynamic";

export default async function OngDashboardPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const roleCookie = cookieStore.get("user_role")?.value?.toLowerCase();

  if (!accessToken && !refreshToken) {
    redirect("/login");
  }

  const resolvedRole = roleCookie || decodeJwtRole(accessToken);
  if (resolvedRole === "donor") {
    redirect("/home");
  }
  if (resolvedRole && resolvedRole !== "ong" && resolvedRole !== "admin") {
    redirect("/login");
  }

  let initialOng: OngMyProfile | null = null;
  let initialReviews: OngReviewRecord[] = [];
  let initialDonations: DonationRecord[] = [];
  let initialBankAccount: BankAccountData | null = null;
  let initialKycSummary: OngAsaasKycSummary | null = null;

  if (accessToken) {
    const [profileRes, donationsRes, kycRes, bankRes] = await Promise.all([
      ssrFetchJson<Record<string, unknown>>("/ongs/me/profile", accessToken),
      ssrFetchJson<unknown>("/donations/me/received", accessToken),
      ssrFetchJson<OngAsaasKycSummary>("/ongs/me/asaas-status", accessToken),
      ssrFetchJson<BankAccountData | BankAccountData[]>("/ongs/bank-account/me", accessToken),
    ]);

    if ((profileRes.status === 401 || profileRes.status === 403) && !refreshToken) {
      redirect("/login");
    }

    if (profileRes.data) {
      initialOng = OngsProfileService.mapMyProfile(profileRes.data);
      initialDonations = DonationService.mapReceivedDonations(donationsRes.data);
      initialKycSummary = kycRes.data ?? null;
      initialBankAccount = Array.isArray(bankRes.data)
        ? (bankRes.data[0] ?? null)
        : (bankRes.data ?? null);

      if (initialOng?.id) {
        const ratingsRes = await ssrFetchJson<
          OngReviewRecord[] | { data?: OngReviewRecord[] }
        >(`/ongs/${initialOng.id}/ratings`, accessToken);
        if (Array.isArray(ratingsRes.data)) {
          initialReviews = ratingsRes.data;
        } else if (Array.isArray(ratingsRes.data?.data)) {
          initialReviews = ratingsRes.data.data;
        }
      }
    }
  }

  return (
    <OngDashboard
      ong={initialOng}
      initialReviews={initialReviews}
      initialDonations={initialDonations}
      initialBankAccount={initialBankAccount}
      initialKycSummary={initialKycSummary}
      hasServerData={Boolean(initialOng)}
    />
  );
}
