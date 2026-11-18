import PixClient from "./PixClient";
import type { OngPublicProfile } from "@/services/ongs-profile.service";
import { ssrFetchPublicOngProfile } from "@/utils/ssrFetch";

export const dynamic = "force-dynamic";

export default async function PixPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string; ongId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const rawId = resolvedParams?.id || resolvedParams?.ongId;
  const parsedId = rawId ? Number(rawId) : NaN;

  let initialOngData: OngPublicProfile | null = null;
  if (Number.isFinite(parsedId) && parsedId > 0) {
    initialOngData = await ssrFetchPublicOngProfile(parsedId).catch(() => null);
  }

  return <PixClient initialOngData={initialOngData} />;
}
