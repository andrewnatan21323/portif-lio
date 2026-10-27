// Single source of truth for the portfolio's real data.
// Fields set to null are not confirmed yet and stay hidden on the site.

export const profile = {
  name: "Andrew Natan",
  email: "andrewnatanpsn@gmail.com",
  phoneDisplay: "+55 19 98841-5107",
  whatsapp: "https://wa.me/5519988415107",
  github: "https://github.com/andrewnatan21323",
  githubUser: "andrewnatan21323",
  company: { name: "Superlógica", url: "https://superlogica.com/" },
};

// Confirmed skills go here, e.g. { group: "Front-end", items: ["HTML", "CSS"] }.
export const skills: { group: string; items: string[] }[] = [];

// Description of internship activities — fill in once confirmed.
export const internshipActivities: string | null = null;

export const project = {
  name: "BarberBook — Agendamento Online", // provisional name
  description:
    "Projeto pessoal de desenvolvimento de uma solução digital para agendamentos em barbearias, com foco em facilitar a organização de horários e tornar a experiência do cliente mais prática.",
  // Official published address of the barbershop project. Do not change.
  demoUrl: "https://barbearia-do-valter.lovable.app" as string | null,
  repoUrl: null as string | null,
  // Fill only with confirmed facts.
  details: {
    objetivo: null as string | null,
    problema: null as string | null,
    solucao: null as string | null,
    tecnologias: null as string[] | null,
    funcionalidades: null as string[] | null,
    desafios: null as string | null,
    aprendizados: null as string | null,
  },
};
