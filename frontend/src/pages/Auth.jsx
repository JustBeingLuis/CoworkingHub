import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button, Input, Label } from '../components/ui/Forms';
import { CheckCircle2, Moon, Sun, ArrowRight, Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { cn } from '../utils/utils';

const Auth = () => {
  const { user, login, register } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      if (isLogin) {
        if (!data.correoLogin || !data.passwordLogin) {
          throw new Error('Debes completar correo y contraseña.');
        }
        await login(data.correoLogin.trim().toLowerCase(), data.passwordLogin);
      } else {
        if (!data.nombre || !data.correoRegistro || !data.passwordRegistro || !data.confirmacion) {
          throw new Error('Todos los campos son obligatorios.');
        }
        if (data.passwordRegistro.length < 8) {
          throw new Error('La contraseña debe tener mínimo 8 caracteres.');
        }
        if (data.passwordRegistro !== data.confirmacion) {
          throw new Error('La confirmación de la contraseña no coincide.');
        }
        const resp = await register(data.nombre.trim(), data.correoRegistro.trim().toLowerCase(), data.passwordRegistro);
        setSuccess(`Cuenta creada para ${resp.nombre}. Ya puedes iniciar sesión.`);
        setIsLogin(true);
        e.target.reset();
      }
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg relative overflow-hidden transition-colors duration-500">
      
      {/* Floating Toolbar (Theme & Language) */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <LanguageSwitcher className="bg-white/40 backdrop-blur-md dark:bg-zinc-900/50 hover:bg-white/60 dark:hover:bg-zinc-800/80" />
        <button
          onClick={toggleTheme}
          className="rounded-full bg-white/20 p-2 text-slate-800 backdrop-blur-md transition-all hover:scale-110 hover:bg-white/40 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:bg-zinc-800/80 shadow-lg border border-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Left Interface: Form Area */}
      <div className="relative z-20 flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 xl:px-24">
        {/* Subtle glowing orb behind form for Dark Mode depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 hidden dark:block pointer-events-none"></div>

        <div className="mx-auto w-full max-w-sm lg:w-[400px]">
          <div className="mb-10 transform transition-all duration-700 hover:translate-x-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-primary dark:to-amber-200 pb-2">
              CoworkingHub.
            </h1>
            <p className="text-sm font-semibold text-muted-fg tracking-widest uppercase mt-1">
              Tu portal de trabajo élite
            </p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-zinc-950/80 dark:shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-fg">
                {isLogin ? t('auth.welcomeBack') : t('auth.requestPass')}
              </h2>
              <p className="mt-2 text-sm text-muted-fg">
                {isLogin ? t('auth.loginDesc') : t('auth.registerDesc')}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={cn("space-y-5 transition-all duration-500", isLogin ? "opacity-100" : "opacity-100")}>
                {!isLogin && (
                  <div className="space-y-2 group">
                    <Label htmlFor="nombre" className="group-focus-within:text-primary transition-colors">{t('auth.fullName')}</Label>
                    <Input id="nombre" name="nombre" placeholder={t('auth.namePlaceholder')} disabled={loading} className="bg-transparent backdrop-blur-sm transition-all focus:scale-[1.02]" />
                  </div>
                )}

                <div className="space-y-2 group">
                  <Label htmlFor={isLogin ? 'correoLogin' : 'correoRegistro'} className="group-focus-within:text-primary transition-colors">{t('auth.email')}</Label>
                  <Input 
                    id={isLogin ? 'correoLogin' : 'correoRegistro'} 
                    name={isLogin ? 'correoLogin' : 'correoRegistro'}
                    type="email" 
                    placeholder={t('auth.emailPlaceholder')}
                    disabled={loading}
                    className="bg-transparent backdrop-blur-sm transition-all focus:scale-[1.02]"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor={isLogin ? 'passwordLogin' : 'passwordRegistro'} className="group-focus-within:text-primary transition-colors">{t('auth.password')}</Label>
                  <Input 
                    id={isLogin ? 'passwordLogin' : 'passwordRegistro'} 
                    name={isLogin ? 'passwordLogin' : 'passwordRegistro'}
                    type="password" 
                    placeholder={isLogin ? t('auth.passwordLoginPlaceholder') : t('auth.passwordRegisterPlaceholder')}
                    disabled={loading}
                    className="bg-transparent backdrop-blur-sm transition-all focus:scale-[1.02]"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2 group">
                    <Label htmlFor="confirmacion" className="group-focus-within:text-primary transition-colors">{t('auth.confirmPassword')}</Label>
                    <Input id="confirmacion" name="confirmacion" type="password" placeholder={t('auth.confirmPlaceholder')} disabled={loading} className="bg-transparent backdrop-blur-sm transition-all focus:scale-[1.02]" />
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                   <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{success}</p>
                </div>
              )}

              <Button type="submit" className="group w-full py-6 text-base font-bold shadow-lg transition-all hover:translate-y-[-2px] hover:shadow-primary/20 dark:hover:shadow-primary/10" disabled={loading}>
                <span className="flex items-center gap-2">
                  {loading ? t('auth.processing') : (isLogin ? t('auth.signInBtn') : t('auth.registerBtn'))}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </span>
              </Button>
            </form>

            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-muted-fg">
                {isLogin ? t('auth.lookingSpace') : t('auth.alreadyMember')}
              </span>
              <button 
                type="button" 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="relative text-primary font-bold after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 disabled:opacity-50"
              >
                {isLogin ? t('auth.registerHere') : t('auth.loginHere')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
       {/* Right Interface: Interactive Premium Branding Banner */}
       <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start bg-slate-100 px-16 relative overflow-hidden transition-colors duration-500 shadow-inner dark:bg-slate-950">
        {/* Dynamic Abstract Background Layer (Glassmorphism & Gloom) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          {/* Premium Glowing Orbs */}
          <div className="absolute -top-48 -right-48 w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[120px] transition-all duration-1000 animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-amber-600/10 blur-[100px]"></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]"></div>
        </div>
        
        <div className="relative z-10 max-w-xl text-slate-900 space-y-10 group dark:text-white">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary-hover backdrop-blur-sm">
              <Sparkles className="h-4 w-4" /> {t('auth.brandSloganBadge')}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
              {t('auth.brandElevate')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500 dark:from-primary dark:to-amber-200">
                {t('auth.brandProductivity')}
              </span>
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed font-light dark:text-zinc-400">
              {t('auth.brandDesc')}
            </p>
          </div>
          
          <div className="space-y-5 pt-6 border-t border-slate-300 dark:border-zinc-800">
            <div className="flex items-center gap-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors shadow-[0_0_15px_rgba(212,175,55,0.15)] dark:group-hover/item:text-zinc-950">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">{t('auth.benefit1Title')}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-500">{t('auth.benefit1Desc')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group/item hover:translate-x-2 transition-transform duration-300">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors shadow-[0_0_15px_rgba(212,175,55,0.15)] dark:group-hover/item:text-zinc-950">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-zinc-100">{t('auth.benefit2Title')}</h3>
                <p className="text-sm text-slate-600 dark:text-zinc-500">{t('auth.benefit2Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
