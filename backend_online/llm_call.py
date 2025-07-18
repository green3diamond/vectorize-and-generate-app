from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from ollama import chat
from ollama import ChatResponse


class RAG:
    """
    RAG class to handle the retrieval-augmented generation process.
    It uses the DeepSeek model to answer user queries.
    """
    def __init__(self):
        self.faiss = FAISS.load_local(
            "../backend_offline/faiss_index", 
            embeddings=OllamaEmbeddings(model="deepseek-r1:1.5b"), 
            allow_dangerous_deserialization=True
            )
        
    
    def call_deepseek(self, userMessage):
        """
        Calls the DeepSeek model with a sample question.
        Returns the response content.
        """
        # # Perform similarity search on the vector store
        docs = self.faiss.similarity_search(userMessage, k=5)
        # print(len(docs))
        # # Prepare the user message with context from the retrieved documents
        docs_content = '\n\n'.join([doc.page_content for doc in docs[:2]])
        fullMessageWithContext = f"<context>{docs_content}</context>\n\n<question>{userMessage}</question>"
        print(fullMessageWithContext)

        response: ChatResponse = chat(model='deepseek-r1:1.5b', messages=[
        {
            'role': 'user',
            'content': fullMessageWithContext,
        },
        ], 
        think = False,)
        
        return response.message.content