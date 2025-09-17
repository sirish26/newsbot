import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_KEY,
});

export async function upsert(points) {
  return await client.upsert(
    process.env.QDRANT_COLLECTION || "news",
    {
      wait: true,
      points,
    }
  );
}

export async function search(vector, top = 5) {
  const res = await client.search(
    process.env.QDRANT_COLLECTION || "news",
    {
      vector,
      limit: top,
      with_payload: true,
    }
  );
  return res;
}

export async function create() {
  try {
    await client.recreateCollection(
      process.env.QDRANT_COLLECTION || "news",
      {
        vectors: { size: 768, distance: "Cosine" },
      }
    );
  } catch (e) {
    console.warn("create collection err", e.message);
  }
}
