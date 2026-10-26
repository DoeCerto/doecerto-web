import { api } from "@/services/api";

export interface LgpdDeleteAccountDTO {
  currentPassword: string;
  confirmationPhrase: string;
  twoFactorCode?: string;
}

export interface LgpdDeleteResponse {
  success: boolean;
  message: string;
  anonymizedAt: string;
}

export const LgpdService = {
  /**
   * Exclui e anonimiza permanentemente a conta e dados pessoais do usuário autenticado (LGPD Art. 18, VI).
   */
  async deleteAccount(dto: LgpdDeleteAccountDTO): Promise<LgpdDeleteResponse> {
    const res = await api<LgpdDeleteResponse>("/users/me/lgpd/account", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: dto.currentPassword,
        confirmationPhrase: dto.confirmationPhrase.trim(),
        twoFactorCode: dto.twoFactorCode?.trim() || undefined,
      }),
    });
    return res.data;
  },

  /**
   * Exporta os dados pessoais estruturados em JSON para portabilidade (LGPD Art. 18, II e V).
   */
  async exportUserData(): Promise<any> {
    const res = await api<any>("/users/me/lgpd/export", {
      method: "GET",
    });
    return res.data;
  },
};

/**
 * Utilitário para realizar o download direto de um arquivo JSON no navegador do usuário.
 */
export function downloadJsonFile(data: any, filename = "meus-dados-doecerto-lgpd.json"): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
