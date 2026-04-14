import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCourses, getModules, getVideos, getUserProgress, Course } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import { Play, LogOut, BookOpen, ChevronRight, Trophy, Flame } from "lucide-react";

interface CourseWithProgress extends Course {
  totalVideos: number;
  watchedVideos: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCourse, setLastCourse] = useState<CourseWithProgress | null>(null);

  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const userPhoto = user?.photoURL;

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const coursesData = await getCourses();
      const progress = await getUserProgress(user.uid);
      const completedIds = new Set(Object.entries(progress).filter(([, v]) => v).map(([k]) => k));

      const coursesWithProgress: CourseWithProgress[] = [];
      for (const course of coursesData) {
        const modules = await getModules(course.id);
        let totalVideos = 0;
        let watchedVideos = 0;
        for (const mod of modules) {
          const videos = await getVideos(course.id, mod.id);
          totalVideos += videos.length;
          watchedVideos += videos.filter((v) => completedIds.has(v.id)).length;
        }
        coursesWithProgress.push({ ...course, totalVideos, watchedVideos });
      }

      setCourses(coursesWithProgress);
      setLastCourse(
        coursesWithProgress.find((c) => c.watchedVideos > 0 && c.watchedVideos < c.totalVideos) || null
      );
      setLoading(false);
    };
    loadData();
  }, [user]);

  const totalWatched = courses.reduce((s, c) => s + c.watchedVideos, 0);
  const totalVideos = courses.reduce((s, c) => s + c.totalVideos, 0);
  const globalPercent = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground tracking-tight">Media School</span>
          </div>
          <div className="flex items-center gap-3">
            {userPhoto && (
              <img src={userPhoto} alt={userName} className="w-8 h-8 rounded-full ring-2 ring-border" />
            )}
            <Button variant="ghost" size="sm" onClick={async () => { await logout(); navigate("/login"); }} className="gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative">
          <p className="text-sm font-medium text-primary mb-2">Bon retour 👋</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Bonjour, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Continue ton apprentissage là où tu t'es arrêté — chaque vidéo te rapproche de ton objectif.
          </p>

          {totalVideos > 0 && (
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-none">{totalWatched}</p>
                  <p className="text-xs text-muted-foreground">vidéos vues</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground leading-none">{globalPercent}%</p>
                  <p className="text-xs text-muted-foreground">progression globale</p>
                </div>
              </div>
              <div className="flex-1 min-w-[160px] max-w-xs">
                <ProgressBar value={globalPercent} size="sm" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── Continuer ── */}
        {lastCourse && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Reprendre</h2>
            <div
              className="relative overflow-hidden rounded-2xl cursor-pointer group"
              onClick={() => navigate(`/formation/${lastCourse.id}`)}
            >
              <div className="absolute inset-0">
                {lastCourse.image_url
                  ? <img src={lastCourse.image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-background" />}
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20" />
              </div>
              <div className="relative p-6 md:p-8 flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3">En cours</span>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{lastCourse.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {lastCourse.watchedVideos}/{lastCourse.totalVideos} vidéos · {Math.round((lastCourse.watchedVideos / lastCourse.totalVideos) * 100)}% complété
                  </p>
                  <div className="max-w-sm">
                    <ProgressBar value={(lastCourse.watchedVideos / lastCourse.totalVideos) * 100} size="sm" />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Formations ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Formations</h2>
            <span className="text-xs text-muted-foreground">{courses.length} disponible{courses.length !== 1 ? "s" : ""}</span>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune formation disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => {
                const percent = course.totalVideos > 0 ? Math.round((course.watchedVideos / course.totalVideos) * 100) : 0;
                const isCompleted = course.watchedVideos > 0 && course.watchedVideos >= course.totalVideos;
                const isStarted = course.watchedVideos > 0 && !isCompleted;

                return (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/formation/${course.id}`)}
                    className="group rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="relative aspect-video bg-secondary overflow-hidden">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                          <Play className="h-5 w-5 text-background ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Trophy className="h-3 w-3" />Terminé
                        </div>
                      )}
                      {isStarted && (
                        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                          En cours
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{course.totalVideos} vidéos</span>
                          <span className="font-medium text-foreground">{percent}%</span>
                        </div>
                        <ProgressBar value={percent} size="sm" />
                      </div>
                      <Button className="w-full gap-2 group-hover:gap-3 transition-all" size="sm" variant={isCompleted ? "outline" : "default"}>
                        {isCompleted ? "Revoir" : isStarted ? "Continuer" : "Commencer"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
