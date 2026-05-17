import { useNavigate } from 'react-router-dom'
import styles from './Index.module.css'

function FloatingDot({ className, delay }: { className: string; delay: number }) {
  return <span className={`${styles.floatingDot} ${className}`} style={{ animationDelay: `${delay}s` }} aria-hidden />
}

export function Index() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <FloatingDot className={styles.dotA} delay={0} />
      <FloatingDot className={styles.dotB} delay={1.5} />
      <FloatingDot className={styles.dotC} delay={0.8} />
      <FloatingDot className={styles.dotD} delay={2.2} />

      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandBadge}>✦</span>
          <span className={styles.brandText}>SmartPath Kids</span>
        </div>
        <button type="button" className={styles.navButton} onClick={() => navigate('/app')}>
          Get Started
        </button>
      </nav>

      <main className={styles.main}>
        <section className={styles.copy}>
          <span className={styles.chip}>✨ Smart Kids, Safe Choices</span>
          <h1 className={styles.title}>
            <span>Welcome to</span>
            <br />
            <span className={styles.titleAccent}>SmartPath Kids</span>
          </h1>
          <p className={styles.body}>
            Think of this app as a friendly, wise big sibling for your child—guiding them through playful
            real-life stories that teach how to spot common scams.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => navigate('/app')}>
              Start Exploring
            </button>
            <button type="button" className={styles.secondary}>
              I&apos;m a Parent
            </button>
          </div>
        </section>

        <section className={styles.heroCard} aria-label="A magical treehouse and animal friends illustration">
          <div className={styles.heroEmoji}>🌳🦊🐰✨</div>
          <p className={styles.heroCaption}>A magical garden treehouse with friendly animals</p>
        </section>
      </main>
    </div>
  )
}
