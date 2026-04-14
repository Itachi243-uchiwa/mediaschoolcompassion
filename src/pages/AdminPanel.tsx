import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getModules, getModule, createModule, updateModule, deleteModule,
  getVideos, createVideo, updateVideo, deleteVideo,
  Course, Module, Video,
} from "@/lib/firestore";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LogOut, Plus, Pencil, Trash2, ArrowLeft, BookOpen, Video as VideoIcon, Layers } from "lucide-react";

// ─── Layout ───────────────────────────────────────────────────────────────────

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Media School — Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/dashboard")}>Voir le site</Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut className="h-4 w-4" />Déconnexion
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
};

// ─── Courses ──────────────────────────────────────────────────────────────────

const CoursesList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", description: "", image_url: "", sort_order: "0" });

  const load = async () => { setCourses(await getCourses()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", image_url: "", sort_order: String(courses.length) }); setShowForm(true); };
  const openEdit = (c: Course) => { setEditing(c); setForm({ title: c.title, description: c.description, image_url: c.image_url, sort_order: String(c.sort_order) }); setShowForm(true); };
  const handleSave = async () => {
    const data = { title: form.title, description: form.description, image_url: form.image_url, sort_order: Number(form.sort_order) };
    editing ? await updateCourse(editing.id, data) : await createCourse(data);
    setShowForm(false); load();
  };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCourse(deleteTarget.id); setDeleteTarget(null); load();
  };

  if (loading) return <AdminLayout><div className="animate-pulse text-muted-foreground">Chargement...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Formations</h1>
          <p className="text-muted-foreground mt-1">{courses.length} formation{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nouvelle formation</Button>
      </div>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
            <div className="flex-shrink-0 w-20 aspect-video rounded-lg bg-secondary overflow-hidden">
              {course.image_url ? <img src={course.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-5 w-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/admin/courses/${course.id}`)}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" title="Modules" onClick={() => navigate(`/admin/courses/${course.id}`)}><Layers className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(course)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(course)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {courses.length === 0 && <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">Aucune formation. Créez-en une !</div>}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier la formation" : "Nouvelle formation"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Formation Canva Pro" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <ImageUpload label="Image de couverture" value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} />
            <div className="space-y-2"><Label>Ordre d'affichage</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle><AlertDialogDescription>"{deleteTarget?.title}" sera supprimée définitivement.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// ─── Modules ──────────────────────────────────────────────────────────────────

const CourseModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Module | null>(null);
  const [form, setForm] = useState({ title: "", description: "", duration: "", sort_order: "0" });

  const load = async () => {
    if (!courseId) return;
    const [c, mods] = await Promise.all([getCourse(courseId), getModules(courseId)]);
    setCourse(c); setModules(mods); setLoading(false);
  };
  useEffect(() => { load(); }, [courseId]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", duration: "", sort_order: String(modules.length) }); setShowForm(true); };
  const openEdit = (m: Module) => { setEditing(m); setForm({ title: m.title, description: m.description, duration: m.duration, sort_order: String(m.sort_order) }); setShowForm(true); };
  const handleSave = async () => {
    if (!courseId) return;
    const data = { title: form.title, description: form.description, duration: form.duration, sort_order: Number(form.sort_order) };
    editing ? await updateModule(courseId, editing.id, data) : await createModule(courseId, data);
    setShowForm(false); load();
  };
  const handleDelete = async () => {
    if (!courseId || !deleteTarget) return;
    await deleteModule(courseId, deleteTarget.id); setDeleteTarget(null); load();
  };

  if (loading) return <AdminLayout><div className="animate-pulse text-muted-foreground">Chargement...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground" onClick={() => navigate("/admin")}><ArrowLeft className="h-4 w-4" />Retour aux formations</Button>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{course?.title}</h1>
          <p className="text-muted-foreground mt-1">{modules.length} module{modules.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nouveau module</Button>
      </div>
      <div className="space-y-4">
        {modules.map((mod, i) => (
          <div key={mod.id} className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/admin/courses/${courseId}/modules/${mod.id}`)}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{mod.title}</h3>
              <p className="text-sm text-muted-foreground">{mod.duration}{mod.duration && mod.description ? " · " : ""}{mod.description?.slice(0, 60)}{(mod.description?.length ?? 0) > 60 ? "..." : ""}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" title="Vidéos" onClick={() => navigate(`/admin/courses/${courseId}/modules/${mod.id}`)}><VideoIcon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(mod)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(mod)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {modules.length === 0 && <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">Aucun module. Créez-en un !</div>}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Modifier le module" : "Nouveau module"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Module 1 — Introduction" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="space-y-2"><Label>Durée estimée</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="45 min" /></div>
            <div className="space-y-2"><Label>Ordre d'affichage</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer ce module ?</AlertDialogTitle><AlertDialogDescription>"{deleteTarget?.title}" sera supprimé définitivement.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// ─── Videos ───────────────────────────────────────────────────────────────────

const ModuleVideos = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState<Module | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Video | null>(null);
  const emptyForm = { title: "", description: "", duration: "", youtube_url: "", thumbnail: "", sort_order: "0" };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    if (!courseId || !moduleId) return;
    const [m, vids] = await Promise.all([getModule(courseId, moduleId), getVideos(courseId, moduleId)]);
    setMod(m); setVideos(vids); setLoading(false);
  };
  useEffect(() => { load(); }, [moduleId]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, sort_order: String(videos.length) }); setShowForm(true); };
  const openEdit = (v: Video) => { setEditing(v); setForm({ title: v.title, description: v.description, duration: v.duration, youtube_url: v.youtube_url, thumbnail: v.thumbnail, sort_order: String(v.sort_order) }); setShowForm(true); };
  const handleSave = async () => {
    if (!courseId || !moduleId) return;
    const data = { title: form.title, description: form.description, duration: form.duration, youtube_url: form.youtube_url, thumbnail: form.thumbnail, sort_order: Number(form.sort_order) };
    editing ? await updateVideo(courseId, moduleId, editing.id, data) : await createVideo(courseId, moduleId, data);
    setShowForm(false); load();
  };
  const handleDelete = async () => {
    if (!courseId || !moduleId || !deleteTarget) return;
    await deleteVideo(courseId, moduleId, deleteTarget.id); setDeleteTarget(null); load();
  };

  if (loading) return <AdminLayout><div className="animate-pulse text-muted-foreground">Chargement...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground" onClick={() => navigate(`/admin/courses/${courseId}`)}><ArrowLeft className="h-4 w-4" />Retour aux modules</Button>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{mod?.title}</h1>
          <p className="text-muted-foreground mt-1">{videos.length} vidéo{videos.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />Nouvelle vidéo</Button>
      </div>
      <div className="space-y-4">
        {videos.map((video, i) => (
          <div key={video.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="flex-shrink-0 w-24 aspect-video rounded-lg bg-secondary overflow-hidden">
              {video.thumbnail ? <img src={video.thumbnail} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><VideoIcon className="h-5 w-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-muted-foreground font-medium">{i + 1}.</span>
                <h3 className="font-semibold text-foreground line-clamp-1">{video.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{video.duration}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {video.youtube_url ? <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">Vidéo disponible</span> : <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">Bientôt disponible</span>}
                {video.thumbnail && <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Miniature</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => openEdit(video)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(video)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">Aucune vidéo. Créez-en une !</div>}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier la vidéo" : "Nouvelle vidéo"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Introduction à Canva" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Durée</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="12 min" /></div>
              <div className="space-y-2"><Label>Ordre</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>URL YouTube (embed)</Label>
              <Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
              <p className="text-xs text-muted-foreground">Laisser vide si la vidéo n'est pas encore prête</p>
            </div>
            <ImageUpload label="Miniature (affichée si la vidéo n'est pas encore disponible)" value={form.thumbnail} onChange={(url) => setForm({ ...form, thumbnail: url })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer cette vidéo ?</AlertDialogTitle><AlertDialogDescription>"{deleteTarget?.title}" sera supprimée définitivement.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// ─── Router ───────────────────────────────────────────────────────────────────

const AdminPanel = () => (
  <Routes>
    <Route index element={<CoursesList />} />
    <Route path="courses/:courseId" element={<CourseModules />} />
    <Route path="courses/:courseId/modules/:moduleId" element={<ModuleVideos />} />
  </Routes>
);

export default AdminPanel;
