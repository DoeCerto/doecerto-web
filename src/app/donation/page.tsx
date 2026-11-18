import { Suspense } from "react";
import { cookies } from "next/headers";
import DonationClient from "./DonationClient";
import { DonorService, type DonorProfileData } from "@/services/donor.service";
import type { OngPublicProfile } from "@/services/ongs-profile.service";
import { WishlistService, type WishlistItem } from "@/services/wishlist.service";
import { decodeJwtRole, ssrFetchJson, ssrFetchPublicOngProfile } from "@/utils/ssrFetch";

export const dynamic = "force-dynamic";

export default async function DonationPage({
  searchParams,
}: {
  searchParams?: Promise<{ ongId?: string; ong?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const ongIdRaw = resolvedParams?.ongId;
  const parsedOngId = ongIdRaw ? Number(ongIdRaw) : NaN;
  const initialOngId = Number.isFinite(parsedOngId) && parsedOngId > 0 ? parsedOngId : null;
  const initialOngName = resolvedParams?.ong;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const roleCookie = cookieStore.get("user_role")?.value?.toLowerCase();
  const resolvedRole = roleCookie || decodeJwtRole(accessToken);
  const canLoadDonorProfile = Boolean(accessToken && resolvedRole === "donor");

  let initialItems: WishlistItem[] = [];
  let initialOngData: OngPublicProfile | null = null;
  let initialUserProfile: DonorProfileData | null = null;
  let hasServerData = false;

  if (initialOngId) {
    const [wishlistRes, ongPublicProfile, donorProfileRes] = await Promise.all([
      ssrFetchJson<unknown>(`/ongs/${initialOngId}/wishlist-items`),
      ssrFetchPublicOngProfile(initialOngId),
      canLoadDonorProfile
        ? ssrFetchJson<Record<string, unknown>>("/donors/me/profile", accessToken)
        : Promise.resolve({ status: 0, data: null }),
    ]);

    initialItems = WishlistService.parseItems(wishlistRes.data);
    initialOngData = ongPublicProfile;

    if (donorProfileRes.status === 200) {
      if (donorProfileRes.data) {
        initialUserProfile = {
          ...DonorService._mapProfileData(donorProfileRes.data),
          isNewProfile: false,
        };
      } else {
        const userRes = await ssrFetchJson<{ name?: string; email?: string; cpf?: string }>(
          "/users/me",
          accessToken
        );
        initialUserProfile = {
          name: userRes.data?.name || "",
          email: userRes.data?.email || "",
          cpf: userRes.data?.cpf || "",
          phone: "",
          avatarUrl: null,
          description: "",
          isNewProfile: true,
        };
      }
    }

    hasServerData = Boolean(initialOngData || wishlistRes.status === 200);
  }

  return (
    <Suspense fallback={null}>
      <DonationClient
        initialOngId={initialOngId}
        initialOngName={initialOngName}
        initialItems={initialItems}
        initialOngData={initialOngData}
        initialUserProfile={initialUserProfile}
        hasServerData={hasServerData}
      />
    </Suspense>
  );
}
