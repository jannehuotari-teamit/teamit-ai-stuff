import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAI } from '@langchain/openai';
import { loadQAStuffChain } from 'langchain/chains';

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;

const model = new OpenAI({
  modelName: 'gpt-3.5-turbo-instruct', // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
  temperature: 0.1,
  openAIApiKey: OPEN_AI_API_KEY,
  maxConcurrency: 1,
  maxRetries: 1,
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

const chat = async (docs) => {
  const chain = await loadQAStuffChain(model);
  const question = 'Who is the CV about?';
  const response = await chain.invoke({
    input_documents: docs,
    question
  });
  console.log(response);
};

const main = async () => {
  try {
    const docs = await loadPDF();
    await chat(docs);
  } catch (e) {
    console.error(e.message || e);
  }
};

main();
