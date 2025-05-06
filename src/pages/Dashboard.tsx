
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentCard from "@/components/dashboard/DocumentCard";
import CreateDocumentDialog from "@/components/dashboard/CreateDocumentDialog";
import JoinDocumentDialog from "@/components/dashboard/JoinDocumentDialog";
import FileUploadDialog from "@/components/dashboard/FileUploadDialog";
import { LogOut, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { documents, fetchDocuments, isLoading } = useDocuments();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchDocuments(user.id);
    }
  }, [user]);
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium">Loading documents...</h3>
            <p className="text-muted-foreground">Please wait while we load your documents</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.full_name || user?.email?.split("@")[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <CreateDocumentDialog />
          <JoinDocumentDialog />
          <FileUploadDialog />
        </div>
      </div>
      
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {documents.map(document => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No documents yet</CardTitle>
            <CardDescription>
              Create your first document or join an existing one using an access code
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <File className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              You haven't created any documents yet. Get started by creating a new document or uploading a file.
            </p>
            <div className="flex gap-4">
              <CreateDocumentDialog />
              <FileUploadDialog />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
