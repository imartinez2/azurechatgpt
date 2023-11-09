import io

from add_document.splitter import Splitter
from add_document.embeddings import Embeddings
from db.repository import Repository
from model.document import Document

class AddDocument:
    def __init__(self, file_name, content):
        self.embed = Embeddings()
        self.repo = Repository()
        self.file_name = file_name
        self.content = io.BytesIO(content)

    def generate_embeddings(self, benefit):
        texts = Splitter().split(self.content)

        for text in texts:
            metadata = text.metadata
            page_content = text.page_content
            em = self.embed.embed(text.page_content)
            vector = em.data[0].embedding
            self.repo.insert(Document(metadata, page_content, vector, benefit))
            
        return {'response': 'ok'}
