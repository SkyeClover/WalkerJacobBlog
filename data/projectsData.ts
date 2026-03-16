interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'DA6 Form Generator',
    description: `A modern web application that automates Army DA6 Duty Roster creation. Built with React, Node.js, and Supabase to eliminate hours of manual work, reduce errors, and ensure compliance with Army regulations. Features intelligent duty assignment, cross-roster checking, and rank-aware sorting.`,
    href: 'https://da6-form-generator.vercel.app/',
  },
  {
    title: 'FDC Tracking App',
    description: `A modern web application for AFATDS operators to manage ammunition tracking, launcher assignments, and report generation. Built with React, TypeScript, and Vite to streamline artillery operations.`,
    href: 'https://fdc-tracking-app.vercel.app/',
  },
  {
    title: 'Walker Safety Calculator',
    description: `A Python application that calculates artillery safety zones using M28A1/A2 (Table G) data. Supports three methods—Point-to-Point, OpArea, and Firing Point—with MGRS input, SDZ/TSB/Area F geometry, and a browser-based UI backed by Flask.`,
    href: 'https://walker-safety-calculator.vercel.app/',
  },
]

export default projectsData
