import Link from "next/link";
import { ArrowLeft, Database, ExternalLink, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function CreditsPage() {
  return (
    <main>
      <Header />
      <div className="simplePage pageWidth">
        <Link className="backLink" href="/"><ArrowLeft size={17} /> Back home</Link>
        <span className="sectionEyebrow">Transparency</span>
        <h1>Data & legal credits</h1>
        <p className="simpleLead">
          AddisMovie is a discovery interface. It does not host, upload, mirror or distribute movies or TV episodes.
        </p>
        <div className="creditGrid">
          <article>
            <Database size={24} />
            <h2>TMDB</h2>
            <p>Movie, TV, image, cast and trailer metadata is loaded from The Movie Database when a TMDB token is configured.</p>
            <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">Visit TMDB <ExternalLink size={15} /></a>
          </article>
          <article>
            <ShieldCheck size={24} />
            <h2>JustWatch</h2>
            <p>Streaming, rental and purchase availability displayed by TMDB is powered by JustWatch and varies by country.</p>
            <a href="https://www.justwatch.com" target="_blank" rel="noreferrer">Visit JustWatch <ExternalLink size={15} /></a>
          </article>
        </div>
        <div className="legalNotice">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>
      <Footer />
    </main>
  );
}
