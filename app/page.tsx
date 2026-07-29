import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { getHomeData } from "@/lib/tmdb";

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <main>
      <Header />
      <Hero item={data.hero} />
      <div className="catalog pageWidth">
        {data.demoMode ? (
          <div className="demoNotice">
            <span>Demo catalog</span>
            Add <code>TMDB_READ_TOKEN</code> to <code>.env.local</code> to load live movie data.
          </div>
        ) : null}

        <MediaRow
          id="trending"
          eyebrow="What everyone is watching"
          title="Trending now"
          items={data.trending}
        />
        <MediaRow
          id="ethiopian"
          eyebrow="Stories from home"
          title="Ethiopian cinema"
          description="A dedicated shelf for films connected to Ethiopia, its languages and its people."
          items={data.ethiopianStories}
        />
        <MediaRow
          id="movies"
          eyebrow="Big screen energy"
          title="Popular movies"
          items={data.popularMovies}
        />
        <section className="editorialBanner">
          <div>
            <span className="sectionEyebrow">Curated weekly</span>
            <h2>One excellent story.<br />Every Friday.</h2>
            <p>Our editorial pick highlights unforgettable filmmaking from Ethiopia, Africa and the world.</p>
          </div>
          <div className="editorialMark" aria-hidden="true">AM</div>
        </section>
        <MediaRow
          id="series"
          eyebrow="Keep watching"
          title="Popular series"
          items={data.popularTV}
        />
        <MediaRow
          eyebrow="Critically acclaimed"
          title="Top rated"
          items={data.topRated}
        />
      </div>
      <Footer />
    </main>
  );
}
