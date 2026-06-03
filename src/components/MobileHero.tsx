import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";

interface Props {
  userName: string;
  userPhoto?: string | null;
  totalWatched: number;
  globalPercent: number;
  coursesCount: number;
  totalVideos: number;
}

const floatA = {
  animate: {
    x: [0, 18, -8, 0],
    y: [0, -20, 10, 0],
    scale: [1, 1.08, 0.96, 1],
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
  },
};
const floatB = {
  animate: {
    x: [0, -14, 10, 0],
    y: [0, 12, -16, 0],
    scale: [1, 0.94, 1.06, 1],
    transition: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
  },
};
const floatC = {
  animate: {
    x: [0, 10, -6, 0],
    y: [0, -8, 14, 0],
    scale: [1, 1.12, 0.92, 1],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 },
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const statCard = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const MobileHero = ({ userName, userPhoto, totalWatched, globalPercent, coursesCount, totalVideos }: Props) => (
  <div className="sm:hidden relative overflow-hidden px-4 pt-6 pb-5">

    {/* ── Orbes flottantes ── */}
    <motion.div {...floatA} className="absolute -top-10 -right-8 w-52 h-52 rounded-full bg-primary/18 blur-3xl pointer-events-none" />
    <motion.div {...floatB} className="absolute top-4 -left-12 w-40 h-40 rounded-full bg-primary/12 blur-2xl pointer-events-none" />
    <motion.div {...floatC} className="absolute bottom-0 right-6 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

    {/* ── Contenu ── */}
    <motion.div variants={container} initial="hidden" animate="show">

      {/* Ligne avatar + salutation */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
        {userPhoto ? (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="relative flex-shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-md scale-110 animate-pulse" />
            <img src={userPhoto} alt={userName} className="relative w-12 h-12 rounded-full ring-2 ring-primary/40 object-cover" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="relative flex-shrink-0 w-12 h-12 rounded-full bg-primary/15 ring-2 ring-primary/30 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-110 animate-pulse" />
            <span className="relative text-lg font-bold text-primary">{userName[0]?.toUpperCase()}</span>
          </motion.div>
        )}
        <div>
          <p className="text-xs font-semibold text-primary tracking-wide">Bon retour 👋</p>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight leading-snug">
            Bonjour, <span className="text-primary">{userName}</span>
          </h1>
        </div>
      </motion.div>

      {/* Sous-titre */}
      <motion.p variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed mb-5">
        Continue ton apprentissage — chaque vidéo te rapproche de ton objectif.
      </motion.p>

      {/* Barre de progression globale */}
      {totalVideos > 0 && (
        <motion.div variants={fadeUp} className="mb-5 bg-card/60 border border-border/50 backdrop-blur-sm rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">Progression globale</span>
            <span className="font-bold text-primary tabular-nums">{globalPercent}%</span>
          </div>
          <ProgressBar value={globalPercent} size="sm" />
          <p className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">{totalWatched} vidéo{totalWatched !== 1 ? "s" : ""} regardée{totalWatched !== 1 ? "s" : ""}</p>
        </motion.div>
      )}

      {/* Stats cards */}
      {totalVideos > 0 && (
        <motion.div variants={container} className="grid grid-cols-3 gap-2.5">
          {[
            { icon: <Trophy className="h-4 w-4 text-primary" />, value: totalWatched, label: "vues" },
            { icon: <Flame className="h-4 w-4 text-primary" />, value: `${globalPercent}%`, label: "progression" },
            { icon: <BookOpen className="h-4 w-4 text-primary" />, value: coursesCount, label: "formations" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={statCard}
              whileTap={{ scale: 0.93 }}
              className="relative bg-card/70 border border-border/50 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1 overflow-hidden"
            >
              {/* glow spot */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="relative w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-0.5">
                {stat.icon}
              </div>
              <span className="relative text-lg font-extrabold text-foreground leading-none">{stat.value}</span>
              <span className="relative text-[10px] text-muted-foreground font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  </div>
);

export default MobileHero;
