import fs from 'fs';
import { randomUUID } from 'crypto';
import embed from './embed.js';
import { upsert, create } from './qdrant.js';

async function upsertAll() {
  const data = JSON.parse(fs.readFileSync('chunks.json', 'utf8'));

  await create();

  const batchSize = 16;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const texts = batch.map(x => x.text);

    const embs = await embed(texts);

    const points = batch.map((b, idx) => ({
      id: randomUUID(),
      vector: embs[idx],
      payload: {
        title: b.title,
        link: b.link,
        date: b.date,
        text: b.text,
      },
    }));

    await upsert(points);
    console.log('upserted batch', i, '-', i + batch.length);
  }

  console.log('done upsert');
}

upsertAll().catch(console.error);
