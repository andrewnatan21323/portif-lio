import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { profile, project, skills, internshipActivities } from "@/lib/profile";

const Scene3D = lazy(() => import("@/components/Scene3D"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Andrew Natan — Estudante de TI e Desenvolvedor em formação" },
      { name: "description", content: "Portfólio de Andrew Natan: estudante de Tecnologia da Informação, estagiário na Superlógica e criador de um projeto de agendamento para barbearias." },
      { property: "og:title", content: "Andrew Natan — Portfólio" },
      { property: "og:description", content: "Transformando ideias em experiências digitais funcionais, modernas e intuitivas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PANELS = [
  { id: "inicio", label: "Início" },
  { id: "sobre", label: "Sobre" },
  { id: "projetos", label: "Projetos" },
];

function Index() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const lock = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setMounted(true), []);

  const go = useCallback((i: number) => {
    const next = Math.max(0, Math.min(PANELS.length - 1, i));
    if (lock.current) return;
    setActive((cur) => {
      if (cur === next) return cur;
      lock.current = true;
      setTimeout(() => (lock.current = false), 700);
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const idx = PANELS.findIndex((p) => p.id === hash);
    if (idx > 0) setActive(idx);
  }, []);
  useEffect(() => {
    const panel = PANELS[active];
    if (mounted && panel) history.replaceState(null, "", `#${panel.id}`);
  }, [active, mounted]);

  const onTouchStart = (e: React.TouchEvent) => {
    const point = e.touches[0];
    if (!point) return;
    touch.current = { x: point.clientX, y: point.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const point = e.changedTouches[0];
    if (!touch.current || !point) return;
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    touch.current = null;
    if ((e.target as HTMLElement).closest("canvas")) return;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header active={active} go={go} />

      <main
        className="relative flex-1 overflow-clip"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="panels-track flex h-full w-[300%]"
          style={{ transform: `translate3d(-${(active * 100) / 3}%,0,0)` }}
        >
          <Panel index={0} active={active}>
            <Hero go={go} active={active === 0} mounted={mounted} />
          </Panel>
          <Panel index={1} active={active}>
            <About />
          </Panel>
          <Panel index={2} active={active}>
            <Projects />
          </Panel>
        </div>
      </main>

      <Footer active={active} go={go} />
    </div>
  );
}

function Panel({ index, active, children }: { index: number; active: number; children: ReactNode }) {
  const panel = PANELS[index];
  if (!panel) return null;
  const isActive = index === active;
  return (
    <section
      id={panel.id}
      aria-label={`${String(index + 1).padStart(2, "0")} — ${panel.label}`}
      aria-hidden={!isActive}
      inert={!isActive}
      data-active={isActive}
      className="panel h-full w-1/3 overflow-y-auto overflow-x-hidden"
    >
      <div className="mx-auto flex min-h-full max-w-7xl flex-col justify-center px-6 py-10 md:px-12">
        {children}
      </div>
    </section>
  );
}

function Header({ active, go }: { active: number; go: (i: number) => void }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
      <button onClick={() => go(0)} aria-label="Ir para o início" className="group flex items-center gap-3">
        <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-primary-foreground transition-transform group-hover:rotate-6">
          AN
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-aqua" />
        </span>
      </button>
      <nav aria-label="Telas" className="hidden items-center gap-1 rounded-full border bg-background/80 p-1 backdrop-blur md:flex">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => go(i)}
            aria-current={active === i ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === i ? "bg-ink text-primary-foreground" : "text-muted-foreground hover:text-aqua-deep"}`}
          >
            <span className="mr-1.5 text-xs opacity-60">0{i + 1}</span>
            {p.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-line hidden text-sm font-medium text-muted-foreground sm:inline">
          GitHub
        </a>
        <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2.5 !text-sm">
          Contato
        </a>
      </div>
    </header>
  );
}

function Footer({ active, go }: { active: number; go: (i: number) => void }) {
  return (
    <footer className="relative z-10 flex items-center justify-between gap-4 px-6 py-4 md:px-12">
      <p className="font-display text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-ink">0{active + 1}</span> — {PANELS[active]?.label}
      </p>
      <div className="flex items-center gap-2" aria-label="Progresso">
        {PANELS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => go(i)}
            aria-label={`Ir para ${p.label}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-10 bg-aqua-deep" : "w-4 bg-border hover:bg-aqua"}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => go(active - 1)} disabled={active === 0} aria-label="Tela anterior" className="grid h-10 w-10 place-items-center rounded-full border transition hover:border-aqua hover:text-aqua-deep disabled:opacity-30">
          ←
        </button>
        <button onClick={() => go(active + 1)} disabled={active === PANELS.length - 1} aria-label="Próxima tela" className="grid h-10 w-10 place-items-center rounded-full border transition hover:border-aqua hover:text-aqua-deep disabled:opacity-30">
          →
        </button>
      </div>
    </footer>
  );
}

function Hero({ go, active, mounted }: { go: (i: number) => void; active: boolean; mounted: boolean }) {
  return (
    <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="grid-dots pointer-events-none absolute -left-10 top-0 h-40 w-40 opacity-70" aria-hidden />
      <div className="relative">
        <p className="eyebrow reveal">Portfólio pessoal • Tecnologia</p>
        <h1 className="reveal mt-5 text-6xl font-bold leading-[0.9] text-ink sm:text-7xl xl:text-8xl">
          Andrew<br />
          <span className="text-aqua-deep">Natan</span>
          <span className="text-aqua">.</span>
        </h1>
        <div className="reveal">
          <p className="mt-6 font-display text-xl font-medium text-ink">Estudante de TI | Desenvolvedor em formação</p>
          <p className="mt-4 max-w-lg text-lg text-ink/80">Transformando ideias em experiências digitais funcionais, modernas e intuitivas.</p>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Tenho interesse em tecnologia e desenvolvimento de software, buscando aprender continuamente e criar soluções digitais úteis e bem construídas.
          </p>
        </div>
        <div className="reveal mt-8 flex flex-wrap gap-3">
          <button onClick={() => go(2)} className="btn-primary">Conheça meus projetos →</button>
          <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">Entre em contato</a>
        </div>
        <div className="reveal mt-6 flex gap-5 text-sm text-muted-foreground">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link-line">github/{profile.githubUser}</a>
          <a href={`mailto:${profile.email}`} className="link-line">{profile.email}</a>
        </div>
      </div>
      <div className="relative h-[340px] sm:h-[440px] lg:h-[560px]">
        <div className="absolute inset-8 rounded-full bg-accent blur-3xl" aria-hidden />
        <div className="float-slow absolute right-6 top-6 h-10 w-10 rounded-lg border-2 border-aqua" aria-hidden />
        <div className="absolute bottom-10 left-4 h-2 w-24 rounded-full bg-aqua-deep/30" aria-hidden />
        <div className="relative h-full">
          {mounted && (
            <Suspense fallback={null}>
              <Scene3D active={active} />
            </Suspense>
          )}
        </div>
        <p className="pointer-events-none absolute bottom-0 right-0 text-xs text-muted-foreground">Arraste para girar ↻</p>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <p className="eyebrow reveal">02 — Sobre</p>
        <h2 className="reveal mt-5 text-5xl font-bold leading-[0.95] text-ink md:text-6xl">
          Tecnologia,<br />aprendizado<br /><span className="text-aqua-deep">e evolução.</span>
        </h2>
        <p className="reveal mt-6 max-w-lg text-lg text-muted-foreground">
          Sou Andrew Natan, estudante de Tecnologia da Informação e estagiário na Superlógica. Tenho interesse em desenvolvimento de software e na criação de soluções digitais que tornem tarefas do dia a dia mais simples e eficientes.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:col-span-6 lg:pt-10">
        <article className="reveal relative overflow-hidden rounded-2xl border bg-secondary p-8 shadow-[var(--shadow-soft)]">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-aqua/20 blur-2xl" aria-hidden />
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-semibold text-aqua-deep">
              <span className="h-2 w-2 animate-pulse rounded-full bg-aqua" /> Experiência atual
            </span>
            <span className="text-xs text-muted-foreground">Estágio</span>
          </div>
          <h3 className="mt-6 text-3xl font-bold text-ink">Superlógica</h3>
          <p className="mt-3 text-muted-foreground">
            Empresa brasileira de tecnologia que desenvolve softwares de gestão e soluções financeiras para o mercado imobiliário, com foco em condomínios, administradoras e imobiliárias.
          </p>
          {internshipActivities && <p className="mt-4 text-ink">{internshipActivities}</p>}
          <a href={profile.company.url} target="_blank" rel="noopener noreferrer" className="link-line mt-5 inline-block text-sm font-semibold text-ink">
            superlogica.com ↗
          </a>
        </article>
        <div className="reveal rounded-2xl border border-dashed p-6">
          <p className="eyebrow">Conhecimentos</p>
          {skills.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Meus conhecimentos técnicos serão atualizados em breve.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {skills.map((s) => (
                <div key={s.group}>
                  <p className="font-display font-semibold text-ink">{s.group}</p>
                  <p className="text-sm text-muted-foreground">{s.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarberMockup() {
  const times = ["09:00", "10:30", "13:00", "15:30"];
  return (
    <div className="relative mx-auto w-[260px]" aria-label="Ilustração conceitual de interface de agendamento" role="img">
      <div className="rounded-[2.4rem] border-[10px] border-ink bg-background p-4 shadow-[var(--shadow-soft)]">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-border" />
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-xs font-bold text-primary-foreground">✂</span>
          <div>
            <p className="font-display text-sm font-bold text-ink">Barbearia</p>
            <p className="text-[10px] text-muted-foreground">Agende seu horário</p>
          </div>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Serviço</p>
        {["Corte", "Barba", "Corte + Barba"].map((s, i) => (
          <div key={s} className={`mt-2 rounded-xl border px-3 py-2 text-xs ${i === 2 ? "border-aqua bg-accent font-semibold text-ink" : "text-muted-foreground"}`}>{s}</div>
        ))}
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Horário</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {times.map((t, i) => (
            <span key={t} className={`rounded-lg py-1.5 text-center text-xs ${i === 1 ? "bg-aqua-deep text-primary-foreground" : "bg-secondary text-ink"}`}>{t}</span>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-ink py-2.5 text-center text-xs font-semibold text-primary-foreground">Agendar</div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">Ilustração conceitual — acesse o site para ver o projeto real</p>
    </div>
  );
}

function Projects() {
  const d = project.details;
  const fields: [string, string | null][] = [
    ["Objetivo", d.objetivo], ["Problema", d.problema], ["Solução", d.solucao],
    ["Tecnologias", d.tecnologias?.join(", ") ?? null],
    ["Funcionalidades", d.funcionalidades?.join(", ") ?? null],
    ["Desafios", d.desafios], ["Aprendizados", d.aprendizados],
  ];
  const filled = fields.filter(([, v]) => v);
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="grid items-center gap-8 lg:col-span-7 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow reveal">03 — Projeto em destaque</p>
          <h2 className="reveal mt-5 text-4xl font-bold leading-[0.95] text-ink md:text-5xl">
            BarberBook<br /><span className="text-aqua-deep">Agendamento Online</span>
          </h2>
          <p className="reveal mt-5 max-w-md text-muted-foreground">{project.description}</p>
          {filled.length > 0 && (
            <dl className="reveal mt-5 space-y-2 text-sm">
              {filled.map(([k, v]) => (
                <div key={k}><dt className="inline font-semibold text-ink">{k}: </dt><dd className="inline text-muted-foreground">{v}</dd></div>
              ))}
            </dl>
          )}
          <div className="reveal mt-7 flex flex-wrap gap-3">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-aqua">Ver projeto ↗</a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">Ver código no GitHub</a>
            )}
            <a href={profile.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost">Entrar em contato</a>
          </div>
          {project.demoUrl && (
            <p className="reveal mt-3 text-xs text-muted-foreground">Site publicado: {project.demoUrl.replace("https://", "")}</p>
          )}
        </div>
        <div className="reveal"><BarberMockup /></div>
      </div>

      <div className="lg:col-span-5">
        <div className="reveal h-full rounded-2xl bg-ink p-8 text-primary-foreground md:p-10">
          <p className="eyebrow !text-aqua">Contato</p>
          <h2 className="mt-4 text-4xl font-bold">Vamos conversar?</h2>
          <p className="mt-3 text-primary-foreground/70">Tem uma oportunidade, uma ideia ou um projeto interessante? Entre em contato.</p>
          <ul className="mt-8 divide-y divide-primary-foreground/10">
            {([
              ["E-mail", profile.email, `mailto:${profile.email}`],
              ["WhatsApp", profile.phoneDisplay, profile.whatsapp],
              ["GitHub", profile.githubUser, profile.github],
            ] as const).map(([k, v, href]) => (
              <li key={k}>
                <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center justify-between py-4">
                  <span>
                    <span className="block text-xs uppercase tracking-widest text-primary-foreground/50">{k}</span>
                    <span className="font-medium transition-colors group-hover:text-aqua">{v}</span>
                  </span>
                  <span className="transition-transform group-hover:translate-x-1 group-hover:text-aqua">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
