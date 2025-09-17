import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();
const r = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN
});
const TTL = parseInt(process.env.SESSION_TTL||'3600');

export async function add(id, obj){
  const key = `s:${id}`;
  await r.rpush(key, JSON.stringify(obj));
  await r.expire(key, TTL);
}

export async function get(id){
  const key = `s:${id}`;
  const a = await r.lrange(key, 0, -1);
  return a.map(x=>JSON.parse(x));
}

export async function clear(id){
  const key = `s:${id}`;
  await r.del(key);
}
