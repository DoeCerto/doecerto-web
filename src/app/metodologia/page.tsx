import MetodologiaClient from "./MetodologiaClient";
import { PublicImpactMetrics } from "@/services/metrics.service";

export const dynamic = "force-dynamic";

export default async function MetodologiaPageServer() {
  let initialMetrics: PublicImpactMetrics = {
    totalLivesImpacted: 0,
    totalDonations: 0,
    totalMonetaryRaised: 0,
    totalVerifiedOngs: 0,
    totalDonors: 0,
    breakdown: [],
  };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${apiUrl}/metrics/public`, { cache: "no-store" });
    if (res.ok) {
      initialMetrics = await res.json();
    }
  } catch (error) {
    console.error("Erro ao buscar métricas públicas no SSR:", error);
  }

  return <MetodologiaClient initialMetrics={initialMetrics} />;
}
