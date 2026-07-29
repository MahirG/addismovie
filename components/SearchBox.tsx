"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TitleItem } from "@/types";

function year(item: TitleItem) {
  return (item.release_date || item.first_air_date || "").slice(0, 4) || "Soon";
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TitleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { results: TitleItem[] };
        setResults(data.results);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 260);

    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <div className="searchShell">
      <Search size={18} aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search movies, series, actors..."
        aria-label="Search movies and TV shows"
      />
      {query ? (
        <button className="searchClear" onClick={() => setQuery("")} aria-label="Clear search">
          <X size={16} />
        </button>
      ) : null}

      {query.trim().length >= 2 ? (
        <div className="searchResults">
          <div className="searchResultHeader">
            <span>{loading ? "Searching..." : `${results.length} results`}</span>
            <span>TMDB</span>
          </div>
          {!loading && results.length === 0 ? (
            <div className="searchEmpty">No titles matched “{query}”.</div>
          ) : null}
          {results.map((item) => (
            <Link
              key={`${item.media_type}-${item.id}`}
              href={`/title/${item.media_type}/${item.id}`}
              className="searchResultItem"
              onClick={() => setQuery("")}
            >
              <div className={`searchThumb ${item.poster_path ? "hasImage" : ""}`}>
                {item.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                    alt=""
                    fill
                    sizes="48px"
                  />
                ) : (
                  <span>{item.title.slice(0, 1)}</span>
                )}
              </div>
              <div>
                <strong>{item.title}</strong>
                <span>{year(item)} · {item.media_type === "tv" ? "Series" : "Movie"}</span>
              </div>
              <span className="searchScore">{item.vote_average.toFixed(1)}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
