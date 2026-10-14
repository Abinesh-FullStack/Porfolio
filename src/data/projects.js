// Projects. `url` stays null until a real, public link exists — the card then
// shows "Preview only" instead of a clickable button.
// status: 'professional' | 'completed' | 'in-progress' | 'learning'
// visual: one of 'hrms' | 'analyst' | 'attrition' | 'dashboard' | 'crud' (see ProjectVisual.jsx)

export const projects = [
  {
    id: 'hrms',
    title: 'HRMS Application',
    category: 'Full Stack Development',
    status: 'professional',
    description:
      'An HRMS application covering employee-related business processes and performance management, built as part of professional work.',
    tech: ['Django', 'Python', 'HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'MySQL', 'PostgreSQL'],
    url: null,
    note: 'Company project — source code and data are confidential.',
    visual: 'hrms',
  },
  {
    id: 'ai-analyst',
    title: 'AI Data Analyst',
    category: 'AI / Data Analytics',
    status: 'in-progress',
    description:
      'A data analytics application built around uploading datasets, processing them, and generating useful analytical insights.',
    tech: ['FastAPI', 'React', 'Python', 'Pandas'],
    url: null,
    visual: 'analyst',
  },
  {
    id: 'attrition',
    title: 'Employee Attrition Predictor',
    category: 'AI / Machine Learning',
    status: 'learning',
    description:
      'An exploratory learning project for analysing employee data and predicting potential attrition patterns.',
    tech: ['Python', 'Pandas', 'Machine Learning'],
    url: null,
    visual: 'attrition',
  },
  {
    id: 'dashboards',
    title: 'Data Analytics Dashboards',
    category: 'Data Analytics',
    status: 'completed',
    description:
      'Work focused on data cleaning, analysis, KPI tracking and dashboard visualisation using Excel and Power BI.',
    tech: ['Microsoft Excel', 'Power BI', 'Data Cleaning', 'KPI Analysis'],
    url: null,
    visual: 'dashboard',
  },
  {
    id: 'crud',
    title: 'React & Node.js CRUD App',
    category: 'Full Stack Development',
    status: 'completed',
    description:
      'A CRUD application demonstrating frontend interactions, backend APIs and database operations end to end.',
    tech: ['React', 'Node.js', 'Express.js', 'REST APIs'],
    url: null,
    visual: 'crud',
  },
]

export const statusLabels = {
  professional: 'Professional work',
  completed: 'Completed',
  'in-progress': 'In progress',
  learning: 'Learning project',
}
