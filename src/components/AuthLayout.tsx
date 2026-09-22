import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

const DefaultIcon = (
  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const AuthLayout = ({ title, subtitle, icon, children, footer }: AuthLayoutProps) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          {icon ?? DefaultIcon}
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}

      <div className="mt-10 flex flex-col items-center gap-0.5">
        <p className="text-xs text-muted-foreground/60">© Media Compassion Bruxelles</p>
        <p className="text-xs text-muted-foreground/40">Powered by <span className="font-medium text-muted-foreground/60">Martinez Muzela</span></p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
