
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth, User } from './AuthContext';

interface Comment {
  id: string;
  user: {
    id: string;
    name: string;
  };
  content: string;
  timestamp: string;
}

interface CommentThread {
  id: string;
  documentId: string;
  position: { from: number; to: number };
  comments: Comment[];
}

interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor?: { from: number; to: number };
  lastActive: string;
}

interface CollabContextType {
  collaborators: Map<string, UserPresence>;
  commentThreads: CommentThread[];
  addComment: (threadId: string | null, content: string, position?: { from: number; to: number }) => void;
  updateCursor: (position: { from: number; to: number }) => void;
  activeUsers: UserPresence[];
}

const CollabContext = createContext<CollabContextType | undefined>(undefined);

const COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#A3E635', 
  '#34D399', '#22D3EE', '#60A5FA', '#A78BFA', 
  '#E879F9', '#FB7185'
];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export const CollabProvider = ({ children, documentId }: { children: ReactNode, documentId?: string }) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<Map<string, UserPresence>>(new Map());
  const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);

  // Initialize current user as a collaborator when they join
  useEffect(() => {
    if (user && documentId) {
      const newCollaborators = new Map(collaborators);
      
      newCollaborators.set(user.id, {
        id: user.id,
        name: user.full_name || user.email.split('@')[0],
        color: getRandomColor(),
        lastActive: new Date().toISOString()
      });
      
      setCollaborators(newCollaborators);
      
      // Load existing comment threads for this document
      const savedThreads = localStorage.getItem(`comments_${documentId}`);
      if (savedThreads) {
        setCommentThreads(JSON.parse(savedThreads));
      }
      
      // Auto cleanup presence when tab closes
      const handleBeforeUnload = () => {
        // This would ideally be a server call to remove presence
        console.log("User leaving document:", user.id);
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user, documentId]);
  
  // Simulate other users (for demo purposes)
  useEffect(() => {
    if (documentId) {
      const demoUsers = [
        { id: 'user1', name: 'Alice', color: '#F87171' },
        { id: 'user2', name: 'Bob', color: '#60A5FA' }
      ];
      
      const newCollaborators = new Map(collaborators);
      
      demoUsers.forEach(demoUser => {
        if (user?.id !== demoUser.id) {
          newCollaborators.set(demoUser.id, {
            ...demoUser,
            lastActive: new Date().toISOString()
          });
        }
      });
      
      setCollaborators(newCollaborators);
    }
  }, [documentId]);
  
  const addComment = useCallback((threadId: string | null, content: string, position?: { from: number; to: number }) => {
    if (!user || !documentId) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      user: {
        id: user.id,
        name: user.full_name || user.email.split('@')[0]
      },
      content,
      timestamp: new Date().toISOString()
    };
    
    setCommentThreads(prevThreads => {
      let updatedThreads;
      
      if (threadId) {
        // Add to existing thread
        updatedThreads = prevThreads.map(thread => 
          thread.id === threadId 
            ? { ...thread, comments: [...thread.comments, newComment] }
            : thread
        );
      } else if (position) {
        // Create new thread
        const newThread: CommentThread = {
          id: Date.now().toString(),
          documentId,
          position,
          comments: [newComment]
        };
        updatedThreads = [...prevThreads, newThread];
      } else {
        return prevThreads;
      }
      
      // Save to localStorage for demo
      localStorage.setItem(`comments_${documentId}`, JSON.stringify(updatedThreads));
      return updatedThreads;
    });
  }, [user, documentId]);
  
  const updateCursor = useCallback((position: { from: number; to: number }) => {
    if (!user) return;
    
    setCollaborators(prev => {
      const newCollaborators = new Map(prev);
      const currentUser = newCollaborators.get(user.id);
      
      if (currentUser) {
        newCollaborators.set(user.id, {
          ...currentUser,
          cursor: position,
          lastActive: new Date().toISOString()
        });
      }
      
      return newCollaborators;
    });
  }, [user]);
  
  // Convert Map to array for easy rendering
  const activeUsers = Array.from(collaborators.values()).filter(
    user => new Date().getTime() - new Date(user.lastActive).getTime() < 5 * 60 * 1000 // Active in last 5 minutes
  );
  
  return (
    <CollabContext.Provider value={{
      collaborators,
      commentThreads,
      addComment,
      updateCursor,
      activeUsers
    }}>
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = (): CollabContextType => {
  const context = useContext(CollabContext);
  if (context === undefined) {
    throw new Error('useCollab must be used within a CollabProvider');
  }
  return context;
};
