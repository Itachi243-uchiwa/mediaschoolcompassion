import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getVideo, getUserProgress, setVideoProgress, Video } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import DonationButton from "@/components/DonationButton";
import { ArrowLeft, CheckCircle2, Circle, Play, Clock, Heart } from "lucide-react";

const VideoPlayer = () => {
  const { courseId, moduleId, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [watched, setWatched] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!courseId || !moduleId || !videoId || !user) return;
      const v = await getVideo(courseId, moduleId, videoId);
      setVideo(v);
      const progress = await getUserProgress(user.uid);
      setWatched(!!progress[videoId]);
      setLoading(false);
    };
    load();
  }, [courseId, moduleId, videoId, user]);

  // Reset player when video changes
  useEffect(() => { setPlaying(false); }, [videoId]);

  const handleToggle = async () => {
    if (!user || !videoId) return;
    const next = !watched;
    await setVideoProgress(user.uid, videoId, next);
    setWatched(next);
  };

  // Back goes to CoursePage (accordion), not ModuleDetail
  const handleBack = () => navigate(`/formation/${courseId}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Vidéo introuvable.</p>
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      </div>
    );
  }

  const embedUrl = video.youtube_url
    ? `${video.youtube_url}${video.youtube_url.includes("?") ? "&" : "?"}autoplay=1`
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium text-foreground truncate flex-1">{video.title}</p>

          {/* Donation button in top bar */}
          <DonationButton
            variant="outline"
            size="sm"
            label="Don"
            showIcon={true}
            className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/10 flex-shrink-0"
            context={`Ce contenu vous a plu ? Soutenez la production de ressources comme "${video.title}".`}
          />

          <button
            onClick={handleToggle}
            title={watched ? "Marquer comme non vue" : "Marquer comme vue"}
            className="flex-shrink-0 hover:scale-110 transition-transform"
          >
            {watched
              ? <CheckCircle2 className="h-5 w-5 text-primary" />
              : <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">

        {/* ── Player ── */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/40 mb-8 ring-1 ring-white/5">

          {/* Playing state — YouTube iframe */}
          {playing && embedUrl && (
            <iframe
              key={videoId}
              src={embedUrl}
              title={video.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* Thumbnail / pre-play state */}
          {!playing && (
            <>
              {/* Background image */}
              {video.thumbnail && (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Overlay */}
              <div className={`absolute inset-0 ${video.thumbnail ? "bg-black/40" : "bg-zinc-900"} flex flex-col items-center justify-center gap-4`}>
                {video.youtube_url ? (
                  /* Play button */
                  <button
                    onClick={() => setPlaying(true)}
                    className="group flex flex-col items-center gap-4"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white group-hover:bg-primary transition-colors duration-200 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 md:h-10 md:w-10 text-black group-hover:text-white ml-1 transition-colors" fill="currentColor" />
                    </div>
                    <span className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                      Lancer la vidéo
                    </span>
                  </button>
                ) : (
                  /* Coming soon */
                  <div className="text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-7 w-7 text-white/60" />
                    </div>
                    <p className="text-white font-semibold text-xl mb-1">Bientôt disponible</p>
                    <p className="text-white/50 text-sm">Cette vidéo sera publiée prochainement</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Info card ── */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">

          {/* Title + duration + check */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{video.title}</h1>
              {video.duration && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{video.duration}</span>
                </div>
              )}
            </div>

            {/* Mark as watched — big button on right */}
            <button
              onClick={handleToggle}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                watched
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {watched ? "Vue ✓" : "Marquer comme vue"}
            </button>
          </div>

          {/* Separator */}
          {video.description && <div className="border-t border-border/60" />}

          {/* Description */}
          {video.description && (
            <p className="text-muted-foreground leading-relaxed">{video.description}</p>
          )}
        </div>

        {/* ── Donation nudge — contextual after video info ── */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Ce contenu t'a apporté quelque chose ?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aide-nous à produire et diffuser plus de ressources comme celle-ci dans 50+ langues.
            </p>
          </div>
          <DonationButton
            size="sm"
            label="Soutenir"
            className="flex-shrink-0 shadow-md shadow-primary/15"
            context={`Ce contenu vous a plu ? Soutenez la production de ressources comme "${video.title}".`}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-6 mt-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/50">
            Powered by <span className="font-medium text-muted-foreground/70">Media Compassion Bruxelles</span>
          </p>
          <DonationButton
            variant="ghost"
            size="sm"
            label="Faire un don"
            className="text-muted-foreground hover:text-primary"
          />
        </div>
      </footer>
    </div>
  );
};

export default VideoPlayer;
