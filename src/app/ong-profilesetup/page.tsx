import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OngProfileSetup from "@/components/specific/Ong-ProfileSetup/ong-profilesetup";
import {
  OngsProfileService,
  type OngMyProfile,
  type OngProfileCategory,
} from "@/services/ongs-profile.service";
import { WishlistService, type WishlistItem } from "@/services/wishlist.service";
import { decodeJwtRole, ssrFetchJson } from "@/utils/ssrFetch";

export const dynamic = "force-dynamic";

function extractCategories(payload: unknown): OngProfileCategory[] {
  if (Array.isArray(payload)) return payload as OngProfileCategory[];
  if (payload && typeof payload === "object") {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as OngProfileCategory[];
  }
  return [];
}

export default async function OngProfileSetupPage() {
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

  let initialProfile: OngMyProfile | null = null;
  let initialCategories: OngProfileCategory[] = [];
  let initialItems: WishlistItem[] = [];

  if (accessToken) {
    const [categoriesRes, profileRes] = await Promise.all([
      ssrFetchJson<unknown>("/categories?take=100", accessToken),
      ssrFetchJson<Record<string, unknown>>("/ongs/me/profile", accessToken),
    ]);

    if ((profileRes.status === 401 || profileRes.status === 403) && !refreshToken) {
      redirect("/login");
    }

    initialCategories = extractCategories(categoriesRes.data);

    if (profileRes.data) {
      initialProfile = OngsProfileService.mapMyProfile(profileRes.data);
      if (initialProfile?.id) {
        const wishlistRes = await ssrFetchJson<unknown>(
          `/ongs/${initialProfile.id}/wishlist-items`,
          accessToken
        );
        initialItems = WishlistService.parseItems(wishlistRes.data);
      }
    }
  }

  return (
    <div>
      <OngProfileSetup
        initialProfile={initialProfile}
        initialCategories={initialCategories}
        initialItems={initialItems}
        hasServerData={Boolean(initialProfile)}
      />
    </div>
  );
}
