import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const parser = new Parser();
export const feeds = [
  "https://timesofindia.indiatimes.com/rss.cms",
  "https://indianexpress.com/feed/",
  "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
  "https://www.livemint.com/rss/news",
  "https://www.moneycontrol.com/rss/latestnews.xml",
  "https://www.business-standard.com/rss/latest.rss",
  "https://www.thehindu.com/news/national/feeder/default.rss",
  "https://www.deccanherald.com/rss_feed/31/india.rss",
  "https://www.newindianexpress.com/Nation/rssfeed/?id=170&getXmlFeed=true",
  "https://www.ndtv.com/rss"
];


function chunk(text, n=500){
  const words = text.split(/\s+/);
  const out = [];
  for (let i=0;i<words.length;i+=n){
    out.push(words.slice(i,i+n).join(' '));
  }
  return out;
}

async function ingest(){
  const all = [];
  for (const f of feeds){
    try {
      const feed = await parser.parseURL(f);
      const items = feed.items.slice(0,50);
      for (const it of items){
        const txt = (it.content || it.contentSnippet || '') + ' ' + (it.title||'');
        const chunks = chunk(txt, parseInt(process.env.CHUNK_TOKENS||'500'));
        chunks.forEach((c, idx)=>{
          all.push({
            id: encodeURIComponent((it.link||it.guid||it.title)+'-'+idx),
            title: it.title,
            link: it.link,
            date: it.pubDate,
            text: c
          });
        });
      }
    } catch(e){
      console.error('feed err', f, e.message);
    }
  }
  fs.writeFileSync(path.resolve('chunks.json'), JSON.stringify(all, null, 2));
  console.log('wrote chunks.json', all.length);
}
ingest().catch(console.error);
