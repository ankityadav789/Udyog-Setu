import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Bridge Motif */}
            <path d="M4 14C4 14 7.5 8 12 8C16.5 8 20 14 20 14V22H16V16H8V22H4V14Z" fill="#4f46e5"/>
            <path d="M2 14H22" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          UdyogSetu
        </div>
        <div className={styles.actions}>
          <Link href="/onboarding" className={styles.secondaryBtn}>Login</Link>
          <Link href="/onboarding" className={styles.primaryBtn}>Sign Up</Link>
        </div>
      </nav>
      
      <main className={styles.hero}>
        <div className={styles.logoLarge}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 14C4 14 7.5 8 12 8C16.5 8 20 14 20 14V22H16V16H8V22H4V14Z" fill="#4f46e5"/>
              <path d="M2 14H22" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        </div>
        <h1 className={styles.title}>UdyogSetu</h1>
        <p className={styles.subtitle}>Smart billing for every Indian business</p>
        <div className={styles.actionsMain}>
          <Link href="/onboarding" className={styles.primaryBtnLarge}>Start Growing Free</Link>
        </div>
      </main>
    </div>
  );
}
