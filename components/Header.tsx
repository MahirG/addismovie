"use client";

import Link from "next/link";
import { Bookmark, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { SearchBox } from "@/components/SearchBox";

export function Header() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`siteHeader ${compact ? "compact" : ""}`}>
      <div className="headerInner">
        <Logo />
        <nav className="desktopNav" aria-label="Primary navigation">
          <Link href="#trending">Trending</Link>
          <Link href="#movies">Movies</Link>
          <Link href="#series">Series</Link>
          <Link href="#ethiopian">Ethiopian</Link>
        </nav>
        <div className="headerSearch"><SearchBox /></div>
        <button className="watchlistButton" aria-label="Open watchlist">
          <Bookmark size={18} />
          <span>Watchlist</span>
        </button>
        <button className="menuButton" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <div className="mobilePanel">
          <SearchBox />
          <nav aria-label="Mobile navigation">
            <Link href="#trending" onClick={() => setOpen(false)}>Trending</Link>
            <Link href="#movies" onClick={() => setOpen(false)}>Movies</Link>
            <Link href="#series" onClick={() => setOpen(false)}>Series</Link>
            <Link href="#ethiopian" onClick={() => setOpen(false)}>Ethiopian Stories</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
