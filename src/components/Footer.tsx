import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brown text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <Image
          src="/rabbi-silverstein.jpg"
          alt="Rabbi Odom Silverstein"
          width={104}
          height={104}
          className="rounded-full mx-auto mb-5 ring-2 ring-amber/40 shadow-lg shadow-black/30 object-cover"
        />
        <p className="serif-heading text-amber text-xl font-bold mb-2">Rabbi Odom Silverstein</p>
        <p className="text-sm mb-6">
          5 Minute Nefesh HaChaim &bull; 5 Minute Tanya &bull; Bitachon &bull; Parsha
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link href="/about" className="hover:text-amber transition-colors text-sm">About</Link>
          <a href="https://open.spotify.com/show/1YHYBjDG0AbKzkOftmrZz1" target="_blank" rel="noopener noreferrer"
            className="hover:text-amber transition-colors text-sm">Spotify</a>
          <a href="https://listen.jewishpodcasts.fm/rabbiodomsilverstein" target="_blank" rel="noopener noreferrer"
            className="hover:text-amber transition-colors text-sm">JewishPodcasts</a>
          <a href="mailto:odsilverstein@gmail.com" className="hover:text-amber transition-colors text-sm">Contact</a>
        </div>
        <p className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} Rabbi Odom Silverstein. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
