import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain.schema import Document
import uuid
import os

class VectorStoreManager:
    def __init__(self):
        self.embeddings = OllamaEmbeddings(model="deepseek-r1:1.5b") # Initialize with the desired model
        self.index = faiss.IndexFlatL2(len(self.embeddings.embed_query("hello world"))) # Initialize with the dimension of the embeddings
        if os.path.exists("faiss_index"):
            self.index = FAISS.load_local(
                "faiss_index",
                embeddings=self.embeddings, 
                allow_dangerous_deserialization=True
                )
        else:
            self.vector_store = FAISS(
                embedding_function=self.embeddings,
                index=self.index,
                docstore=InMemoryDocstore(),
                index_to_docstore_id={},
            )

    def add_documents(self, texts, document_name):
        for text in texts:
            if not isinstance(text, str):
                raise ValueError("All texts must be strings.")
        documents = [Document(page_content=text, metadata={"source":document_name}) for text in texts]
        ids = [str(uuid.uuid4()) for _ in range(len(documents))]
        
        # TODO add documents only if they arent added before
        self.vector_store.add_documents(documents=documents, ids=ids)

        self.vector_store.save_local("faiss_index")  # Save the index to disk

    def search(self, query, k=5):
        return self.vector_store.similarity_search(query, k=k)
    

class TextChunkSplitter:
    def __init__(self, chunk_size=1000):
        self.chunk_size = chunk_size
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=100)

    def create_chunks(self, text):
        texts = self.text_splitter.split_text(text)
        return texts

