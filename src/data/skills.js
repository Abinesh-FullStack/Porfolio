// Add a skill: append a string to `items`. Add a category: append an object.
// `icon` must be a key from ICONS in src/components/SkillCard.jsx.

export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: 'code',
    blurb: 'Interfaces that are responsive, accessible and easy to use.',
    items: ['HTML5', 'CSS3', 'JavaScript', 'React JS', 'Tailwind CSS', 'Bootstrap'],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: 'server',
    blurb: 'Server logic, business workflows and API integration.',
    items: ['Python', 'Django', 'FastAPI', 'Node.js', 'Express.js', 'REST APIs'],
  },
  {
    id: 'database',
    title: 'Database',
    icon: 'database',
    blurb: 'Relational data modelling, queries and management.',
    items: ['MySQL', 'PostgreSQL'],
  },
  {
    id: 'analytics',
    title: 'Data Analytics',
    icon: 'chart',
    blurb: 'Cleaning, exploring and visualising data for decisions.',
    items: ['Microsoft Excel', 'Power BI', 'Pandas', 'Data Cleaning', 'Exploratory Data Analysis', 'Dashboard Development'],
  },
  {
    id: 'testing',
    title: 'Testing',
    icon: 'shield',
    blurb: 'Verifying that software behaves the way it should.',
    items: ['Manual Testing', 'Test Case Design', 'Functional Testing', 'Regression Testing', 'API Testing', 'Automation Testing', 'Selenium', 'Java (Test Automation)'],
  },
  {
    id: 'tools',
    title: 'Tools & Technologies',
    icon: 'wrench',
    blurb: 'Everyday tooling for building and collaborating.',
    items: ['Git', 'GitHub', 'VS Code', 'Postman'],
  },
]
