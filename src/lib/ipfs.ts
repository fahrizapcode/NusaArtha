// src/lib/ipfs.ts
// Pinata IPFS integration

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET_API_KEY;
const GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";

/**
 * Uploads a JSON object to IPFS via Pinata
 */
export async function uploadJSONToIPFS(jsonData: object, name?: string): Promise<string> {
  // If no Pinata credentials, return a deterministic mock CID
  if (!PINATA_JWT && !PINATA_API_KEY) {
    console.warn("[IPFS] No Pinata credentials. Using mock CID.");
    return `QmMock${Buffer.from(JSON.stringify(jsonData)).toString("base64").slice(0, 20)}`;
  }

  const body = JSON.stringify({
    pinataContent: jsonData,
    pinataMetadata: { name: name || `nusaartha-${Date.now()}` },
    pinataOptions: { cidVersion: 1 },
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (PINATA_JWT) {
    headers["Authorization"] = `Bearer ${PINATA_JWT}`;
  } else {
    headers["pinata_api_key"] = PINATA_API_KEY!;
    headers["pinata_secret_api_key"] = PINATA_SECRET!;
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[IPFS] Pinata error:", err);
    throw new Error(`Pinata upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.IpfsHash as string;
}

/**
 * Uploads a File/Blob to IPFS via Pinata
 */
export async function uploadToIPFS(file: File | Blob, fileName?: string): Promise<string> {
  if (!PINATA_JWT && !PINATA_API_KEY) {
    console.warn("[IPFS] No Pinata credentials. Using mock CID.");
    return `QmMockFile${Date.now()}`;
  }

  const formData = new FormData();
  formData.append("file", file, fileName || "upload");
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: fileName || `nusaartha-file-${Date.now()}` })
  );
  formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const headers: Record<string, string> = {};
  if (PINATA_JWT) {
    headers["Authorization"] = `Bearer ${PINATA_JWT}`;
  } else {
    headers["pinata_api_key"] = PINATA_API_KEY!;
    headers["pinata_secret_api_key"] = PINATA_SECRET!;
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[IPFS] Pinata file upload error:", err);
    throw new Error(`Pinata file upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.IpfsHash as string;
}

/**
 * Returns the public gateway URL for an IPFS CID
 */
export function getIPFSGatewayUrl(cid: string): string {
  if (!cid) return "";
  // Handle already-full URLs
  if (cid.startsWith("http")) return cid;
  return `${GATEWAY}/${cid}`;
}

/**
 * Fetches JSON content from IPFS
 */
export async function fetchFromIPFS<T = unknown>(cid: string): Promise<T | null> {
  try {
    const url = getIPFSGatewayUrl(cid);
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
