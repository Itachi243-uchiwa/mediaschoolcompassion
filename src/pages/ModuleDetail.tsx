import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getModule, getVideos, getUserProgress, setVideoProgress, Video } from "@/lib/firestore";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, CheckCircle2, Circle, Lock } from "lucide-react";

interface VideoWithProgress extends Video {
  completed: boolean;
}

const ModuleDetail = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [videos, setVideos] = useState<VideoWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!courseId || !moduleId || !user) return;
    const mod = await getModule(courseId, moduleId);
    if (!mod) { setLoading(false); return; }
    setModuleTitle(mod.title);
    setModuleDescription(mod.description);
    const videosData = await getVideos(courseId, moduleId);
    const progress = await getUserProgress(user.uid);
    setVideos(videosData.map((v) => ({ ...v, completed: !!progress[v.id] })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [moduleId, user]);

  const toggleWatched = async (videoId: string, completed: boolean) => {
    if (!user) return;
    await setVideoProgress(user.uid, videoId, !completed);
    setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, completed: !completed } : v));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const watched = videos.filter((v) => v.completed).length;
  const percent = videos.length > 0 ? (watched / videos.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground" onClick={() => navigate(`/formation/${courseId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium truncate">{moduleTitle}</span>
              <span className="flex-shrink-0 ml-2">{watched}/{videos.length}</span>
            </div>
            <ProgressBar value={percent} size="sm" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">{moduleTitle}</h1>
          <p className="text-muted-foreground leading-relaxed">{moduleDescription}</p>
        </div>

        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
              onClick={() => navigate(`/formation/${courseId}/module/${moduleId}/video/${video.id}`)}
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-36 aspect-video rounded-xl bg-secondary overflow-hidden">
                {video.thumbnail
                  ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : null}
                {video.completed ? (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                ) : video.thumbnail ? (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all shadow-lg">
                      <Play className="h-4 w-4 text-background ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                ) : !video.youtube_url ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                  {video.title}
                </h3>
                {video.duration && <p className="text-sm text-muted-foreground">{video.duration}</p>}
                {video.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{video.description}</p>}
                {!video.youtube_url && (
                  <span className="inline-block mt-2 text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">Bientôt disponible</span>
                )}
              </div>

              {/* Check */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleWatched(video.id, video.completed); }}
                className="flex-shrink-0 hover:scale-110 transition-transform"
              >
                {video.completed
                  ? <CheckCircle2 className="h-6 w-6 text-primary" />
                  : <Circle className="h-6 w-6 text-muted-foreground/40 hover:text-primary transition-colors" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
