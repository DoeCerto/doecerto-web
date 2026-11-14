import { ongs } from "@/data/ongs";
import DonateClient from "./DonateClient";

// Esta função resolve o erro do build e cria as rotas para o APK
export async function generateStaticParams() {
  return ongs.map((ong) => ({
    id: ong.id.toString(),
  }));
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DonateClient id={id} />;
}
