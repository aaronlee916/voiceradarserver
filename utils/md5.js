import crypto from 'crypto'

export function encryptPassword(password) {
  return crypto
    .createHash("md5")
    .update("VoiceRadar" + password)
    .digest("base64");
}
