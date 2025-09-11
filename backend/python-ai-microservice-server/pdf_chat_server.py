from asyncio import futures
from io import BytesIO

import chromadb
import grpc
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
import pdfplumber
from proto import service_pb2_grpc


class PDFService(service_pb2_grpc.PDFServiceServicer):
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
        embedding_model = OpenAIEmbeddings()
        chroma_client = chromadb.Client()
        collection = chroma_client.get_or_create_collection(name="pdf_collection")

        for i, chunk in enumerate(chunks):
            collection.add(
                documents=[chunk],
                embeddings=[embedding_model.embed_query(chunk)],
                metadatas=[{"pdf_name": pdf_name, "chunk_index": i}],
                ids=[f"{pdf_name}-{i}"],
            )
        return
    
    def process_pdf(self, pdf_name, pdf_bytes):
        # Step 1 - Extract text directly from PDF bytes
        text = self.extract_text_from_pdf(pdf_bytes)

        # Step 2 - Chunk the extracted text
        chunks = self.chunk_text(text)

        # Step 3 - Store chunks in ChromaDB
        self.store_chunks_in_chroma(chunks, pdf_name)

        return f"Stored {len(chunks)} chunks for PDF: {pdf_name}"

    def UploadPDF(self, request, context):
        print(f"Received PDF: {request.pdf_name}, size: {len(request.pdf_content)} bytes")
        status_message = self.process_pdf(request.pdf_name, request.pdf_content)
        return service_pb2_grpc.UplaodPDFResponse(status=status_message)
    
    def AskQuestion(self, request, context):
        print(f"Received question: {request.question}")
        return service_pb2_grpc.AskQuestionResponse(answer="This is a placeholder answer.")
    
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_pb2_grpc.add_PDFServiceServicer_to_server(PDFService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Python server running on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()