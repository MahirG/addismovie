import Link from "next/link";
import { ArrowUpRight, Play, Radio, ShieldCheck } from "lucide-react";

export function EthiopianWatchBanner() {
  return (
    <section className="ethiopianWatchBanner" id="watch-ethiopian">
      <div className="ethiopianWatchCopy">
        <span className="sectionEyebrow">Now streaming from official publishers</span>
        <h2>Watch Ethiopian cinema<br />inside AddisMovie.</h2>
        <p>
          Explore full films from trusted Ethiopian YouTube publishers through a
          privacy-enhanced player that keeps every view with the original creator.
        </p>
        <div className="ethiopianWatchActions">
          <Link className="primaryButton" href="/ethiopian">
            <Play size={17} fill="currentColor" /> Watch movies
          </Link>
          <span><ShieldCheck size={16} /> Official embeds only</span>
        </div>
      </div>
      <div className="ethiopianWatchVisual" aria-hidden="true">
        <div className="ethiopianWatchScreen">
          <span className="screenLive"><Radio size={12} /> LIVE SOURCE</span>
          <span className="screenPlay"><Play size={25} fill="currentColor" /></span>
          <strong>አዲስ<br />ሲኒማ</strong>
        </div>
        <span className="ethiopianWatchArrow"><ArrowUpRight size={26} /></span>
      </div>
    </section>
  );
}
