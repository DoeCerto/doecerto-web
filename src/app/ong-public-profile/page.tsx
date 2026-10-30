import Link from "next/link";
import OngPublicProfileClient from "@/components/specific/Ong-Public-Profile/OngPublicProfileClient";

export default async function OngPublicProfilePage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const id = searchParams?.id;

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-700">ONG não encontrada.</h1>
        <Link href="/home" className="text-[#6B39A7] font-bold underline">
          Voltar para o Início
        </Link>
      </div>
    );
  }

  const ongId = parseInt(Array.isArray(id) ? id[0] : id, 10);
  if (isNaN(ongId) || ongId <= 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-700">ONG não encontrada.</h1>
        <Link href="/home" className="text-[#6B39A7] font-bold underline">
          Voltar para o Início
        </Link>
      </div>
    );
  }

  let initialData = null;

  try {
    const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const internalApiUrl = (process.env.INTERNAL_API_URL || publicApiUrl).replace("localhost", "127.0.0.1");

    const formatImageUrl = (path: string | null) => {
      if (!path) return "";
      if (path.startsWith('http')) return path;
      const cleanPath = path.replace(/\\/g, "/");
      return `${publicApiUrl}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
    };

    const [resBase, resProfile, resReviews] = await Promise.all([
      fetch(`${internalApiUrl}/ongs/${ongId}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${internalApiUrl}/ongs/${ongId}/profile`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${internalApiUrl}/ongs/${ongId}/ratings`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]);

    // UX-03: Se nem os dados base nem o perfil público retornarem uma ONG válida, exibe estado 404 real
    if ((!resBase || (!resBase.id && !resBase.name && !resBase.cnpj)) && (!resProfile || (!resProfile.id && !resProfile.name))) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-700">Instituição não encontrada.</h1>
          <p className="text-slate-500 max-w-md">
            A organização que você procura não foi localizada ou não está mais disponível no catálogo.
          </p>
          <Link href="/home" className="px-6 py-3 bg-[#6B39A7] text-white rounded-xl font-bold hover:bg-[#582d8c] transition-colors">
            Voltar para o Início
          </Link>
        </div>
      );
    }

    const base: Record<string, any> = resBase || {};
    const profile: Record<string, any> = resProfile || {};

    const descriptionText = profile.description || profile.about || profile.bio || "ONG verificada.";

    let websiteLink = "Não informado";
    const urls = profile.websiteUrls || profile.website || [];
    if (Array.isArray(urls) && urls.length > 0) {
      websiteLink = urls[0];
    } else if (typeof urls === 'string') {
      websiteLink = urls;
    }

    const formattedOng = {
      id: base.id || profile.id || ongId,
      name: profile.name || base.name || "ONG sem nome",
      cnpj: base.cnpj || "CNPJ não informado",
      banner: formatImageUrl(profile.bannerUrl || base.bannerUrl),
      logo: formatImageUrl(profile.avatarUrl || base.avatarUrl),
      description: descriptionText,
      phone: profile.contactNumber || base.contactNumber || "Não informado",
      instagram: websiteLink,
      address: profile.address?.city ? `${profile.address.city}, ${profile.address.state}` : "Endereço não informado",
      yearsOfOperation: profile.yearsOfOperation || 0,
      rating: Number(profile.rating?.average || 0),
      numberOfRatings: profile.rating?.count || 0,
      categories: (profile.categories || []).map((c: any) => typeof c === 'string' ? c : c.name),
      donations: profile.receivedDonations || 0,
      distance: base.distance || "—",
      canReview: profile.canReview ?? false,
    };

    initialData = {
      ong: formattedOng,
      reviews: Array.isArray(resReviews) ? resReviews : []
    };

  } catch (error) {
    console.error("Erro ao pré-carregar ONG no servidor:", error);
  }

  return <OngPublicProfileClient ongId={ongId} initialData={initialData} />;
}
