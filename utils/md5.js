import crypto, { createHash } from "crypto";

export function encryptPassword(password) {
  return crypto
    .createHash("md5")
    .update("VoiceRadar" + password)
    .digest("base64");
}
export function verifyPassword(password, hash) {
  return (
    crypto
      .createHash("md5")
      .update("VoiceRadar" + password)
      .digest("base64") === hash
  );
}
