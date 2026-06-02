import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourse, getModules, getVideos, getUserProgress, setVideoProgress, Module, Video } from "@/lib/firestore";
import ProgressBar from "@/components/ProgressBar";
import DonationButton from "@/components/DonationButton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, CheckCircle2, Circle, ChevronDown, ChevronUp, Lock, Heart, List, X, Sparkles, BookOpen } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [unlockedModules, setUnlockedModules] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("msc_unlocked_modules") ?? "[]")); } catch { return new Set(); }
  });
  const [accessModal, setAccessModal] = useState<{ moduleId: string; target: string } | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

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

  const isLocked = (mod: ModuleWithData) => !!mod.access_code && !unlockedModules.has(mod.id);

  const openCodeModal = (moduleId: string) => {
    setAccessModal({ moduleId, target: `/formation/${courseId}/module/${moduleId}` });
    setCodeInput("");
    setCodeError(false);
  };

  const submitCode = () => {
    const mod = modules.find((m) => m.id === accessModal?.moduleId);
    if (!mod?.access_code || codeInput.trim() !== mod.access_code) {
      setCodeError(true);
      return;
    }
    const updated = new Set(unlockedModules);
    updated.add(accessModal!.moduleId);
    localStorage.setItem("msc_unlocked_modules", JSON.stringify([...updated]));
    setUnlockedModules(updated);
    navigate(accessModal!.target);
    setAccessModal(null);
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

  const totalWatched = Object.values(progress).filter(Boolean).length;
  const totalVideos = modules.reduce((s, m) => s + (m.loaded ? m.videos.length : 0), 0);
  const globalPercent = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;
  const courseCompleted = totalVideos > 0 && totalWatched >= totalVideos;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            {totalVideos > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="font-medium truncate">{courseTitle}</span>
                  <span className="flex-shrink-0 ml-3 tabular-nums font-medium">{totalWatched}/{totalVideos} · {globalPercent}%</span>
                </div>
                <ProgressBar value={globalPercent} size="sm" />
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground truncate">{courseTitle}</span>
            )}
          </div>
          <DonationButton
            variant="outline"
            size="sm"
            label="Don"
            showIcon={true}
            className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
            context={`Vous appréciez la formation "${courseTitle}" ? Aidez-nous à produire plus de contenu de qualité.`}
          />
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden">
        {courseImage ? (
          <div className="absolute inset-0">
            <img src={courseImage} alt="" className="w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-background/75 to-background" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        )}
        <div className={`relative max-w-4xl mx-auto px-4 ${courseImage ? "pt-20 pb-14" : "pt-14 pb-10"}`}>
          <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 mb-5 bg-background/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border/50">
            <BookOpen className="h-3 w-3" />
            <span>Formation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">{courseTitle}</h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed mb-7">{courseDescription}</p>
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-card/80 backdrop-blur-sm border border-border/60 text-foreground/80 px-3.5 py-2 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              {modules.length} module{modules.length !== 1 ? "s" : ""}
            </span>
            {totalVideos > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-card/80 backdrop-blur-sm border border-border/60 text-foreground/80 px-3.5 py-2 rounded-full shadow-sm">
                <Play className="h-3 w-3" />
                {totalVideos} vidéo{totalVideos !== 1 ? "s" : ""}
              </span>
            )}
            {globalPercent > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary px-3.5 py-2 rounded-full shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                {globalPercent}% complété
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Programme header + toggle ── */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Programme</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {modules.length} module{modules.length !== 1 ? "s" : ""} · suivez votre progression
          </p>
        </div>
        <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-card/80 p-1 shadow-sm">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-3.5 w-3.5" />
            Liste
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <span className="rounded-sm bg-current" /><span className="rounded-sm bg-current" />
              <span className="rounded-sm bg-current" /><span className="rounded-sm bg-current" />
            </span>
            Grille
          </button>
        </div>
      </div>

      {/* ── Vue grille ── */}
      {viewMode === "grid" && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((mod, i) => {
              const modWatched = mod.videos.filter((v) => v.completed).length;
              const modPercent = mod.videos.length > 0 ? Math.round((modWatched / mod.videos.length) * 100) : 0;
              const modDone = mod.loaded && modWatched >= mod.videos.length && mod.videos.length > 0;
              const locked = isLocked(mod);

              return (
                <div
                  key={mod.id}
                  onClick={() => locked ? openCodeModal(mod.id) : navigate(`/formation/${courseId}/module/${mod.id}`)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    locked
                      ? "border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-card hover:shadow-xl hover:shadow-yellow-500/10 hover:-translate-y-1"
                      : modDone
                      ? "border border-green-500/20 bg-card hover:shadow-xl hover:shadow-green-500/8 hover:-translate-y-1"
                      : "border border-border bg-card hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1"
                  }`}
                >
                  {/* Top gradient accent */}
                  <div className={`h-[3px] w-full ${
                    locked ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
                    : modDone ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600"
                    : modPercent > 0 ? "bg-gradient-to-r from-primary/70 via-primary to-primary/70"
                    : "bg-border/50"
                  }`} />

                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${
                        locked ? "bg-gradient-to-br from-yellow-400/25 to-yellow-600/15"
                        : modDone ? "bg-gradient-to-br from-green-400/20 to-green-600/10"
                        : "bg-gradient-to-br from-primary/20 to-primary/10"
                      }`}>
                        {locked
                          ? <Lock className="h-5 w-5 text-yellow-600" />
                          : modDone
                          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                          : <span className="text-sm font-bold text-primary">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm leading-snug mb-1.5 transition-colors line-clamp-2 ${
                          locked ? "text-yellow-700 dark:text-yellow-400"
                          : "text-foreground group-hover:text-primary"
                        }`}>{mod.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {locked && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                              <Sparkles className="h-2.5 w-2.5" />BONUS
                            </span>
                          )}
                          {mod.duration && <p className="text-xs text-muted-foreground">{mod.duration}</p>}
                        </div>
                      </div>
                    </div>

                    {mod.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{mod.description}</p>
                    )}

                    {mod.loaded && mod.videos.length > 0 && !locked && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                          <span>{mod.videos.length} vidéo{mod.videos.length !== 1 ? "s" : ""}</span>
                          <span className="font-bold text-foreground">{modPercent}%</span>
                        </div>
                        <ProgressBar value={modPercent} size="sm" />
                      </div>
                    )}

                    <div className={`flex items-center justify-between text-xs font-bold mt-2 group-hover:gap-2 transition-all ${locked ? "text-yellow-600" : "text-primary"}`}>
                      <span>{locked ? "Accès membres" : "Voir les vidéos"}</span>
                      {locked ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" fill="currentColor" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Vue liste (timeline) ── */}
      {viewMode === "list" && (
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="relative">
            {/* Timeline connector line */}
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-primary/20 via-border/60 to-transparent hidden sm:block" />

            <div className="space-y-3">
              {modules.map((mod, i) => {
                const isOpen = expandedIds.has(mod.id);
                const modWatched = mod.videos.filter((v) => v.completed).length;
                const modPercent = mod.videos.length > 0 ? Math.round((modWatched / mod.videos.length) * 100) : 0;
                const modDone = mod.loaded && modWatched >= mod.videos.length && mod.videos.length > 0;
                const locked = isLocked(mod);

                return (
                  <div key={mod.id} className="flex gap-4 items-start">

                    {/* Timeline dot (desktop) */}
                    <div className={`hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center z-10 transition-all duration-300 mt-0.5 ${
                      locked
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30"
                        : modDone
                        ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/25"
                        : isOpen
                        ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30 scale-110"
                        : "bg-card border-2 border-border shadow-sm"
                    }`}>
                      {locked
                        ? <Lock className="h-4 w-4 text-white" />
                        : modDone
                        ? <CheckCircle2 className="h-4 w-4 text-white" />
                        : <span className={`text-xs font-bold ${isOpen ? "text-white" : "text-muted-foreground"}`}>{i + 1}</span>}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 rounded-2xl border overflow-hidden transition-all duration-300 ${
                      locked
                        ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-card"
                        : isOpen
                        ? "border-primary/25 shadow-xl shadow-primary/6 bg-card"
                        : "border-border bg-card hover:border-border/80 hover:shadow-lg hover:shadow-black/5"
                    }`}>

                      {/* Open-state top glow line */}
                      {isOpen && !locked && (
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      )}

                      {/* Module button */}
                      <button
                        className="w-full flex items-center gap-4 px-5 py-4 text-left group"
                        onClick={() => locked ? openCodeModal(mod.id) : toggleModule(mod.id)}
                      >
                        {/* Mobile dot (hidden on sm+) */}
                        <div className={`sm:hidden flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                          locked ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                          : modDone ? "bg-gradient-to-br from-green-400 to-green-600"
                          : isOpen ? "bg-gradient-to-br from-primary to-primary/80"
                          : "bg-muted border border-border"
                        }`}>
                          {locked ? <Lock className="h-3.5 w-3.5 text-white" />
                          : modDone ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          : <span className={`text-xs font-bold ${isOpen ? "text-white" : "text-muted-foreground"}`}>{i + 1}</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <h3 className={`font-bold text-base leading-snug transition-colors truncate ${
                                locked ? "text-yellow-700 dark:text-yellow-400"
                                : isOpen ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                              }`}>{mod.title}</h3>
                              {locked && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                                  <Sparkles className="h-2.5 w-2.5" />BONUS
                                </span>
                              )}
                            </div>
                            {mod.duration && (
                              <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5 font-medium">{mod.duration}</span>
                            )}
                          </div>
                          {mod.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">{mod.description}</p>
                          )}
                          {mod.loaded && mod.videos.length > 0 && !locked && (
                            <div className="flex items-center gap-2.5 mt-2.5">
                              <ProgressBar value={modPercent} size="sm" className="max-w-[180px]" />
                              <span className="text-xs text-muted-foreground tabular-nums">{modWatched}/{mod.videos.length} vidéo{mod.videos.length !== 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>

                        <div className={`flex-shrink-0 transition-all duration-200 ${
                          locked ? "text-yellow-500"
                          : isOpen ? "text-primary"
                          : "text-muted-foreground/50 group-hover:text-muted-foreground"
                        }`}>
                          {locked ? <Lock className="h-4 w-4" />
                          : isOpen ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </button>

                      {/* Videos list */}
                      {isOpen && (
                        <div className="border-t border-border/40">
                          {!mod.loaded ? (
                            <div className="px-5 py-5 flex items-center gap-2.5 text-sm text-muted-foreground">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Chargement des vidéos...
                            </div>
                          ) : mod.videos.length === 0 ? (
                            <p className="px-5 py-5 text-sm text-muted-foreground italic">Aucune vidéo dans ce module.</p>
                          ) : (
                            <div className="p-3 space-y-1">
                              {mod.videos.map((video) => (
                                <div
                                  key={video.id}
                                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                                  onClick={() => navigate(`/formation/${courseId}/module/${mod.id}/video/${video.id}`)}
                                >
                                  {/* Thumbnail */}
                                  <div className="relative flex-shrink-0 w-[5.5rem] aspect-video rounded-xl bg-muted overflow-hidden shadow-sm">
                                    {video.thumbnail && (
                                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    )}
                                    {video.completed ? (
                                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                      </div>
                                    ) : video.thumbnail ? (
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                                          <Play className="h-3 w-3 ml-0.5 text-gray-900" fill="currentColor" />
                                        </div>
                                      </div>
                                    ) : !video.youtube_url ? (
                                      <div className="absolute inset-0 flex items-center justify-center">
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
                                    <p className={`text-sm font-semibold line-clamp-2 transition-colors leading-snug ${
                                      video.completed ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                                    }`}>{video.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {video.duration && <span className="text-xs text-muted-foreground/70">{video.duration}</span>}
                                      {!video.youtube_url && (
                                        <span className="text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">Bientôt</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Check button */}
                                  <button
                                    onClick={(e) => toggleVideo(e, mod.id, video.id, video.completed)}
                                    className="flex-shrink-0 hover:scale-110 transition-transform"
                                  >
                                    {video.completed
                                      ? <CheckCircle2 className="h-5 w-5 text-primary" />
                                      : <Circle className="h-5 w-5 text-muted-foreground/30 hover:text-primary transition-colors" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Donation section — after modules ── */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition-all ${
          courseCompleted
            ? "border-primary/40 bg-gradient-to-br from-primary/12 via-primary/6 to-card shadow-lg shadow-primary/10"
            : "border-border/60 bg-card"
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${courseCompleted ? "bg-primary/20" : "bg-secondary"}`}>
            <Heart className={`h-6 w-6 ${courseCompleted ? "text-primary" : "text-muted-foreground"}`} fill={courseCompleted ? "currentColor" : "none"} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {courseCompleted
                ? "🎉 Formation terminée — merci pour votre engagement !"
                : "Ce contenu est 100% gratuit"}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {courseCompleted
                ? "Votre soutien nous permettrait de créer encore plus de formations de qualité."
                : "Un don, même symbolique, aide à financer la production de nouvelles formations et à maintenir la plateforme gratuite."}
            </p>
          </div>
          <DonationButton
            size="sm"
            label={courseCompleted ? "Soutenir le projet" : "Faire un don"}
            className="flex-shrink-0 shadow-md shadow-primary/15"
            context={`Vous appréciez la formation "${courseTitle}" ? Aidez-nous à produire plus de contenu gratuit de qualité.`}
          />
        </div>
      </div>

      {/* ── Access Code Modal ── */}
      {accessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setAccessModal(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <button onClick={() => setAccessModal(null)} className="text-muted-foreground hover:text-foreground mt-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Module BONUS</h2>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Ce module est réservé aux membres de la team. Entrez votre code d'accès pour continuer.
            </p>
            <div className="space-y-3">
              <input
                type="password"
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value); setCodeError(false); }}
                onKeyDown={(e) => e.key === "Enter" && submitCode()}
                placeholder="Code d'accès"
                className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground text-center text-lg font-mono focus:outline-none focus:ring-2 transition-colors ${
                  codeError ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30"
                }`}
                autoFocus
              />
              {codeError && (
                <p className="text-sm text-destructive text-center">Code incorrect. Réessayez.</p>
              )}
              <Button className="w-full" onClick={submitCode}>
                Accéder au module
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 mt-4">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-0.5">
            <p className="text-xs text-muted-foreground/60">© Media Compassion Bruxelles</p>
            <p className="text-xs text-muted-foreground/40">Powered by <span className="font-medium text-muted-foreground/60">Martinez Muzela</span></p>
          </div>
          <DonationButton
            variant="ghost"
            size="sm"
            label="Soutenir le projet"
            className="text-muted-foreground hover:text-primary"
          />
        </div>
      </footer>
    </div>
  );
};

export default CoursePage;
