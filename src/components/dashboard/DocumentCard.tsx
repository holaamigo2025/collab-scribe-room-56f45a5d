
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Document, useDocuments } from "@/contexts/DocumentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DocumentCardProps {
  document: Document;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const { user } = useAuth();
  const { generateAccessCode } = useDocuments();
  const [accessCode, setAccessCode] = useState<string | null>(document.access_code || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isOwner = user?.id === document.owner_id;

  const handleGenerateCode = async () => {
    if (!isOwner) return;
    
    setIsGenerating(true);
    try {
      const code = await generateAccessCode(document.id);
      setAccessCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!accessCode) return;
    
    navigator.clipboard.writeText(accessCode);
    toast.success("Access code copied to clipboard");
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{document.title}</CardTitle>
            <CardDescription>
              Last updated {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
            </CardDescription>
          </div>
          {isOwner ? (
            <Badge variant="outline">Owner</Badge>
          ) : (
            <Badge variant="secondary">Collaborator</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 line-clamp-3">
          {document.content ? document.content.replace(/<[^>]*>/g, ' ').substring(0, 100) : 'Empty document'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to={`/documents/${document.id}`}>Open</Link>
        </Button>
        
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Share</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
                <DialogDescription>
                  Generate an access code to allow others to collaborate on this document.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col gap-4 py-4">
                {accessCode ? (
                  <div className="flex items-center gap-2">
                    <Input readOnly value={accessCode} className="font-mono" />
                    <Button variant="outline" onClick={handleCopyCode}>Copy</Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerateCode} 
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate Access Code"}
                  </Button>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Share this code with people you want to collaborate with. They will be able to access and edit this document.
                </p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => toast.info("Anyone with the access code can join this document")}>
                  How sharing works
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
