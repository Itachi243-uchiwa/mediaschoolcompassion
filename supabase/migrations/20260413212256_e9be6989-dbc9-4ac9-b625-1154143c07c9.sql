
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  password TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses viewable by authenticated" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules viewable by authenticated" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  youtube_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos viewable by authenticated" ON public.videos FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DO $$
DECLARE
  course_uuid UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  m0 UUID := gen_random_uuid();
  m1 UUID := gen_random_uuid();
  m2 UUID := gen_random_uuid();
  m3 UUID := gen_random_uuid();
  m4 UUID := gen_random_uuid();
  m5 UUID := gen_random_uuid();
  m6 UUID := gen_random_uuid();
  m7 UUID := gen_random_uuid();
  mb UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.courses (id, title, description, sort_order) VALUES
  (course_uuid, 'Formation Canva Pro — Église', 'Apprenez à créer des visuels professionnels pour votre église avec Canva Pro. Une formation complète, étape par étape.', 0);

  INSERT INTO public.modules (id, course_id, title, description, duration, sort_order) VALUES
  (m0, course_uuid, 'Bienvenue & Objectifs', 'Découvrez les objectifs de cette formation.', '4 min', 0),
  (m1, course_uuid, 'La Méthode en 4 Étapes', 'La méthode simple en 4 étapes pour créer un visuel professionnel.', '9 min', 1),
  (m2, course_uuid, 'Créer son Compte & Naviguer dans Canva', 'Créez votre compte et naviguez dans l''interface.', '7 min', 2),
  (m3, course_uuid, 'Trouver les Bons Templates', 'Cherchez et sélectionnez les meilleurs templates.', '9 min', 3),
  (m4, course_uuid, 'Modifier Textes, Fontes & Couleurs', 'Personnalisez textes et couleurs.', '11 min', 4),
  (m5, course_uuid, 'Remplacer les Images & Backgrounds', 'Remplacez images et arrière-plans.', '9 min', 5),
  (m6, course_uuid, 'Rendre une Affiche Propre', 'Finalisez une affiche professionnelle.', '9 min', 6),
  (m7, course_uuid, 'Cas Réel Complet', 'Cas pratique complet du début à la fin.', '14 min', 7),
  (mb, course_uuid, 'Télécharger, Exporter & Partager', 'Exportez et partagez vos créations.', '6 min', 8);

  INSERT INTO public.videos (module_id, title, description, duration, youtube_url, sort_order) VALUES
  (m0, 'Bienvenue dans la formation', 'Introduction à la formation et présentation des objectifs.', '4 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m1, 'Les 4 étapes pour un visuel réussi', 'Méthode structurée : template, texte, images, export.', '9 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m2, 'Prise en main de Canva', 'Création de compte et découverte de l''interface.', '7 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m3, 'Rechercher et choisir un template', 'Techniques de recherche et critères de sélection.', '9 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m4, 'Textes, fontes et couleurs', 'Modification des textes et gestion des couleurs.', '11 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m5, 'Images et arrière-plans', 'Remplacement d''images et gestion des arrière-plans.', '9 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m6, 'Finaliser une affiche professionnelle', 'Alignement, espacement et retouches finales.', '9 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (m7, 'Création d''une affiche de A à Z', 'Cas pratique complet pour une affiche d''événement.', '14 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0),
  (mb, 'Export et partage de vos créations', 'Formats d''export, téléchargement, partage et impression.', '6 min', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 0);
END $$;
