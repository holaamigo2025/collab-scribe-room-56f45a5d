
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  access_code?: string;
  collaborators?: string[];
}

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  createDocument: (title: string, ownerId: string) => Promise<Document>;
  updateDocument: (id: string, data: Partial<Document>) => Promise<void>;
  fetchDocuments: (userId: string) => Promise<void>;
  getDocumentByCode: (code: string) => Promise<Document | null>;
  setCurrentDocument: (doc: Document | null) => void;
  saveDocument: (id: string, content: string) => Promise<void>;
  generateAccessCode: (docId: string) => Promise<string>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDocuments = async (userId: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with Supabase
      const storedDocs = localStorage.getItem(`docs_${userId}`);
      if (storedDocs) {
        setDocuments(JSON.parse(storedDocs));
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const createDocument = async (title: string, ownerId: string): Promise<Document> => {
    setIsLoading(true);
    try {
      // Mock API call - replace with Supabase
      const newDoc: Document = {
        id: Date.now().toString(),
        title,
        content: '',
        owner_id: ownerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      localStorage.setItem(`docs_${ownerId}`, JSON.stringify(updatedDocs));
      toast.success("Document created successfully!");
      return newDoc;
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error("Failed to create document");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (id: string, data: Partial<Document>) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with Supabase
      const updatedDocs = documents.map(doc => 
        doc.id === id ? { ...doc, ...data, updated_at: new Date().toISOString() } : doc
      );
      
      setDocuments(updatedDocs);
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument({ ...currentDocument, ...data, updated_at: new Date().toISOString() });
      }
      
      const ownerId = documents.find(doc => doc.id === id)?.owner_id;
      if (ownerId) {
        localStorage.setItem(`docs_${ownerId}`, JSON.stringify(updatedDocs));
      }
      
      toast.success("Document updated");
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error("Failed to update document");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = async (id: string, content: string) => {
    try {
      // Mock API call - replace with Supabase
      const updatedDocs = documents.map(doc => 
        doc.id === id ? { ...doc, content, updated_at: new Date().toISOString() } : doc
      );
      
      setDocuments(updatedDocs);
      if (currentDocument && currentDocument.id === id) {
        setCurrentDocument({ ...currentDocument, content, updated_at: new Date().toISOString() });
      }
      
      const ownerId = documents.find(doc => doc.id === id)?.owner_id;
      if (ownerId) {
        localStorage.setItem(`docs_${ownerId}`, JSON.stringify(updatedDocs));
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error("Failed to save document");
      throw error;
    }
  };

  const generateAccessCode = async (docId: string): Promise<string> => {
    try {
      // Mock code generation - replace with Supabase
      const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      await updateDocument(docId, { access_code: accessCode });
      toast.success("Access code generated successfully");
      return accessCode;
    } catch (error) {
      console.error('Error generating access code:', error);
      toast.error("Failed to generate access code");
      throw error;
    }
  };

  const getDocumentByCode = async (code: string): Promise<Document | null> => {
    setIsLoading(true);
    try {
      // Mock API call - replace with Supabase
      // Scan through all user documents in localStorage
      let foundDoc: Document | null = null;
      
      // This is inefficient but works for demo
      const allStorage = { ...localStorage };
      Object.keys(allStorage).forEach(key => {
        if (key.startsWith('docs_')) {
          const docs = JSON.parse(allStorage[key]) as Document[];
          const doc = docs.find(d => d.access_code === code);
          if (doc) {
            foundDoc = doc;
          }
        }
      });
      
      return foundDoc;
    } catch (error) {
      console.error('Error finding document by code:', error);
      toast.error("Failed to find document");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      currentDocument,
      isLoading,
      createDocument,
      updateDocument,
      fetchDocuments,
      getDocumentByCode,
      setCurrentDocument,
      saveDocument,
      generateAccessCode
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
