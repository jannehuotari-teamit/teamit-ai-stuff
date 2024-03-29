import express from 'express';
import cors from 'cors';

import { loadPDF, chat } from './bot1.js';
import { search } from './bot2.js';
import { run } from './bot3.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post('/question', async (req, res) => {
  const question = req.body.question;
  try {
    const docs = await loadPDF();
    const response = await chat(docs, question);
    res.send(response);
  } catch (error) {
    console.log(error.message || error);
    res.send(error.code || 500);
  }
});

app.post('/v2/question', async (req, res) => {
  try {
    const results = await search(req.body.question);
    res.send(results);
  } catch (error) {
    console.log(error.message || error);
    res.send(error.code || 500);
  }
});

app.post('/v3/question', async (req, res) => {
  try {
    const results = await run(req.body.question);
    res.send(results);
  } catch (error) {
    console.log(error.message || error);
    res.send(error.code || 500);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
