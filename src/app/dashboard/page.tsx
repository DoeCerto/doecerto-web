import { cookies } from "next/headers";
import DonorProfile from "@/components/specific/Donor-Profile/donor-profile";
import {
  DonorService,
  type Address,
  type DonationHistory,
  type DonorProfileData,
} from "@/services/donor.service";

export const dynamic = "force-dynamic";

interface JwtUserPayload {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

function parseJwtPayload(token: string): JwtUserPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
      return JSON.parse(jsonPayload) as JwtUserPayload;
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchJsonSafe(url: string, accessToken: string): Promise<{ ok: boolean; data: unknown }> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, data: null };
    const text = await res.text();
    return { ok: true, data: text ? JSON.parse(text) : null };
  } catch {
    return { ok: false, data: null };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab: "info" | "history" =
    resolvedParams?.tab === "history" ? "history" : "info";

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const fastName = cookieStore.get("user_name")?.value;
  const fastAvatar = cookieStore.get("user_avatar")?.value;

  const jwtPayload =
    (accessToken && parseJwtPayload(accessToken)) ||
    (refreshToken && parseJwtPayload(refreshToken)) ||
    null;

  let fallbackName = jwtPayload?.name || "";
  if (fastName) {
    try {
      fallbackName = decodeURIComponent(fastName);
    } catch {
      fallbackName = fastName;
    }
  }

  let rawFallbackAvatar: string | null = jwtPayload?.avatarUrl || null;
  if (fastAvatar) {
    try {
      rawFallbackAvatar = decodeURIComponent(fastAvatar);
    } catch {
      rawFallbackAvatar = fastAvatar;
    }
  }
  const fallbackAvatar = DonorService._formatImageUrl(rawFallbackAvatar);

  let initialProfile: DonorProfileData = {
    name: fallbackName,
    email: jwtPayload?.email || "",
    cpf: "",
    phone: "",
    avatarUrl: fallbackAvatar,
    description: "",
  };
  let initialHistory: DonationHistory[] = [];
  let initialAddress: Address | null = null;
  let hasServerProfile = false;

  if (accessToken) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const [profileRes, historyRes, addressRes] = await Promise.all([
      fetchJsonSafe(`${apiUrl}/donors/me/profile`, accessToken),
      fetchJsonSafe(`${apiUrl}/donations/me/sent`, accessToken),
      fetchJsonSafe(`${apiUrl}/addresses/me`, accessToken),
    ]);

    if (profileRes.ok) {
      hasServerProfile = true;
      if (profileRes.data) {
        const mapped = DonorService._mapProfileData(profileRes.data);
        initialProfile = {
          ...mapped,
          name: mapped.name || fallbackName,
          email: mapped.email || jwtPayload?.email || "",
          avatarUrl: mapped.avatarUrl || fallbackAvatar,
        };
      } else {
        const userRes = await fetchJsonSafe(`${apiUrl}/users/me`, accessToken);
        const userObj = (userRes.data || {}) as {
          name?: string;
          email?: string;
          cpf?: string;
        };
        initialProfile = {
          name: userObj.name || fallbackName,
          email: userObj.email || jwtPayload?.email || "",
          cpf: userObj.cpf || "",
          phone: "",
          avatarUrl: fallbackAvatar,
          description: "",
          isNewProfile: true,
        };
      }
    }

    if (historyRes.ok && historyRes.data) {
      initialHistory = DonorService._mapDonationHistory(historyRes.data);
    }

    if (addressRes.ok && addressRes.data) {
      initialAddress = addressRes.data as Address;
    }
  }

  return (
    <DonorProfile
      initialProfile={initialProfile}
      initialHistory={initialHistory}
      initialAddress={initialAddress}
      initialTab={initialTab}
      hasServerProfile={hasServerProfile}
    />
  );
}
