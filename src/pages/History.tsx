import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getHistory, HistoryEntry } from "@/lib/firebaseStorage";
import { Clock, Download, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wand2 } from "lucide-react";

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchHistory = async () => {
      try {
        const entries = await getHistory(user.uid);
        setHistory(entries);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Processing History
            </h2>
            <p className="text-sm text-muted-foreground">
              Your previously processed images
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No history yet</h3>
            <p className="text-muted-foreground mb-6">
              Process your first image to see it here
            </p>
            <Button onClick={() => navigate("/")} className="gradient-bg text-primary-foreground rounded-xl glow">
              Process an Image
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((entry) => (
              <div key={entry.id} className="glass rounded-2xl overflow-hidden group">
                <div className="relative aspect-video">
                  <img
                    src={entry.processedUrl}
                    alt={entry.fileName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={entry.processedUrl}
                      download={`processed_${entry.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="gradient-bg text-primary-foreground rounded-lg">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
