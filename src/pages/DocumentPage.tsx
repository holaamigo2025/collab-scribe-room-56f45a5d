
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { CollabProvider } from "@/contexts/CollabContext";
import { Button } from "@/components/ui/button";
import DocumentEditor from "@/components/editor/DocumentEditor";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const DocumentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { documents, currentDocument, setCurrentDocument, fetchDocuments } = useDocuments();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id || !user) return;
    
    const loadDocument = async () => {
      // Try to find document in current state
      const doc = documents.find(d => d.id === id);
      
      if (doc) {
        setCurrentDocument(doc);
      } else {
        // Fetch all documents to find this one
        await fetchDocuments(user.id);
        const refetchedDoc = documents.find(d => d.id === id);
        
        if (refetchedDoc) {
          setCurrentDocument(refetchedDoc);
        } else {
          toast.error("Document not found");
          navigate("/dashboard");
        }
      }
    };
    
    loadDocument();
    
    return () => {
      setCurrentDocument(null);
    };
  }, [id, user]);
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  if (!id || !user) {
    return null;
  }
  
  return (
    <CollabProvider documentId={id}>
      <div className="container max-w-6xl mx-auto p-6">
        <div className="mb-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <DocumentEditor documentId={id} />
      </div>
    </CollabProvider>
  );
};

export default DocumentPage;
