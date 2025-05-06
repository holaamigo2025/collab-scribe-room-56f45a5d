
import { useState, FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocuments } from "@/contexts/DocumentContext";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

const JoinDocumentDialog = () => {
  const [open, setOpen] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { getDocumentByCode } = useDocuments();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    
    setIsJoining(true);
    try {
      const doc = await getDocumentByCode(accessCode.trim().toUpperCase());
      if (doc) {
        setOpen(false);
        navigate(`/documents/${doc.id}`);
        toast.success(`Joined document: ${doc.title}`);
      } else {
        toast.error("Invalid access code. Please check and try again.");
      }
    } catch (error) {
      console.error('Error joining document:', error);
    } finally {
      setIsJoining(false);
      setAccessCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="mr-2 h-4 w-4" />
          Join Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join Document</DialogTitle>
            <DialogDescription>
              Enter the access code provided by the document owner to join and collaborate.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Access code (e.g., ABC123)"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full font-mono uppercase"
              maxLength={8}
              required
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isJoining || !accessCode.trim()}>
              {isJoining ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinDocumentDialog;
