import OngPublicProfileClient from "@/components/specific/Ong-Public-Profile/OngPublicProfileClient";

export default async function OngPublicProfilePage(props: {
  searchParams: Promise<{ id?: string }> | { id?: string }
}) {

  const searchParams = await props.searchParams;
  const id = searchParams?.id;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-400">ONG não encontrada.</h1>
      </div>
    );
  }

  const ongId = parseInt(Array.isArray(id) ? id[0] : id, 10);
  let initialData = null;

  try {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
    apiUrl = apiUrl.replace("localhost", "127.0.0.1");

    // Recriamos o formatador de URL de imagem do seu service para usar no servidor
    const formatImageUrl = (path: string | null) => {
      if (!path) return "";
      if (path.startsWith('http')) return path;
      const cleanPath = path.replace(/\\/g, "/");
      return `${apiUrl}${cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`}`;
    };

    // A MÁGICA: O Servidor agora bate nas 3 rotas exatamente como o seu Service faz!
    const [resBase, resProfile, resReviews] = await Promise.all([
      fetch(`${apiUrl}/ongs/${ongId}`, { cache: "no-store" }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch(`${apiUrl}/ongs/${ongId}/profile`, { cache: "no-store" }).then(r => r.ok ? r.json() : {}).catch(() => ({})),
      fetch(`${apiUrl}/ongs/${ongId}/ratings`, { cache: "no-store" }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]);
    const base: Record<string, any> = resBase || {};
    const profile: Record<string, any> = resProfile || {};

    // Normalização da descrição
    const descriptionText = profile.description || profile.about || profile.bio || "ONG verificada.";

    // Normalização do Website
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