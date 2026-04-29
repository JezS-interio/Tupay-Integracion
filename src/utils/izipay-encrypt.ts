// utils/izipay-encrypt.ts
// Utilidad para encriptar datos de tarjeta con la clave pública de Izipay en el frontend

/**
 * Encripta un string usando la clave pública de Izipay (RSA) y lo retorna en Base64
 * @param {string} value - Valor a encriptar
 * @param {string} publicKey - Clave pública PEM de Izipay
 * @returns {Promise<string>} - Valor encriptado en Base64
 */
export async function encryptWithIzipayPublicKey(value: string, publicKey: string): Promise<string> {
  // Web Crypto API solo acepta claves en formato spki, así que convertimos el PEM
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const pemContents = publicKey.replace(pemHeader, "").replace(pemFooter, "").replace(/\s+/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }
  const cryptoKey = await window.crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    false,
    ["encrypt"]
  );
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    cryptoKey,
    new TextEncoder().encode(value)
  );
  // Convertir a Base64
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
