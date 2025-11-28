interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'FDC Tracking App',
    description: `A modern web application for AFATDS operators to manage ammunition tracking, launcher assignments, and report generation. Built with React, TypeScript, and Vite to streamline artillery operations.`,
    href: 'https://fdc-tracking-app.vercel.app/',
  },
]

export default projectsData
