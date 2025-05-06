
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session on load
    const checkSession = async () => {
      try {
        // We'll replace this with actual Supabase integration later
        const storedUser = localStorage.getItem('collab_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      // Mock signup - replace with Supabase
      const newUser: User = {
        id: Date.now().toString(),
        email,
        full_name: fullName,
      };
      
      localStorage.setItem('collab_user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success("Account created successfully!");
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error("Failed to create account. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - replace with Supabase
      // For demo purposes, we'll just create a user
      const currentUser: User = {
        id: Date.now().toString(),
        email,
        full_name: email.split('@')[0],
      };
      
      localStorage.setItem('collab_user', JSON.stringify(currentUser));
      setUser(currentUser);
      toast.success("Signed in successfully!");
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error("Failed to sign in. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Mock signout - replace with Supabase
      localStorage.removeItem('collab_user');
      setUser(null);
      toast.info("Signed out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
