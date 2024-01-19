import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

const loadPDF = async () => {
  const loader = new PDFLoader('./docs/RachelGreenCV.pdf');

  const docs = await loader.load();
  console.log(docs);
};

const main = () => {
  loadPDF();
};

main();
