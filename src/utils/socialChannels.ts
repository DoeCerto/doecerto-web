/**
 * Normaliza e formata canais de contato e redes sociais das ONGs.
 * Garante apenas URLs http/https válidas antes de renderizar links clicáveis.
 */

export function buildWebsiteHref(raw?: string | null): string | undefined {
  const value = (raw || "").trim();
  if (!value || value === "Não informado") return undefined;
  if (/^(javascript|data|vbscript):/i.test(value)) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function formatWebsiteLabel(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function buildInstagramHref(raw?: string | null): string | undefined {
  const value = (raw || "").trim();
  if (!value || value === "Não informado") return undefined;
  if (/^(javascript|data|vbscript):/i.test(value)) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(www\.)?instagram\.com\//i.test(value)) return `https://${value}`;
  const cleanHandle = value.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  return cleanHandle ? `https://instagram.com/${cleanHandle}` : undefined;
}

export function formatInstagramLabel(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/instagram\.com\//i.test(value)) {
    const match = value.match(/instagram\.com\/([^/?#]+)/i);
    if (match?.[1]) return `@${match[1].replace(/^@+/, "")}`;
    return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  }
  const cleanHandle = value.replace(/^@+/, "");
  return cleanHandle ? `@${cleanHandle}` : "";
}

export function buildFacebookHref(raw?: string | null): string | undefined {
  const value = (raw || "").trim();
  if (!value || value === "Não informado") return undefined;
  if (/^(javascript|data|vbscript):/i.test(value)) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(www\.)?(facebook|fb)\.com\//i.test(value)) return `https://${value}`;
  const cleanSlug = value.replace(/^@+/, "").replace(/^\/+|\/+$/g, "");
  return cleanSlug ? `https://facebook.com/${cleanSlug}` : undefined;
}

export function formatFacebookLabel(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/(facebook|fb)\.com\//i.test(value)) {
    return value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, "");
  }
  return value.startsWith("facebook.com/") ? value : `facebook.com/${value.replace(/^@+/, "")}`;
}

export function buildWhatsappHref(raw?: string | null): string | undefined {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length < 10) return undefined;
  const normalized =
    digits.startsWith("55") && digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${normalized}`;
}

export function formatWhatsappLabel(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  const local =
    digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;

  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return value;
}

