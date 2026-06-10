/**
 * Skills taxonomy used for real skill extraction and matching.
 * Each entry: canonical name, category, aliases, demand weight (0-1),
 * and seniority signal (advanced skills imply technical depth).
 */

export type SkillCategory =
  | "language"
  | "frontend"
  | "backend"
  | "database"
  | "cloud"
  | "devops"
  | "data-ai"
  | "mobile"
  | "testing"
  | "tools"
  | "soft";

export interface SkillDef {
  name: string;
  category: SkillCategory;
  aliases?: string[];
  /** Market demand weight, 0-1. Higher = more valuable on a resume. */
  weight?: number;
  /** Advanced skill that signals technical depth. */
  advanced?: boolean;
}

export const SKILLS: SkillDef[] = [
  // Languages
  { name: "JavaScript", category: "language", aliases: ["js", "ecmascript"], weight: 0.9 },
  { name: "TypeScript", category: "language", aliases: ["ts"], weight: 0.95 },
  { name: "Python", category: "language", weight: 0.95 },
  { name: "Java", category: "language", weight: 0.85 },
  { name: "C++", category: "language", aliases: ["cpp", "c plus plus"], weight: 0.75 },
  { name: "C#", category: "language", aliases: ["c sharp", "dotnet", ".net"], weight: 0.8 },
  { name: "Go", category: "language", aliases: ["golang"], weight: 0.85, advanced: true },
  { name: "Rust", category: "language", weight: 0.8, advanced: true },
  { name: "Ruby", category: "language", weight: 0.6 },
  { name: "PHP", category: "language", weight: 0.6 },
  { name: "Swift", category: "language", weight: 0.7 },
  { name: "Kotlin", category: "language", weight: 0.75 },
  { name: "Scala", category: "language", weight: 0.65, advanced: true },
  { name: "SQL", category: "language", weight: 0.85 },
  { name: "R", category: "language", weight: 0.6 },

  // Frontend
  { name: "React", category: "frontend", aliases: ["react.js", "reactjs"], weight: 0.95 },
  { name: "Next.js", category: "frontend", aliases: ["nextjs", "next js"], weight: 0.9 },
  { name: "Vue", category: "frontend", aliases: ["vue.js", "vuejs"], weight: 0.8 },
  { name: "Angular", category: "frontend", aliases: ["angularjs"], weight: 0.75 },
  { name: "Svelte", category: "frontend", aliases: ["sveltekit"], weight: 0.7 },
  { name: "Tailwind CSS", category: "frontend", aliases: ["tailwind", "tailwindcss"], weight: 0.8 },
  { name: "HTML", category: "frontend", aliases: ["html5"], weight: 0.6 },
  { name: "CSS", category: "frontend", aliases: ["css3", "sass", "scss"], weight: 0.6 },
  { name: "Redux", category: "frontend", weight: 0.7 },
  { name: "Framer Motion", category: "frontend", aliases: ["framer"], weight: 0.55 },

  // Backend
  { name: "Node.js", category: "backend", aliases: ["node", "nodejs"], weight: 0.9 },
  { name: "Express", category: "backend", aliases: ["express.js", "expressjs"], weight: 0.75 },
  { name: "Django", category: "backend", weight: 0.8 },
  { name: "Flask", category: "backend", weight: 0.7 },
  { name: "FastAPI", category: "backend", weight: 0.8, advanced: true },
  { name: "Spring Boot", category: "backend", aliases: ["spring"], weight: 0.8 },
  { name: "NestJS", category: "backend", aliases: ["nest.js"], weight: 0.7 },
  { name: "GraphQL", category: "backend", weight: 0.8, advanced: true },
  { name: "REST API", category: "backend", aliases: ["rest", "restful", "api"], weight: 0.7 },
  { name: "gRPC", category: "backend", weight: 0.65, advanced: true },
  { name: "Microservices", category: "backend", aliases: ["microservice"], weight: 0.85, advanced: true },

  // Databases
  { name: "PostgreSQL", category: "database", aliases: ["postgres"], weight: 0.85 },
  { name: "MySQL", category: "database", weight: 0.75 },
  { name: "MongoDB", category: "database", aliases: ["mongo"], weight: 0.8 },
  { name: "Redis", category: "database", weight: 0.8 },
  { name: "Prisma", category: "database", weight: 0.7 },
  { name: "Elasticsearch", category: "database", aliases: ["elastic search"], weight: 0.7, advanced: true },
  { name: "DynamoDB", category: "database", weight: 0.7, advanced: true },
  { name: "Cassandra", category: "database", weight: 0.6, advanced: true },

  // Cloud
  { name: "AWS", category: "cloud", aliases: ["amazon web services"], weight: 0.95, advanced: true },
  { name: "Google Cloud", category: "cloud", aliases: ["gcp", "google cloud platform"], weight: 0.85, advanced: true },
  { name: "Azure", category: "cloud", aliases: ["microsoft azure"], weight: 0.85, advanced: true },
  { name: "Vercel", category: "cloud", weight: 0.6 },
  { name: "Cloudflare", category: "cloud", weight: 0.65 },

  // DevOps
  { name: "Docker", category: "devops", weight: 0.9, advanced: true },
  { name: "Kubernetes", category: "devops", aliases: ["k8s"], weight: 0.9, advanced: true },
  { name: "CI/CD", category: "devops", aliases: ["cicd", "continuous integration"], weight: 0.8 },
  { name: "Terraform", category: "devops", weight: 0.8, advanced: true },
  { name: "GitHub Actions", category: "devops", aliases: ["github action"], weight: 0.65 },
  { name: "Jenkins", category: "devops", weight: 0.6 },
  { name: "Git", category: "devops", weight: 0.6 },
  { name: "Linux", category: "devops", weight: 0.6 },

  // Data / AI
  { name: "Machine Learning", category: "data-ai", aliases: ["ml"], weight: 0.9, advanced: true },
  { name: "Deep Learning", category: "data-ai", aliases: ["dl"], weight: 0.85, advanced: true },
  { name: "TensorFlow", category: "data-ai", weight: 0.8, advanced: true },
  { name: "PyTorch", category: "data-ai", weight: 0.85, advanced: true },
  { name: "Pandas", category: "data-ai", weight: 0.7 },
  { name: "NumPy", category: "data-ai", weight: 0.65 },
  { name: "scikit-learn", category: "data-ai", aliases: ["sklearn", "scikit learn"], weight: 0.7 },
  { name: "NLP", category: "data-ai", aliases: ["natural language processing"], weight: 0.8, advanced: true },
  { name: "Computer Vision", category: "data-ai", aliases: ["opencv"], weight: 0.8, advanced: true },
  { name: "LLM", category: "data-ai", aliases: ["large language model", "openai", "langchain"], weight: 0.9, advanced: true },
  { name: "Data Analysis", category: "data-ai", aliases: ["data analytics"], weight: 0.75 },
  { name: "Power BI", category: "data-ai", aliases: ["powerbi"], weight: 0.65 },
  { name: "Tableau", category: "data-ai", weight: 0.7 },
  { name: "Apache Spark", category: "data-ai", aliases: ["spark", "pyspark"], weight: 0.75, advanced: true },

  // Mobile
  { name: "React Native", category: "mobile", weight: 0.8 },
  { name: "Flutter", category: "mobile", weight: 0.8 },
  { name: "Android", category: "mobile", weight: 0.7 },
  { name: "iOS", category: "mobile", weight: 0.7 },

  // Testing
  { name: "Jest", category: "testing", weight: 0.6 },
  { name: "Cypress", category: "testing", weight: 0.6 },
  { name: "Playwright", category: "testing", weight: 0.65 },
  { name: "Selenium", category: "testing", weight: 0.55 },
  { name: "Unit Testing", category: "testing", aliases: ["unit test", "tdd"], weight: 0.6 },

  // Tools
  { name: "Jira", category: "tools", weight: 0.5 },
  { name: "Figma", category: "tools", weight: 0.6 },
  { name: "Postman", category: "tools", weight: 0.5 },
  { name: "Agile", category: "tools", aliases: ["scrum"], weight: 0.6 },

  // Frontend (extended)
  { name: "jQuery", category: "frontend", weight: 0.4 },
  { name: "Bootstrap", category: "frontend", weight: 0.45 },
  { name: "Material UI", category: "frontend", aliases: ["mui", "material-ui"], weight: 0.55 },
  { name: "Sass", category: "frontend", aliases: ["scss"], weight: 0.5 },
  { name: "Webpack", category: "frontend", weight: 0.5 },
  { name: "Vite", category: "frontend", weight: 0.55 },
  { name: "Zustand", category: "frontend", weight: 0.5 },
  { name: "React Query", category: "frontend", aliases: ["tanstack query"], weight: 0.6 },

  // Backend (extended)
  { name: "ASP.NET", category: "backend", aliases: ["asp net", ".net core", "dotnet core"], weight: 0.7 },
  { name: "Hibernate", category: "backend", weight: 0.55 },
  { name: "Kafka", category: "backend", aliases: ["apache kafka"], weight: 0.8, advanced: true },
  { name: "RabbitMQ", category: "backend", weight: 0.65, advanced: true },
  { name: "Nginx", category: "backend", weight: 0.6 },
  { name: "System Design", category: "backend", aliases: ["system architecture", "software architecture"], weight: 0.85, advanced: true },
  { name: "Data Structures", category: "backend", aliases: ["data structures and algorithms", "dsa"], weight: 0.7 },
  { name: "OOP", category: "backend", aliases: ["object oriented", "object-oriented programming"], weight: 0.55 },
  { name: "WebSockets", category: "backend", aliases: ["websocket", "socket.io"], weight: 0.65 },

  // Databases (extended)
  { name: "Firebase", category: "database", weight: 0.65 },
  { name: "Supabase", category: "database", weight: 0.6 },
  { name: "SQLite", category: "database", weight: 0.5 },
  { name: "Oracle", category: "database", aliases: ["oracle db"], weight: 0.6 },
  { name: "SQL Server", category: "database", aliases: ["mssql", "microsoft sql"], weight: 0.6 },

  // DevOps / Cloud (extended)
  { name: "Ansible", category: "devops", weight: 0.65, advanced: true },
  { name: "Prometheus", category: "devops", weight: 0.6, advanced: true },
  { name: "Grafana", category: "devops", weight: 0.55 },
  { name: "Azure DevOps", category: "devops", weight: 0.6 },

  // Data / AI (extended)
  { name: "Matplotlib", category: "data-ai", weight: 0.5 },
  { name: "Excel", category: "data-ai", aliases: ["microsoft excel", "advanced excel"], weight: 0.45 },
  { name: "Looker", category: "data-ai", weight: 0.6 },
  { name: "Hugging Face", category: "data-ai", aliases: ["huggingface", "transformers"], weight: 0.75, advanced: true },

  // Testing (extended)
  { name: "Vitest", category: "testing", weight: 0.55 },
  { name: "JUnit", category: "testing", weight: 0.5 },
  { name: "Mocha", category: "testing", weight: 0.45 },

  // Tools (extended)
  { name: "Confluence", category: "tools", weight: 0.4 },
  { name: "Notion", category: "tools", weight: 0.4 },
  { name: "Storybook", category: "tools", weight: 0.5 },

  // Soft skills
  { name: "Leadership", category: "soft", aliases: ["team lead", "mentoring"], weight: 0.7 },
  { name: "Communication", category: "soft", weight: 0.6 },
  { name: "Problem Solving", category: "soft", aliases: ["problem-solving"], weight: 0.6 },
  { name: "Collaboration", category: "soft", aliases: ["teamwork"], weight: 0.55 },
  { name: "Project Management", category: "soft", weight: 0.65 },
];

