import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import chat from './chat.js';
import * as session from './session.js';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(bodyParser.json());

app.post('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    await chat(req, res);
  } catch (e) {
    console.error('chat error', e);
    res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

app.get('/history/:id', async (req,res) => {
  const list = await session.get(req.params.id);
  res.json({ session: req.params.id, history: list });
});

app.post('/reset', async (req,res) => {
  const { id } = req.body;
  await session.clear(id);
  res.json({ ok: true });
});

const port = process.env.PORT;
app.listen(port, () => console.log('listening', port));
