import { useEffect, useRef, useState } from "react";

interface PaintingAudioProps {
    src: string;
}

export function PaintingAudio(props: PaintingAudioProps) {
    const { src } = props;

    const audioRef = useRef();

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            await audio.play();
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e) => {
        const newVolume = Number(e.target.value);
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    const formatTime = (time) => {
        if (!time || Number.isNaN(time)) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");

        return `${minutes}:${seconds}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="w-full pr-4">
            <audio
                ref={audioRef}
                src={src}
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />

            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-20 w-20 p-2 shrink-0 overflow-hidden rounded-full border-2 border-gray-300">
                    <img
                        src='/images/steen.png'
                        alt=""
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Main controls */}
                <div className="flex flex-1 flex-col gap-2 opacity-50">
                    <div className="text-xs">Listen to Steen to learn more.</div>
                    {/* Progress bar */}
                    <div className="relative h-2 w-full bg-slate-300 rounded-md">
                        <div
                            className="absolute left-0 top-0 h-full bg-black rounded-md"
                            style={{ width: `${progress}%` }}
                        />

                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            aria-label="Seek audio"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            {/* Play / Pause */}
                            <button
                                type="button"
                                onClick={togglePlay}
                                className="flex h-6 w-6 items-center justify-center transition hover:text-slate-500 cursor-pointer"
                                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                            >
                                {isPlaying ? (
                                    <span className="flex gap-1">
                                        <span className="h-5 w-2 bg-current" />
                                        <span className="h-5 w-2 bg-current" />
                                    </span>
                                ) : (
                                    <span className="ml-1 h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-current" />
                                )}
                            </button>

                            {/* Speaker + volume */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 accent-black"
                                    aria-label="Volume"
                                />
                                <SpeakerIcon />
                            </div>
                        </div>

                        {/* Time */}
                        <div className="font-bold tabular-nums">
                            {formatTime(currentTime)}/{formatTime(duration)}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

interface SpeackerProps {
    onClick?: () => void
}

function SpeakerIcon(props: SpeackerProps) {
    const { onClick } = props;
    return (
        <svg
            viewBox="0 0 64 64"
            className="h-8 w-8 fill-current"
            aria-hidden="true"
            onClick={onClick}
        >
            <path d="M8 24h12l18-15v46L20 40H8z" />
            <path
                d="M44 22c4 4 6 7 6 10s-2 6-6 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
            />
            <path
                d="M50 14c7 6 10 12 10 18s-3 12-10 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
            />
        </svg>
    );
}

