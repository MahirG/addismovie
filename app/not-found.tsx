import Link from "next/link";

export default function NotFound() {
  return (
    <main className="simplePage pageWidth">
      <span className="sectionEyebrow">404</span>
      <h1>That title is off-screen.</h1>
      <p className="simpleLead">The movie or series could not be found in the current catalog.</p>
      <Link className="primaryButton" href="/">Return to AddisMovie</Link>
    </main>
  );
}
