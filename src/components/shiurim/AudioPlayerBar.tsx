"use client";

import { useAudioPlayer } from "./AudioPlayerProvider";
import AudioPlayer from "./AudioPlayer";

export default function AudioPlayerBar() {
  const { playerState, togglePlayPause, seek, setPlaybackRate, closePlayer } = useAudioPlayer();
  if (!playerState.currentShiur) return null;
  return (
    <AudioPlayer
      shiur={playerState.currentShiur} isPlaying={playerState.isPlaying}
      currentTime={playerState.currentTime} duration={playerState.duration} playbackRate={playerState.playbackRate}
      onTogglePlay={togglePlayPause} onSeek={seek} onSetRate={setPlaybackRate} onClose={closePlayer}
    />
  );
}
