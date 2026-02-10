import { create } from 'zustand';
import { Document, DocumentTag, DocumentFolder } from '../types/document';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  tags: DocumentTag[];
  folders: DocumentFolder[];
  loading: boolean;

  // Actions
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  setTags: (tags: DocumentTag[]) => void;
  addTag: (tag: DocumentTag) => void;
  updateTag: (id: string, data: Partial<DocumentTag>) => void;
  deleteTag: (id: string) => void;
  setFolders: (folders: DocumentFolder[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  currentDocument: null,
  tags: [],
  folders: [],
  loading: false,

  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  updateDocument: (id, data) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, ...data } : d)),
      currentDocument: state.currentDocument?.id === id ? { ...state.currentDocument, ...data } : state.currentDocument,
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
    })),
  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (id, data) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
    })),
  setFolders: (folders) => set({ folders }),
  setLoading: (loading) => set({ loading }),
}));
