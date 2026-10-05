const crypto = require('crypto');

async function runTest() {
  console.log("🚀 Starting End-to-End Zero Knowledge Test...");
  const plaintext = "super secret password 123";
  console.log(`[1] Original Secret: "${plaintext}"`);

  // --- Step 1: Client Encrypts ---
  const keyBuffer = crypto.randomBytes(32); // 256-bit key
  const iv = crypto.randomBytes(12); // 96-bit IV
  
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  const encryptedText = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  // Custom packing for our node test: IV + EncryptedText + AuthTag
  const payloadBuffer = Buffer.concat([iv, encryptedText, authTag]);
  const encryptedPayloadBase64 = payloadBuffer.toString('base64');
  console.log(`[2] Encrypted locally. Payload size: ${encryptedPayloadBase64.length} chars`);

  // --- Step 2: POST to Backend ---
  console.log("[3] Sending encrypted payload to server...");
  let res = await fetch('http://localhost:3000/api/secrets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encrypted_payload: encryptedPayloadBase64, expires_in_minutes: 60 })
  });
  const createData = await res.json();
  const token = createData.token;
  console.log(`[4] Server generated token: ${token}`);

  // --- Step 3: First Consumption (Valid) ---
  console.log("\n--- RECIPIENT OPENS LINK ---");
  console.log(`[5] Requesting to consume secret for token: ${token}`);
  res = await fetch(`http://localhost:3000/api/public/secrets/${token}/consume`, { method: 'POST' });
  if (!res.ok) throw new Error("First consumption failed!");
  
  const consumeData = await res.json();
  console.log(`[6] Server returned encrypted payload successfully.`);

  // --- Step 4: Client Decrypts ---
  const payloadIn = Buffer.from(consumeData.encrypted_payload, 'base64');
  const ivIn = payloadIn.subarray(0, 12);
  const encryptedIn = payloadIn.subarray(12, payloadIn.length - 16);
  const authTagIn = payloadIn.subarray(payloadIn.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivIn);
  decipher.setAuthTag(authTagIn);
  const decryptedText = Buffer.concat([decipher.update(encryptedIn), decipher.final()]).toString('utf8');
  console.log(`[7] Decrypted locally: "${decryptedText}"`);
  
  if (decryptedText === plaintext) {
    console.log("✅ Decryption match successful!");
  }

  // --- Step 5: Second Consumption (Should Fail) ---
  console.log("\n--- ATTACKER / SECOND ATTEMPT ---");
  console.log("[8] Attempting to consume the same secret again...");
  res = await fetch(`http://localhost:3000/api/public/secrets/${token}/consume`, { method: 'POST' });
  if (res.status === 404) {
    console.log("✅ Second request correctly rejected by the server (Atomic Consumption working!)");
  } else {
    throw new Error(`Second request failed to be rejected. Status: ${res.status}`);
  }

  console.log("\n🎉 E2E Test Passed Successfully!");
}

runTest().catch(console.error);