/** Fast lookup map: lowercased name/alias -> canonical SkillDef. */
export const SKILL_INDEX: Map<string, SkillDef> = (() => {
  const map = new Map<string, SkillDef>();
  for (const skill of SKILLS) {
    map.set(skill.name.toLowerCase(), skill);
    for (const alias of skill.aliases ?? []) map.set(alias.toLowerCase(), skill);
  }
  return map;
})();

/** Role -> skill blueprint, used by skill-gap and career engines. */
export interface RoleBlueprint {
  role: string;
  core: string[];
  emerging: string[];
  category: SkillCategory[];
}

export const ROLE_BLUEPRINTS: RoleBlueprint[] = [
  {
    role: "Frontend Developer",
    core: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Next.js", "Tailwind CSS", "Redux", "REST API"],
    emerging: ["Framer Motion", "GraphQL", "Playwright"],
    category: ["frontend", "language"],
  },
  {
    role: "Backend Developer",
    core: ["Node.js", "Python", "SQL", "PostgreSQL", "REST API", "Docker", "Express", "Redis"],
    emerging: ["GraphQL", "Microservices", "gRPC", "Kubernetes"],
    category: ["backend", "database"],
  },
  {
    role: "Full Stack Developer",
    core: ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL", "REST API", "Docker", "Next.js"],
    emerging: ["GraphQL", "Microservices", "AWS", "Kubernetes"],
    category: ["frontend", "backend", "database"],
  },
  {
    role: "AI / ML Engineer",
    core: ["Python", "Machine Learning", "PyTorch", "TensorFlow", "Pandas", "NumPy", "SQL"],
    emerging: ["LLM", "NLP", "Computer Vision", "Apache Spark"],
    category: ["data-ai", "language"],
  },
  {
    role: "Data Analyst",
    core: ["SQL", "Python", "Data Analysis", "Tableau", "Power BI", "Pandas"],
    emerging: ["Apache Spark", "Machine Learning"],
    category: ["data-ai", "database"],
  },
  {
    role: "DevOps Engineer",
    core: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Git"],
    emerging: ["GitHub Actions", "Microservices", "Google Cloud"],
    category: ["devops", "cloud"],
  },
  {
    role: "Mobile Developer",
    core: ["React Native", "Flutter", "JavaScript", "TypeScript", "REST API"],
    emerging: ["Kotlin", "Swift"],
    category: ["mobile"],
  },
];
