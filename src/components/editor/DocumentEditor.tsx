
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { useCollab } from "@/contexts/CollabContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save } from "lucide-react";
import { toast } from "sonner";

// Mock rich text editor (normally would use ProseMirror or TipTap)
const DocumentEditor = ({ documentId }: { documentId: string }) => {
  const { user } = useAuth();
  const { currentDocument, updateDocument, saveDocument } = useDocuments();
  const { activeUsers, commentThreads, addComment } = useCollab();
  
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  
  // Initialize editor with document data
  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title);
      setContent(currentDocument.content || "");
    }
  }, [currentDocument]);
  
  const handleTitleChange = async () => {
    if (!currentDocument || title === currentDocument.title) return;
    
    try {
      await updateDocument(documentId, { title });
      toast.success("Title updated");
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error("Failed to update title");
    }
  };
  
  const handleContentSave = async () => {
    if (!currentDocument) return;
    
    setIsSaving(true);
    try {
      await saveDocument(documentId, content);
      toast.success("Document saved");
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    addComment(null, commentContent, { from: 0, to: 0 });
    setCommentContent("");
    toast.success("Comment added");
  };
  
  // Mock text formatting functions
  const format = (type: string) => {
    toast(`Applied ${type} formatting`);
  };
  
  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium">Loading document...</h3>
          <p className="text-muted-foreground">Please wait while we load your document</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleChange}
            className="text-xl font-semibold border-0 border-b rounded-none focus:ring-0 px-0"
            placeholder="Document Title"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleContentSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md p-1 mb-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => format('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => format('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => format('underline')}>
            <Underline className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="sm" onClick={() => format('align-left')}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => format('align-center')}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => format('align-right')}>
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="col-span-2">
          <Card className="border h-full">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 font-mono resize-none focus:ring-0 border-0"
              placeholder="Start typing your document content here..."
            />
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="border p-4">
            <h3 className="font-medium mb-2">Active Collaborators</h3>
            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse-light"
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <span>{user.name}</span>
                </div>
              ))}
              {activeUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">No active collaborators</p>
              )}
            </div>
          </Card>
          
          <Card className="border">
            <Tabs defaultValue="comments">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="add">Add Comment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments" className="p-4">
                <ScrollArea className="h-[300px]">
                  {commentThreads.length > 0 ? (
                    <div className="space-y-4">
                      {commentThreads.map((thread) => (
                        <div key={thread.id} className="space-y-2">
                          {thread.comments.map((comment) => (
                            <div key={comment.id} className="p-2 bg-secondary rounded-lg">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-sm">{comment.user.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(comment.timestamp).toLocaleTimeString()}
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments yet</p>
                  )}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="add" className="p-4">
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <Textarea 
                    placeholder="Add your comment here..." 
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[120px] resize-none"
                    required
                  />
                  <Button type="submit" disabled={!commentContent.trim()}>Add Comment</Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
