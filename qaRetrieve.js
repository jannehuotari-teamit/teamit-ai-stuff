import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RetrievalQAChain } from 'langchain/chains';

const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY;
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPEN_AI_API_KEY
});
const model = new ChatOpenAI({
  openAIApiKey: OPEN_AI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  maxConcurrency: 1,
  maxRetries: 1,
  maxTokens: 100
});

const load = async () => {
  const loader = new CheerioWebBaseLoader(
    'https://lilianweng.github.io/posts/2023-06-23-agent/'
  );
  const data = await loader.load();
  return data;
};

const split = async (data) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 0
  });

  const splitDocs = await textSplitter.splitDocuments(data);
  return splitDocs;
};

const createVectorStore = async (splitDocs) => {
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );
  return vectorStore;
};

const search = async (question) => {
  const data = await load();
  const splitDocs = await split(data);
  const vectorStore = await createVectorStore(splitDocs);
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    returnSourceDocuments: true
  });
  const response = await chain.call({
    query: question
  });
  return response;
};

export { search };
