from asyncio import futures

import grpc
from proto import service_pb2_grpc


class PDFService(service_pb2_grpc.PDFServiceServicer):
    def UploadPDF(self, request, context):
        print(f"Received PDF: {request.pdf_name}, size: {len(request.pdf_content)} bytes")
        return service_pb2_grpc.UplaodPDFResponse(status="ok")
    
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