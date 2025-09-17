import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const JINA_URL = process.env.JINA_URL;
const KEY = process.env.JINA_KEY;

export default async function embed(texts) {
  const resp = await fetch(JINA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v2-base-en',
      input: texts,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error('jina embed failed: ' + resp.status + ' ' + err);
  }

  const j = await resp.json();
  return j.data.map(d => d.embedding);
}
