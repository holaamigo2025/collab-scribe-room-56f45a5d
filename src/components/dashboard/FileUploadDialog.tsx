
import { useState, ChangeEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FileUploadDialog = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const { createDocument } = useDocuments();
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      // Mock file upload process with progress
      let uploadProgress = 0;
      const interval = setInterval(() => {
        uploadProgress += 10;
        setProgress(uploadProgress);
        
        if (uploadProgress >= 100) {
          clearInterval(interval);
          processFile();
        }
      }, 200);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file");
      setIsUploading(false);
    }
  };
  
  const processFile = async () => {
    try {
      // Read file content
      const content = await readFileContent(file!);
      
      // Create new document with file content
      const newDoc = await createDocument(file!.name, user!.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing delay
      
      // Update document with file content
      await useDocuments().updateDocument(newDoc.id, { content });
      
      setOpen(false);
      toast.success("File uploaded successfully");
      navigate(`/documents/${newDoc.id}`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error("Failed to process file");
    } finally {
      setIsUploading(false);
      setProgress(0);
      setFile(null);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a text file to create a new document. Supported formats: .txt, .md, .html
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Text files only (TXT, MD, HTML)
                </p>
              </div>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange} 
                accept=".txt,.md,.html"
                disabled={isUploading}
              />
            </label>
          </div>
          
          {file && (
            <div className="text-sm">
              Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
