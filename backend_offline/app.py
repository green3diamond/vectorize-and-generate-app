from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
from local_faiss import VectorStoreManager, TextChunkSplitter
from PyPDF2 import PdfReader
import threading

class MyHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.last_modified = None
        self.vector_store_manager = VectorStoreManager()
        self.chunk_size = 1000
        self.text_splitter = TextChunkSplitter(chunk_size=self.chunk_size)
        self.pending_timers = {}
        self.delay = 10 
        
    def on_modified(self, event):
        if not event.is_directory:
            file_path = event.src_path
            
            # Cancel any existing timer for this file
            if file_path in self.pending_timers:
                self.pending_timers[file_path].cancel()
            
            # Create new timer that will trigger after seconds of inactivity
            timer = threading.Timer(self.delay, self._process_file, [file_path])
            self.pending_timers[file_path] = timer
            timer.start()
            
            print(f"File modified, waiting for {self.delay}s of inactivity: {file_path}")
    
    def _process_file(self, file_path):
        """This gets called only after 5 seconds of no modifications"""
        try:
            self.add_documents(file_path)
            print(f"Processed after {self.delay}s delay: {file_path}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
        finally:
            # Clean up the timer reference
            if file_path in self.pending_timers:
                del self.pending_timers[file_path]

    def on_created(self, event):
        print(f"Created: {event.src_path}")

    def on_deleted(self, event):
        print(f"Deleted: {event.src_path}")

    def add_documents(self, document_name):
        print("Adding documents to vector store...")
        pdfreader = PdfReader(document_name)
        pdf_pages = []
        for page in pdfreader.pages:
            text = page.extract_text()
            if text:
                pdf_pages.append(text)
        
        texts = []
        for pdf_page in pdf_pages:
            chunks = self.text_splitter.create_chunks(pdf_page)
            texts.extend(chunks)
        
        self.vector_store_manager.add_documents(texts, document_name)
        print(f"Added {len(texts)} chunks to the vector store.")

def main():
    print("Monitoring started...")
    path = "/home/zdim/code/kaggle_w4/backend_offline/input_documents/to_process"
    handler = MyHandler()
    observer = Observer()
    observer.schedule(handler, path=path, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()
    print("Monitoring stopped.")