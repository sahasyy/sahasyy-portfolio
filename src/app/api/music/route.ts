import { NextResponse } from "next/server";

const LASTFM_API = "https://ws.audioscrobbler.com/2.0/";

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  const username = process.env.LASTFM_USERNAME;

  if (!apiKey || !username) {
    return NextResponse.json({ isPlaying: false });
  }

  try {
    const url = `${LASTFM_API}?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`;

    const response = await fetch(url, { next: { revalidate: 30 } });
    const data = await response.json();

    const track = data?.recenttracks?.track?.[0];

    if (!track) {
      return NextResponse.json({ isPlaying: false });
    }

    const isNowPlaying = track["@attr"]?.nowplaying === "true";

    return NextResponse.json({
      isPlaying: isNowPlaying,
      title: track.name,
      artist: track.artist["#text"],
      url: track.url,
    });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}