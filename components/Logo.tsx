import Link from "next/link";

export function Logo() {
  return (
    <Link className="brand" href="/" aria-label="AddisMovie home">
      <span className="brandMark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>Addis<span>Movie</span></span>
    </Link>
  );
}
