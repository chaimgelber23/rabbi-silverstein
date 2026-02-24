"use client";

import { useAudioPlayer } from "./AudioPlayerProvider";
import AudioPlayer from "./AudioPlayer";

export default function AudioPlayerBar() {
  const { playerState, togglePlayPause, seek, skipBack, skipForward, setPlaybackRate, closePlayer } = useAudioPlayer();
  if (!playerState.currentShiur) return null;
  return (
    <AudioPlayer
      shiur={playerState.currentShiur} isPlaying={playerState.isPlaying}
      currentTime={playerState.currentTime} duration={playerState.duration} playbackRate={playerState.playbackRate}
      onTogglePlay={togglePlayPause} onSeek={seek} onSkipBack={skipBack} onSkipForward={skipForward} onSetRate={setPlaybackRate} onClose={closePlayer}
    />
  );
}
