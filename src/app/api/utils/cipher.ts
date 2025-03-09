import { createCipheriv, createDecipheriv } from "crypto";

export interface IEncryptCipherIVOption {
  data: string;
}

export interface IDecryptCipherIVOption {
  hashData: string;
}

const ALGORITHM = "aes-256-cbc";

/**
 * ### Example:
 *
 * // WITH ENVIRONMENT
 *
 * ``` javascript
 * await encrypt({
 *  data: 'abcdef'
 * })
 *```
 *
 * // WITHOUT ENVIRONMENT
 *
 * ``` javascript
 * await encrypt({
 *  data: 'abcdef'
 *  cipherKey: '32 characters'
 *  encryptionIV: '16 characters'
 * })
 *
 * return string
 * ```
 */

export function encrypt({ data }: IEncryptCipherIVOption): string {
  const cipherKey = process.env.CIPHER_KEY;
  const encryptionIV = process.env.CIPHER_ENCRYPTION_IV;
  if (!cipherKey || !encryptionIV) {
    throw new Error("Missing encryption key or cipher key");
  }
  const cipher = createCipheriv(
    ALGORITHM,
    Buffer.from(cipherKey, "hex"),
    Buffer.from(encryptionIV, "hex")
  );

  const encryptedData = Buffer.from(
    cipher.update(data, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");

  return encryptedData;
}

/**
 * ### Example:
 *
 * // WITH ENVIRONMENT
 *
 * ``` javascript
 * await decrypt({
 *  hashData: 'abcdef'
 * })
 *```
 *
 * // WITHOUT ENVIRONMENT
 *
 * ``` javascript
 * await decrypt({
 *  hashData: 'abcdef'
 *  cipherKey: '32 characters'
 *  encryptionIV: '16 characters'
 * })
 *
 * return string
 * ```
 */
export function decrypt({ hashData }: IDecryptCipherIVOption): string {
  const cipherKey = process.env.CIPHER_KEY;
  const encryptionIV = process.env.CIPHER_ENCRYPTION_IV;
  if (!cipherKey || !encryptionIV) {
    throw new Error("Missing encryption key or cipher key");
  }

  const buff = Buffer.from(hashData, "base64");
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(cipherKey, "hex"),
    Buffer.from(encryptionIV, "hex")
  );
  const decryptedData = Buffer.from(
    decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8")
  );

  return decryptedData.toString("utf8");
}
