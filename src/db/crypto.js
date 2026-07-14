/**
 * crypto.js
 * AES-256-GCM field-level encryption/decryption helper.
 *
 * Each encrypted value is stored as a single string in the DB:
 *   iv:authTag:ciphertext   (all base64, colon-separated)
 *
 * A fresh random IV is generated per encryption call so the same
 * plaintext produces a different ciphertext every time — prevents
 * frequency analysis attacks.
 *
 * ENCRYPTION_KEY in .env must be exactly 64 hex characters (32 bytes).
 * Generate one with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const crypto = require("crypto");

const ALGORITHM  = "aes-256-gcm";
const IV_LENGTH  = 12;   // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16;   // 128-bit auth tag — GCM default

/* ── Load and validate the key once at startup ────────────────────────────── */
function loadKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    console.error(
      "   ENCRYPTION_KEY must be a 64-character hex string (32 bytes).\n" +
      "   Generate one: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
    process.exit(1);
  }
  return Buffer.from(hex, "hex");
}

const KEY = loadKey();

/* ── encrypt ─────────────────────────────────────────────────────────────────
   @param  {string|number|null} value
   @returns {string|null}   "iv:authTag:ciphertext"  or null if value is null
*/
function encrypt(value) {
  if (value === null || value === undefined) return null;

  const plaintext = String(value);
  const iv        = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv, {
    authTagLength: TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/* ── decrypt ─────────────────────────────────────────────────────────────────
   @param  {string|null} stored   "iv:authTag:ciphertext"
   @returns {string|null}
*/
function decrypt(stored) {
  if (!stored) return null;

  const parts = stored.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format — expected iv:authTag:ciphertext");
  }

  const [ivB64, tagB64, dataB64] = parts;
  const iv         = Buffer.from(ivB64,  "base64");
  const authTag    = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),     // throws if auth tag doesn't match (data tampered)
  ]);

  return decrypted.toString("utf8");
}

/* ── decryptRow ──────────────────────────────────────────────────────────────
   Decrypts the encrypted fields on a feedback_responses row in-place.
   Safe to call on any row — skips fields that are null.
*/
function decryptRow(row) {
  if (!row) return null;
  return {
    ...row,
    rating_technical:     row.rating_technical     ? Number(decrypt(row.rating_technical))     : null,
    rating_communication: row.rating_communication ? Number(decrypt(row.rating_communication)) : null,
    rating_reliability:   row.rating_reliability   ? Number(decrypt(row.rating_reliability))   : null,
    rating_collaboration: row.rating_collaboration ? Number(decrypt(row.rating_collaboration)) : null,
    rating_solving:       row.rating_solving       ? Number(decrypt(row.rating_solving))       : null,
    rating_overall:       Number(decrypt(row.rating_overall)),
    going_well:           decrypt(row.going_well),
    could_improve:        decrypt(row.could_improve),
  };
}

module.exports = { encrypt, decrypt, decryptRow };
