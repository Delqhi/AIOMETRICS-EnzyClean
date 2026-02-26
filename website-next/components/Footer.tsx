import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-rail" aria-hidden>
          <span>{site.signals[0]}</span>
          <span>{site.signals[1]}</span>
          <span>{site.signals[2]}</span>
          <span>{site.signals[3]}</span>
        </div>

        <div className="site-footer-grid">
          <section>
            <Link href="/" className="site-brand">
              <span className="site-brand-mark" aria-hidden>
                {site.short}
              </span>
              <span className="site-brand-copy">
                <span className="site-brand-title">{site.name}</span>
                <span className="site-brand-sub">{site.subtitle}</span>
              </span>
            </Link>
            <p>{site.heroBody}</p>
          </section>

          <section>
            <h3>Product</h3>
            <ul>
              <li><Link href="/patent">Patent</Link></li>
              <li><Link href="/technology">Technology</Link></li>
              <li><Link href="/market">Market</Link></li>
              <li><Link href="/problems">Problems</Link></li>
              <li><Link href="/prototype">Prototype</Link></li>
            </ul>
          </section>

          <section>
            <h3>Company</h3>
            <ul>
              <li><Link href="/investors">Investors</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/waitlist">Join Waitlist</Link></li>
              <li><Link href="/donate">Donate</Link></li>
            </ul>
          </section>

          <section>
            <h3>Contact</h3>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href="https://artificial-biometrics.com" target="_blank" rel="noreferrer">AIOMETRICS Main NGO</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </section>
        </div>

        <p className="site-footer-foot">© {new Date().getFullYear()} {site.name}. Part of Artificial Biometrics.</p>
      </div>
    </footer>
  );
}
