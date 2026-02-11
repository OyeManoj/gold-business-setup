// Encryption utilities for securing offline data
export class SecureStorage {
  /**
   * Gets or creates a random salt for a user, stored in localStorage.
   * This adds entropy beyond the 4-digit user ID to prevent brute-force key derivation.
   */
  private static getUserSalt(userId: string): string {
    const saltKey = `_enc_salt_${userId}`;
    let salt = localStorage.getItem(saltKey);
    if (!salt) {
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      salt = btoa(String.fromCharCode(...randomBytes));
      localStorage.setItem(saltKey, salt);
    }
    return salt;
  }

  private static async getEncryptionKey(userId: string): Promise<CryptoKey> {
    const salt = this.getUserSalt(userId);
    const keyData = new TextEncoder().encode(`${userId}_${salt}_secure_key_v2`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    return crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
  }

  static async encrypt(data: string, userId: string): Promise<string> {
    if (!userId) throw new Error('User ID required for encryption');
    
    const key = await this.getEncryptionKey(userId);
    const iv = this.generateIV();
    const encodedData: ArrayBuffer = new TextEncoder().encode(data).buffer as ArrayBuffer;

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as unknown as Uint8Array<ArrayBuffer> },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string, userId: string): Promise<string> {
    if (!userId) throw new Error('User ID required for decryption');
    
    try {
      const key = await this.getEncryptionKey(userId);
      const combined = new Uint8Array(
        Array.from(atob(encryptedData), c => c.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  static setSecureItem(key: string, value: any, userId: string): Promise<void> {
    if (!userId) return Promise.reject(new Error('User ID required'));
    
    const namespacedKey = `${userId}_${key}`;
    const dataStr = JSON.stringify(value);
    
    return this.encrypt(dataStr, userId).then(encrypted => {
      localStorage.setItem(namespacedKey, encrypted);
    });
  }

  static async getSecureItem<T>(key: string, userId: string): Promise<T | null> {
    if (!userId) return null;
    
    const namespacedKey = `${userId}_${key}`;
    const encrypted = localStorage.getItem(namespacedKey);
    
    if (!encrypted) return null;
    
    try {
      const decrypted = await this.decrypt(encrypted, userId);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch {
      // Clean up corrupted data
      localStorage.removeItem(namespacedKey);
      return null;
    }
  }

  static removeSecureItem(key: string, userId: string): void {
    if (!userId) return;
    const namespacedKey = `${userId}_${key}`;
    localStorage.removeItem(namespacedKey);
  }

  static clearUserData(userId: string): void {
    if (!userId) return;
    
    const keys = Object.keys(localStorage);
    const userPrefix = `${userId}_`;
    
    keys.forEach(key => {
      if (key.startsWith(userPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  static clearAllOfflineData(): void {
    const keys = Object.keys(localStorage);
    const secureKeys = keys.filter(key => 
      key.includes('_transactions_') || 
      key.includes('_business_') || 
      key.includes('_receipt_settings_') ||
      key.includes('_secure_')
    );
    
    secureKeys.forEach(key => localStorage.removeItem(key));
  }
}
