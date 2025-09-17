import embed from './embed.js';
import { search } from './qdrant.js';
import { add } from './session.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
dotenv.config();

const TOP_K = parseInt(process.env.TOP_K || '5');

export default async function chat(req, res) {
  const body = req.body || {};
  let { id, message } = body;
  if (!message) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'no message' })}\n\n`);
    return res.end();
  }
  if (!id) id = uuid();

  await add(id, { role: 'user', text: message, ts: Date.now() });

  const v = await embed([message]);
  const vec = Array.isArray(v[0]) ? v[0] : v;
  const hits = await search(vec, TOP_K);
  const contexts = hits.map(h => {
    const p = h.payload || {};
    return `Title: ${p.title || ''}\nLink: ${p.link || ''}\nPassage: ${p.text || ''}`;
  }).join('\n\n---\n\n');

  const system = `You are an assistant answering only from the provided news passages. 
If you cite facts, include the article link. Keep answers concise.`;
  const prompt = `${system}\n\nContext:\n${contexts}\n\nUser: ${message}\n\nAnswer:`;
  const gurl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${process.env.GEMINI_KEY}&alt=sse`;

  const gresp = await fetch(gurl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  console.log('Gemini response status:', gresp.status);

  if (!gresp.ok) {
    const txt = await gresp.text();
    console.error('Gemini error:', txt);
    res.write(`event: error\ndata: ${JSON.stringify({ error: txt })}\n\n`);
    return res.end();
  }

  const decoder = new TextDecoder();
  let assistant = '';

  try {
    for await (const chunk of gresp.body) {
      const str = decoder.decode(chunk, { stream: true });
      str.split('\n\n').forEach(line => {
        if (line.startsWith('data:')) {
          const jsonStr = line.replace(/^data:\s*/, '').trim();
          if (!jsonStr || jsonStr === '[DONE]') return;
          try {
            const obj = JSON.parse(jsonStr);
            const text = obj.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (text) {
              res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
              assistant += text;
            }
          } catch (e) {
          }
        }
      });
    }
  } catch (err) {
    console.error('Stream error:', err);
  }

  await add(id, { role: 'assistant', text: assistant, ts: Date.now() });

  res.write(`event: done\ndata: ${JSON.stringify({ id })}\n\n`);
  res.end();
}
