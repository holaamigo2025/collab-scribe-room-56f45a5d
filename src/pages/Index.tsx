
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header */}
      <header className="bg-primary py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">CollabScribe</h1>
            <div>
              <Button variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Hero */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-8 md:p-16 flex items-center justify-center">
          <div className="max-w-md">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Real-time collaborative document editing
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Create, edit, and collaborate on documents in real-time with your team. 
              Share documents easily and discuss changes with integrated comments.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white">Real-time collaborative editing</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-white">Easy document sharing via access codes</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <span className="text-white">Integrated comment system for discussions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Authentication */}
        <div className="w-full md:w-1/2 bg-background p-8 md:p-16 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Get Started</h2>
            <AuthForm />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">© 2025 CollabScribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
