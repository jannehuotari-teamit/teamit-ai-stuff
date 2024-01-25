import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { BufferMemory } from 'langchain/memory';
import * as fs from 'fs';
import { LLMChain } from 'langchain/chains';
import { formatDocumentsAsString } from 'langchain/util/document';
import { RunnableBranch, RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export const run = async (question) => {
  console.log(question);
  /* Initialize the LLM to use to answer the question */
  const model = new ChatOpenAI({});
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync('./docs/RachelGreenCV.pdf', 'utf8');
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
  const retriever = vectorStore.asRetriever();

  const serializeChatHistory = (chatHistory) => {
    if (Array.isArray(chatHistory)) {
      return chatHistory.join('\n');
    }
    return chatHistory;
  };

  const memory = new BufferMemory({
    memoryKey: 'chatHistory'
  });

  /**
   * Create a prompt template for generating an answer based on context and
   * a question.
   *
   * Chat history will be an empty string if it's the first question.
   *
   * inputVariables: ["chatHistory", "context", "question"]
   */
  const questionPrompt = PromptTemplate.fromTemplate(
    `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
CHAT HISTORY: {chatHistory}
----------------
CONTEXT: {context}
----------------
QUESTION: {question}
----------------
Helpful Answer:`
  );

  /**
   * Creates a prompt template for __generating a question__ to then ask an LLM
   * based on previous chat history, context and the question.
   *
   * inputVariables: ["chatHistory", "question"]
   */
  const questionGeneratorTemplate =
    PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
----------------
CHAT HISTORY: {chatHistory}
----------------
FOLLOWUP QUESTION: {question}
----------------
Standalone question:`);

  const handleProcessQuery = async (input) => {
    const chain = new LLMChain({
      llm: model,
      prompt: questionPrompt,
      outputParser: new StringOutputParser()
    });

    const { text } = await chain.call({
      ...input,
      chatHistory: serializeChatHistory(input.chatHistory ?? '')
    });

    await memory.saveContext(
      {
        human: input.question
      },
      {
        ai: text
      }
    );

    return text;
  };

  const answerQuestionChain = RunnableSequence.from([
    {
      question: (input) => input.question
    },
    {
      question: (previousStepResult) => previousStepResult.question,
      chatHistory: (previousStepResult) =>
        serializeChatHistory(previousStepResult.chatHistory ?? ''),
      context: async (previousStepResult) => {
        // Fetch relevant docs and serialize to a string.
        const relevantDocs = await retriever.getRelevantDocuments(
          previousStepResult.question
        );
        const serialized = formatDocumentsAsString(relevantDocs);
        return serialized;
      }
    },
    handleProcessQuery
  ]);

  const generateQuestionChain = RunnableSequence.from([
    {
      question: (input) => input.question,
      chatHistory: async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        return serializeChatHistory(memoryResult.chatHistory ?? '');
      }
    },
    questionGeneratorTemplate,
    model,
    // Take the result of the above model call, and pass it through to the
    // next RunnableSequence chain which will answer the question
    {
      question: (previousStepResult) => previousStepResult.text
    },
    answerQuestionChain
  ]);

  const branch = RunnableBranch.from([
    [
      async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        const isChatHistoryPresent = !memoryResult.chatHistory.length;

        return isChatHistoryPresent;
      },
      answerQuestionChain
    ],
    [
      async () => {
        const memoryResult = await memory.loadMemoryVariables({});
        const isChatHistoryPresent =
          !!memoryResult.chatHistory && memoryResult.chatHistory.length;

        return isChatHistoryPresent;
      },
      generateQuestionChain
    ],
    answerQuestionChain
  ]);

  const fullChain = RunnableSequence.from([
    {
      question: (input) => input.question
    },
    branch
  ]);

  const resultOne = await fullChain.invoke({
    question: question
  });

  return resultOne;
};
