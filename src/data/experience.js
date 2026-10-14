// Experience timeline. Add another company by appending to `experience`.
// Each company has `phases` (rendered as timeline nodes, newest first).

export const experience = [
  {
    company: 'Kenshin Systems Pvt Ltd',
    role: 'Full Stack Developer',
    start: '23 September 2024',
    end: 'Present',
    current: true,
    phases: [
      {
        year: '2026',
        title: 'Expanding into data & dynamic HRMS',
        highlights: [
          'Worked on Takasago screens and Dynamic HRMS-related development.',
          'Worked on data analysis projects.',
          'Continued developing skills across web development, testing, automation and analytics.',
        ],
        tech: ['Web Development', 'Testing', 'Automation', 'Data Analytics'],
        award: null,
      },
      {
        year: '2025',
        title: 'Broadening across products',
        highlights: [
          'Worked on CLMS, Kanban, 2C and Bigtech MES screens.',
          'Built and maintained a Python-based ticketing tool.',
          'Gained experience with Tailwind CSS, REST APIs and PostgreSQL.',
        ],
        tech: ['Tailwind CSS', 'REST APIs', 'PostgreSQL', 'Python'],
        award: 'Performer Award',
      },
      {
        year: '2024',
        title: 'Joining & HRMS Performance module',
        highlights: [
          'Worked on the KYB HRMS Performance module.',
          'Contributed to on-time delivery.',
          'Developed skills in HTML, CSS, JavaScript, Bootstrap, Python, Django and MySQL.',
        ],
        tech: ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'Python', 'Django', 'MySQL'],
        award: 'Raising Star Award',
      },
    ],
  },
]
