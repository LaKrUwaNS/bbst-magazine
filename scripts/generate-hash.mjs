import crypto from "crypto";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

const password = process.argv[2] || "Editor@BBST2025!";
const hash = hashPassword(password);

console.log("=== BBST Magazine Editor Password Hash Generator ===");
console.log(`Password: ${password}`);
console.log(`EDITOR_PASSWORD_HASH="${hash}"`);
console.log("Add this to your .env file along with EDITOR_USERNAME and AUTH_SECRET.");
