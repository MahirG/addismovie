import type { Metadata } from "next";
import { EthiopianCinemaHub } from "@/components/EthiopianCinemaHub";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ETHIOPIAN_CHANNELS,
  getOfficialEthiopianVideos,
} from "@/lib/ethiopian-youtube";
import { getLicensedMovies } from "@/lib/licensed-media";

export const metadata: Metadata = {
  title: "Watch Ethiopian Movies — AddisMovie",
  description:
    "Watch licensed and publisher-authorized Ethiopian movies through the AddisMovie internal player.",
};

export const revalidate = 1800;

export default async function EthiopianMoviesPage() {
  const [{ configured, videos }, licensedVideos] = await Promise.all([
    getOfficialEthiopianVideos(),
    Promise.resolve(getLicensedMovies()),
  ]);

  return (
    <main>
      <Header />
      <EthiopianCinemaHub
        channels={ETHIOPIAN_CHANNELS}
        videos={videos}
        licensedVideos={licensedVideos}
        apiConfigured={configured}
      />
      <Footer />
    </main>
  );
}
