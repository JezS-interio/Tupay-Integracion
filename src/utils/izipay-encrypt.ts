// utils/izipay-encrypt.ts
// Utilidad para encriptar datos de tarjeta con la clave pública de Izipay en el frontend

/**
 * Encripta un string usando la clave pública de Izipay (RSA) y lo retorna en Base64
 * @param {string} value - Valor a encriptar
 * @param {string} publicKey - Clave pública PEM de Izipay
 * @returns {Promise<string>} - Valor encriptado en Base64
 */
export async function encryptWithIzipayPublicKey(value: string, publicKey: string): Promise<string> {
  try {
    // Limpiar el PEM: quitar encabezado, pie y espacios
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    let pem = publicKey.trim();
    if (pem.startsWith(pemHeader)) pem = pem.slice(pemHeader.length);
    if (pem.endsWith(pemFooter)) pem = pem.slice(0, pem.length - pemFooter.length);
    pem = pem.replace(/\r?\n/g, "").replace(/\s+/g, "");
    if (!pem || pem.length < 50) {
      throw new Error("Clave pública inválida o vacía");
    }
    const binaryDerString = atob(pem);
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
  } catch (err) {
    console.error("[Izipay Encrypt] Error encriptando:", err);
    throw err;
  }
    // Limpiar el PEM: quitar encabezado, pie, espacios y líneas vacías
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    let pem = publicKey.replace(/\r/g, "").replace(/\n/g, "\n").trim();
    if (pem.includes(pemHeader)) pem = pem.replace(pemHeader, "");
    if (pem.includes(pemFooter)) pem = pem.replace(pemFooter, "");
    pem = pem.split('\n').map(line => line.trim()).filter(line => !!line).join("");
    if (!pem || pem.length < 50) {
      throw new Error("Clave pública inválida o vacía");
    }
    // Validar base64
    if (!/^[A-Za-z0-9+/=]+$/.test(pem)) {
      throw new Error("Clave pública contiene caracteres inválidos");
    }
    const binaryDerString = atob(pem);
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
  } catch (err) {
    console.error("[Izipay Encrypt] Error encriptando:", err);
    throw err;
  }
}
