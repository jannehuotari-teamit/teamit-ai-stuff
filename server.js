import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAI } from '@langchain/openai';
import { loadQAStuffChain } from 'langchain/chains';
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

app.use(express.json());

const model = new OpenAI({
  modelName: 'gpt-3.5-turbo-instruct', // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
  temperature: 0.1,
  openAIApiKey: OPEN_AI_API_KEY,
  maxConcurrency: 1,
  maxRetries: 1,
  maxTokens: 100,
  callbacks: [
    {
      handleLLMEnd(output) {
        console.log(JSON.stringify(output, null, 2));
      }
    }
  ]
});

const loadPDF = async () => {
  const loader = new PDFLoader('./docs/RachelGreenCV.pdf');

  const docs = await loader.load();
  return docs;
};

const chat = async (docs, question) => {
  const chain = await loadQAStuffChain(model);
  const response = await chain.invoke({
    input_documents: docs,
    question
  });
  return response;
};

app.post('/question', async (req, res) => {
  const question = req.body.question;
  const docs = await loadPDF();
  const response = await chat(docs, question);
  res.send(response);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
