import { PortfolioData } from '../../types/portfolio'
import SkillPills from './SkillPills'
import ExperienceSection from './ExperienceSection'
import ProjectsSection from './ProjectsSection'
import EducationSection from './EducationSection'
import CertificationsSection from './CertificationsSection'
import AchievementsSection from './AchievementsSection'

interface Props {
  data: PortfolioData
}

export default function RightColumn({ data }: Props) {
  return (
    <main className="flex flex-col gap-10 min-w-0">
      {data.skills.length > 0 && (
        <section>
          <p className="section-label">Skills</p>
          <SkillPills skills={data.skills} />
        </section>
      )}

      {data.experience.length > 0 && (
        <section>
          <p className="section-label">Experience</p>
          <ExperienceSection experience={data.experience} />
        </section>
      )}

      {data.projects.length > 0 && (
        <section>
          <p className="section-label">Projects</p>
          <ProjectsSection projects={data.projects} />
        </section>
      )}

      {data.education.length > 0 && (
        <section>
          <p className="section-label">Education</p>
          <EducationSection education={data.education} />
        </section>
      )}

      {data.achievements && data.achievements.length > 0 && (
        <section>
          <p className="section-label">Achievements</p>
          <AchievementsSection achievements={data.achievements} />
        </section>
      )}

      {data.certifications.length > 0 && (
        <section>
          <p className="section-label">Certifications</p>
          <CertificationsSection certifications={data.certifications} />
        </section>
      )}
    </main>
  )
}
