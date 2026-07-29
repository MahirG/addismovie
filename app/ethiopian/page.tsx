import type { Metadata } from "next";
import { EthiopianCinemaHub } from "@/components/EthiopianCinemaHub";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  ETHIOPIAN_CHANNELS,
  getOfficialEthiopianVideos,
} from "@/lib/ethiopian-youtube";

export const metadata: Metadata = {
  title: "Watch Ethiopian Movies — AddisMovie",
  description:
    "Watch full Ethiopian movies through official publisher embeds on AddisMovie.",
};

export const revalidate = 1800;

export default async function EthiopianMoviesPage() {
  const { configured, videos } = await getOfficialEthiopianVideos();

  return (
    <main>
      <Header />
      <EthiopianCinemaHub
        channels={ETHIOPIAN_CHANNELS}
        videos={videos}
        apiConfigured={configured}
      />
      <Footer />
    </main>
  );
}
