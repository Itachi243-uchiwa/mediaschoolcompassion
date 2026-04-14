import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourse, getModules, getVideos, getUserProgress, setVideoProgress, Module, Video } from "@/lib/firestore";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, CheckCircle2, Circle, ChevronDown, ChevronUp, Image, Lock } from "lucide-react";

interface VideoWithProgress extends Video {
  completed: boolean;
}
interface ModuleWithData extends Module {
  videos: VideoWithProgress[];
  loaded: boolean;
}

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseImage, setCourseImage] = useState("");
  const [modules, setModules] = useState<ModuleWithData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!courseId || !user) return;
      const course = await getCourse(courseId);
      if (!course) { setLoading(false); return; }
      setCourseTitle(course.title);
      setCourseDescription(course.description);
      setCourseImage(course.image_url);

      const mods = await getModules(courseId);
      const prog = await getUserProgress(user.uid);
      setProgress(prog);
      setModules(mods.map((m) => ({ ...m, videos: [], loaded: false })));
      setLoading(false);
    };
    load();
  }, [courseId, user]);

  // Load videos for a module on expand
  const toggleModule = async (moduleId: string) => {
    const isOpen = expandedIds.has(moduleId);
    if (isOpen) {
      setExpandedIds((prev) => { const s = new Set(prev); s.delete(moduleId); return s; });
      return;
    }
    setExpandedIds((prev) => new Set(prev).add(moduleId));

    // Load videos if not yet loaded
    const mod = modules.find((m) => m.id === moduleId);
    if (mod?.loaded) return;

    const videos = await getVideos(courseId!, moduleId);
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, loaded: true, videos: videos.map((v) => ({ ...v, completed: !!progress[v.id] })) }
          : m
      )
    );
  };

  const toggleVideo = async (e: React.MouseEvent, moduleId: string, videoId: string, completed: boolean) => {
    e.stopPropagation();
    if (!user) return;
    await setVideoProgress(user.uid, videoId, !completed);
    const newProg = { ...progress, [videoId]: !completed };
    setProgress(newProg);
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, videos: m.videos.map((v) => v.id === videoId ? { ...v, completed: !completed } : v) }
          : m
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allVideos = modules.flatMap((m) => m.videos);
  const totalWatched = Object.values(progress).filter(Boolean).length;
  const totalVideos = modules.reduce((s, m) => s + (m.loaded ? m.videos.length : 0), 0);
  const globalPercent = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="font-medium truncate">{courseTitle}</span>
              {totalVideos > 0 && <span className="flex-shrink-0 ml-2">{totalWatched}/{totalVideos} · {globalPercent}%</span>}
            </div>
            {totalVideos > 0 && <ProgressBar value={globalPercent} size="sm" />}
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        {courseImage && (
          <>
            <div className="absolute inset-0">
              <img src={courseImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
            </div>
          </>
        )}
        <div className={`relative max-w-4xl mx-auto px-4 ${courseImage ? "pt-16 pb-12" : "pt-10 pb-8"}`}>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-3">{courseTitle}</h1>
          <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">{courseDescription}</p>
        </div>
      </div>

      {/* ── Modules accordion ── */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-3">
        {modules.map((mod, i) => {
          const isOpen = expandedIds.has(mod.id);
          const modWatched = mod.videos.filter((v) => v.completed).length;
          const modPercent = mod.videos.length > 0 ? Math.round((modWatched / mod.videos.length) * 100) : 0;
          const modDone = mod.loaded && modWatched >= mod.videos.length && mod.videos.length > 0;

          return (
            <div key={mod.id} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border bg-card hover:border-border/80"}`}>

              {/* Module header */}
              <button
                className="w-full flex items-center gap-4 p-5 text-left"
                onClick={() => toggleModule(mod.id)}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${modDone ? "bg-green-500/10" : "bg-primary/10"}`}>
                  {modDone
                    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                    : <span className="text-base font-bold text-primary">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className={`font-semibold transition-colors ${isOpen ? "text-primary" : "text-foreground"}`}>{mod.title}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{mod.duration}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{mod.description}</p>
                  {mod.loaded && mod.videos.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <ProgressBar value={modPercent} size="sm" className="flex-1 max-w-[140px]" />
                      <span className="text-xs text-muted-foreground">{modWatched}/{mod.videos.length}</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-muted-foreground">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Videos list */}
              {isOpen && (
                <div className="border-t border-border/60 divide-y divide-border/40">
                  {!mod.loaded ? (
                    <div className="px-5 py-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Chargement...
                    </div>
                  ) : mod.videos.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-muted-foreground">Aucune vidéo dans ce module.</div>
                  ) : (
                    mod.videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-primary/5 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/formation/${courseId}/module/${mod.id}/video/${video.id}`)}
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-28 aspect-video rounded-lg bg-secondary overflow-hidden">
                          {video.thumbnail
                            ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : null}
                          {video.completed ? (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                          ) : video.thumbnail ? (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                                <Play className="h-3 w-3 text-background ml-0.5" fill="currentColor" />
                              </div>
                            </div>
                          ) : !video.youtube_url ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                              <Lock className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium transition-colors line-clamp-1 ${video.completed ? "text-muted-foreground" : "text-foreground group-hover:text-primary"}`}>
                            {video.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{video.duration}</p>
                          {!video.youtube_url && (
                            <span className="text-xs text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md mt-1 inline-block">Bientôt</span>
                          )}
                        </div>

                        {/* Check button */}
                        <button
                          onClick={(e) => toggleVideo(e, mod.id, video.id, video.completed)}
                          className="flex-shrink-0 hover:scale-110 transition-transform"
                        >
                          {video.completed
                            ? <CheckCircle2 className="h-5 w-5 text-primary" />
                            : <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary transition-colors" />}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 mt-4">
        <p className="text-center text-xs text-muted-foreground/50">
          Powered by <span className="font-medium text-muted-foreground/70">Media Compassion Bruxelles</span>
        </p>
      </footer>
    </div>
  );
};

export default CoursePage;
