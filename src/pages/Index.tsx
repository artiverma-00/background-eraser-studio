import { useState, useCallback, useRef } from "react";
import { Sparkles, Zap, Shield, Wand2, LogIn, LogOut, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropZone } from "@/components/DropZone";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { ImageComparison } from "@/components/ImageComparison";
import { ActionButtons } from "@/components/ActionButtons";
import { removeBackground, loadImage } from "@/lib/backgroundRemoval";
import { uploadProcessedImage } from "@/lib/firebaseStorage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type AppState = "idle" | "processing" | "complete";

const Index = () => {
  const [state, setState] = useState<AppState>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const originalFileRef = useRef<File | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setState("processing");
      setProgress(0);
      setStatus("Loading image...");
      originalFileRef.current = file;

      const originalObjectUrl = URL.createObjectURL(file);
      setOriginalUrl(originalObjectUrl);

      const imageElement = await loadImage(file);
      
      const processedBlob = await removeBackground(imageElement, (prog, stat) => {
        setProgress(prog);
        setStatus(stat);
      });

      const processedObjectUrl = URL.createObjectURL(processedBlob);
      setProcessedUrl(processedObjectUrl);

      // Save to Firebase if logged in
      if (user && originalFileRef.current) {
        try {
          setStatus("Saving to cloud...");
          await uploadProcessedImage(user.uid, originalFileRef.current, processedBlob);
          toast.info("Image saved to your history!");
        } catch (err) {
          console.error("Failed to save to cloud:", err);
          toast.warning("Could not save to cloud. Check Firebase Storage rules.");
        }
      }
      
      setState("complete");
      toast.success("Background removed successfully!");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image. Please try again.");
      setState("idle");
    }
  }, [user]);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setOriginalUrl("");
    setProcessedUrl("");
    setState("idle");
    setProgress(0);
    setStatus("");
    originalFileRef.current = null;
  }, [originalUrl, processedUrl]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-bg">
              <Wand2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">
              <span className="gradient-text">BG</span>
              <span className="text-foreground">Remove</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <Clock className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">History</span>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-sm">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline text-foreground truncate max-w-[120px]">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { logout(); toast.success("Logged out"); }}
                  className="rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
                className="rounded-xl text-muted-foreground hover:text-foreground"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-28 pb-16">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Background Removal
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Remove Backgrounds
            <br />
            <span className="gradient-text">In Seconds</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any image and watch AI instantly remove the background. 
            {!user && (
              <span className="block mt-2 text-sm">
                <button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">
                  Sign in
                </button>
                {" "}to save your processed images and view history.
              </span>
            )}
          </p>
        </section>

        {/* Main App Area */}
        <section className="max-w-4xl mx-auto">
          {state === "idle" && (
            <DropZone onFileSelect={handleFileSelect} />
          )}

          {state === "processing" && (
            <ProcessingProgress progress={progress} status={status} />
          )}

          {state === "complete" && (
            <div className="space-y-8">
              <ImageComparison
                originalSrc={originalUrl}
                processedSrc={processedUrl}
              />
              <ActionButtons
                processedUrl={processedUrl}
                onReset={handleReset}
              />
            </div>
          )}
        </section>

        {/* Features Section */}
        {state === "idle" && (
          <section className="mt-20 grid sm:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Process images in seconds with our optimized AI engine
              </p>
            </div>

            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">100% Private</h3>
              <p className="text-sm text-muted-foreground">
                Your images are processed locally and never uploaded to servers
              </p>
            </div>

            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">High Quality</h3>
              <p className="text-sm text-muted-foreground">
                Preserve fine details like hair and edges with precision
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Free to use • No registration required</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
