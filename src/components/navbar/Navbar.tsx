import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.wrapper}>
      <div className={styles.left}>
        <Link href="/" className={styles.link}>
          Home
        </Link>
      </div>

      <ul className={styles.right}>
        <li>
          <Link href="/login" className={styles.link}>
            Login
          </Link>
        </li>
        <li>
          <Link href="/signup" className={styles.buttonLink}>
            Sign Up
          </Link>
        </li>
        <li>
          <Link href="/profile" className={styles.link}>
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
