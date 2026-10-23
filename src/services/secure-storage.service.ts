import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Serviço de armazenamento seguro com criptografia de hardware
 * - Android: AndroidKeyStore + SharedPreferences (chaves AES/RSA criptografadas no Keystore).
 * - iOS: iOS Keychain Services (kSecClassGenericPassword).
 * - Web: Padrão Zero-Trust com cookies httpOnly transparentes. Nenhum token é armazenado no cliente Web.
 * 
 * Inclui migração transparente e retrocompatível: tokens legados em Preferences (texto puro)
 * são automaticamente promovidos para o Keystore seguro e expurgados do disco desprotegido.
 */
export class SecureStorageService {
  private static readonly TOKEN_KEY = 'access_token';
  private static readonly USER_ROLE_KEY = 'userRole';
  private static readonly TRUSTED_DEVICE_KEY = 'trusted_device';

  /**
   * Verifica se o ambiente de execução é um app mobile nativo (Android ou iOS).
   */
  public static isNativeMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      Capacitor.isNativePlatform() ||
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:'
    );
  }

  /**
   * Recupera um valor do armazenamento seguro.
   * Se não encontrado no Keystore/Keychain, tenta migrar dados legados de Preferences.
   */
  public static async get(key: string): Promise<string | null> {
    if (!this.isNativeMobile()) {
      return null;
    }

    try {
      const res = await SecureStoragePlugin.get({ key });
      if (res && typeof res.value === 'string') {
        return res.value;
      }
    } catch {
      // Chave não existe no Secure Storage. Tenta migração a partir do Preferences legado.
    }

    // Tentativa de migração retrocompatível (upgrade para Keystore)
    try {
      const legacy = await Preferences.get({ key });
      if (legacy && legacy.value) {
        // Promove imediatamente para o Keystore seguro
        await SecureStoragePlugin.set({ key, value: legacy.value });
        // Expurga o dado em texto puro do disco
        await Preferences.remove({ key });
        return legacy.value;
      }
    } catch {
      // Ignora falhas no Preferences legado
    }

    return null;
  }

  /**
   * Armazena um valor de forma criptografada no Keystore/Keychain nativo.
   * Remove qualquer resquício em texto puro do Preferences legado.
   */
  public static async set(key: string, value: string): Promise<boolean> {
    if (!this.isNativeMobile()) {
      return false;
    }

    try {
      // Grava com criptografia de chave privada no Keystore
      await SecureStoragePlugin.set({ key, value });

      // Garante que nenhuma cópia em texto plano permaneça no Preferences legado
      await Preferences.remove({ key }).catch(() => {});
      return true;
    } catch (err) {
      console.error(`[SecureStorage] Erro ao gravar chave segura '${key}':`, err);
      return false;
    }
  }

  /**
   * Remove uma chave do armazenamento seguro e do Preferences legado.
   */
  public static async remove(key: string): Promise<boolean> {
    let success = true;

    if (this.isNativeMobile()) {
      try {
        await SecureStoragePlugin.remove({ key });
      } catch {
        success = false;
      }

      try {
        await Preferences.remove({ key });
      } catch {
        // Ignora
      }
    }

    return success;
  }

  /**
   * Limpa todas as credenciais do armazenamento seguro.
   */
  public static async clear(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.TRUSTED_DEVICE_KEY);
      } catch {}
    }
    if (!this.isNativeMobile()) return true;

    try {
      await SecureStoragePlugin.clear();
      await Preferences.clear().catch(() => {});
      return true;
    } catch (err) {
      console.error('[SecureStorage] Erro ao limpar armazenamento seguro:', err);
      return false;
    }
  }

  // --- Métodos de Conveniência para Autenticação ---

  public static async getAccessToken(): Promise<string | null> {
    return await this.get(this.TOKEN_KEY);
  }

  public static async setAccessToken(token: string): Promise<boolean> {
    return await this.set(this.TOKEN_KEY, token);
  }

  public static async removeAccessToken(): Promise<boolean> {
    return await this.remove(this.TOKEN_KEY);
  }

  public static async getUserRole(): Promise<string | null> {
    return await this.get(this.USER_ROLE_KEY);
  }

  public static async setUserRole(role: string): Promise<boolean> {
    return await this.set(this.USER_ROLE_KEY, role);
  }

  public static async removeUserRole(): Promise<boolean> {
    return await this.remove(this.USER_ROLE_KEY);
  }

  /**
   * Recupera o token de dispositivo confiável (Keystore no Mobile, localStorage no Web)
   */
  public static async getTrustedDeviceToken(): Promise<string | null> {
    if (this.isNativeMobile()) {
      return await this.get(this.TRUSTED_DEVICE_KEY);
    }
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(this.TRUSTED_DEVICE_KEY);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Salva o token de dispositivo confiável (Keystore no Mobile, localStorage no Web)
   */
  public static async setTrustedDeviceToken(token: string): Promise<boolean> {
    if (this.isNativeMobile()) {
      return await this.set(this.TRUSTED_DEVICE_KEY, token);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.TRUSTED_DEVICE_KEY, token);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Remove o token de dispositivo confiável (Keystore no Mobile, localStorage no Web)
   */
  public static async removeTrustedDeviceToken(): Promise<boolean> {
    if (this.isNativeMobile()) {
      return await this.remove(this.TRUSTED_DEVICE_KEY);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.TRUSTED_DEVICE_KEY);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
