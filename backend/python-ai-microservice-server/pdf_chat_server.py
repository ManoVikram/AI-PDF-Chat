from concurrent import futures
from io import BytesIO
import os

import chromadb
from dotenv import load_dotenv
import grpc
import pdfplumber
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from proto import service_pb2, service_pb2_grpc


class PDFService(service_pb2_grpc.PDFServiceServicer):
    def __init__(self):
        self.embedding_model = OpenAIEmbeddings()
        self.chroma_client = chromadb.Client()
        self.collection = self.chroma_client.get_or_create_collection(name="pdf_collection")

    def extract_text_from_pdf(self, pdf_bytes):
        text = ""
        
        with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                pdf_text = page.extract_text()
                if pdf_text:
                    text += pdf_text + "\n"
        
        return text
    
    def chunk_text(self, text, chunk_size=1000, overlap=200):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            separators=["\n\n", "\n", " ", ""]
        )
        
        return splitter.split_text(text)
    
    def store_chunks_in_chroma(self, chunks, pdf_name):
        embeddings = self.embedding_model.embed_documents(chunks)
        ids = [f"{pdf_name}-{i}" for i in range(len(chunks))]
        metadatas = [{"pdf_name": pdf_name, "chunk_index": i} for i in range(len(chunks))]

        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

        return len(chunks)
    
    def process_pdf(self, pdf_name, pdf_bytes):
        # Step 1 - Extract text directly from PDF bytes
        text = self.extract_text_from_pdf(pdf_bytes)

        # Step 2 - Chunk the extracted text
        chunks = self.chunk_text(text)

        # Step 3 - Store chunks in ChromaDB
        chunk_count = self.store_chunks_in_chroma(chunks, pdf_name)

        return f"Stored {chunk_count} chunks for PDF: {pdf_name}"

    def UploadPDF(self, request, context):
        print(f"Received PDF: {request.pdf_name}, size: {len(request.pdf_content)} bytes")
        
        status_message = self.process_pdf(request.pdf_name, request.pdf_content)
        
        return service_pb2.UploadPDFResponse(status=status_message)
    
    def AskQuestion(self, request, context):
        question = request.question
        print(f"Received question: {question}")

        # Step 1 - Embed the question
        query_embedding = self.embedding_model.embed_query(question)

        # Step 2 - Retrieve relevant chunks from ChromaDB
        results = self.collection.query(query_embeddings=[query_embedding], n_results=4)

        # Step 3 - Gather retrieved chunks
        top_chunks = results.get("documents", [[]])[0]
        context_text = "\n\n".join(top_chunks)

        # Step 4 - Ask LLM for a concise answer
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        prompt = (
            "You are a helpful assistant who uses only the provided context to answer the question.\n\n"
            f"Context:\n{context_text}\n\n"
            f"Question: {question}\n\n"
            "Answer concisely: and truthfully based on the context."
        )
        response = llm.invoke(prompt)
        print(response.content)
        
        return service_pb2.AskQuestionResponse(answer=response.content)
    
def serve():
    load_dotenv()
    assert os.getenv("OPENAI_API_KEY"), "OPENAI_API_KEY is not set in the environment variables."
    
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_PDFServiceServicer_to_server(PDFService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Python server running on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()