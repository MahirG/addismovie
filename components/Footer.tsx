import Link from "next/link";
import { Github, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="siteFooter">
      <div className="pageWidth footerGrid">
        <div className="footerBrand">
          <Logo />
          <p>Discover movies, series and Ethiopian stories in one elegant, fast experience.</p>
          <div className="socials">
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
            <a href="#" aria-label="GitHub"><Github size={18} /></a>
          </div>
        </div>
        <div>
          <strong>Browse</strong>
          <Link href="#trending">Trending</Link>
          <Link href="#movies">Movies</Link>
          <Link href="#series">TV Series</Link>
        </div>
        <div>
          <strong>AddisMovie</strong>
          <Link href="#ethiopian">Ethiopian stories</Link>
          <Link href="/credits">Data credits</Link>
          <a href="mailto:hello@addismovie.com">Contact</a>
        </div>
        <div className="footerNote">
          <strong>Legal discovery</strong>
          <p>AddisMovie does not host or upload films. Provider availability is supplied by TMDB/JustWatch and trailers are linked from YouTube.</p>
        </div>
      </div>
      <div className="footerBottom pageWidth">
        <span>© 2026 AddisMovie. Built in Addis Ababa.</span>
        <span>This product uses the TMDB API but is not endorsed or certified by TMDB.</span>
      </div>
    </footer>
  );
}
