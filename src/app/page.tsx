"use client";
import { Noto_Serif, Reenie_Beanie } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { setMode, setSelectedPainting } from "../../store/appSlice";
import { State, store } from "../../store/store";
import Painting from "./2d-painting/painting";
import { PaintingTimeline } from "./2d-painting/PaintingTimeline";
import { getSteenPortrait, PaintingAudio } from "./2d-painting/PaintingAudio";
import { PaintingMap } from "./map/PaintingMap";

const reenie_beanie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });
const noto_serif = Noto_Serif({ weight: "400", subsets: ["latin"] });

// const Model = dynamic(() => import("@/components/model-viewer/Model"), {
//   loading: () => <p>Loading...</p>,
//   ssr: false,
// });

const paintings = [
  { key: "start", svgFile: "/images/Title page-1.svg", inactive: true },
  { key: "young", svgFile: "/images/combined_photographs-1.svg" },
  { key: "hjallesevej", svgFile: "/images/3. arrest.svg" },
  { key: "transport", svgFile: "/images/Transport scene-2.svg" },
  { key: "barracks", svgFile: "/images/Barracks.svg" },
  { key: "soccer", svgFile: "/images/Soccer scene-3b.svg" },
  { key: "modelcamp", svgFile: "/images/Model Camp scene-1.svg" },
  { key: "whitebus", svgFile: "/images/White Buses scene-1.svg" },
];

function renderStoryParagraph(text: string, paragraphIndex: number) {
  const quotePattern = /quote\((.*?)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = quotePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <div className="w-full flex flex-row gap-3 items-center">
        {getSteenPortrait()}
        <span className="italic" key={`story-quote-${paragraphIndex}-${match.index}`}>
          "{match[1]}"
        </span>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function renderStoryText(text: string) {
  return text.split("\n").map((paragraph, i) => (
    <p key={`story-text-${i}`}>
      {renderStoryParagraph(paragraph, i)}
    </p>
  ));
}

export interface MapEntry {
  title: string;
  mapyear?: number;
  start: { lat: number, lon: number, title: string };
  end?: { lat: number, lon: number, title: string };
}

export interface StoryEntry {
  title: string;
  subtitle: string;
  text: string;
  location: string;
  time: string;
  svgElement: string;
  audio?: string;
  map?: MapEntry;
}

function MainMenu() {
  const mode = useSelector((state: State) => state.app.mode);
  const dispatch = useDispatch();

  const selectedPainting = useSelector(
    (state: State) => state.app.selectedPainting
  );

  const selectedGroup = useSelector((state: State) => state.app.selectedGroup);

  const [storyData, setStoryData] = useState<Record<string, StoryEntry>>();

  useEffect(() => {
    fetch("/story-data.json")
      .then((res) => res.json())
      .then(function (json) {
        setStoryData(json);
      });
  }, []);

  const painting = useMemo(() => {
    return paintings.filter((e, i) => i === selectedPainting)[0];
  }, [selectedPainting]);

  const story = useMemo(() => {
    if (
      storyData != null &&
      selectedGroup != null &&
      Object.keys(storyData).includes(selectedGroup)
    ) {
      return storyData[selectedGroup as string];
    } else if (storyData != null && storyData[painting.key] != null) {
      return storyData[painting.key];
    } else {
      return {
        title: "Please add title.",
        text: "Please add text.",
        subtitle: "Please add subtitle.",
        location: "Please add location.",
        time: "Please add time.",
      } as StoryEntry;
    }
  }, [painting, selectedGroup, storyData]);

  return (
    <div
      className="grid grid-cols-1 grid-rows-[1fr_auto] overflow-hidden size-full painting-main"
      onClick={() => {
        dispatch(setMode("explore"));
      }}
    >
      <div className="relative size-full items-center grid grid-rows-1 grid-cols-[75%_25%] justify-center">
        <div className="size-full">
          <div className="absolute top-0 left-0 h-16 w-full z-50 flex px-2">
            <Link
              className="relative w-25"
              href={"/"}
              onClick={() => {
                dispatch(setSelectedPainting(0));
              }}
            >
              <Image
                src="/assets/cropped-logoOctober-1.png"
                fill={true}
                style={{ objectFit: "contain" }}
                sizes={"40px 40px"}
                alt="Memorise Logo"
              />
            </Link>
          </div>
          {
            <Painting
              key={painting.key}
              svgFile={painting.svgFile}
              inactive={painting.inactive}
            />
          }
        </div>
        <div className="size-full relative">
          <div className="size-full absolute top-0 left-0">
            {storyData != null && (
              <div className="size-full text-gray-950 relative">
                <div className="absolute top-0 left-0 size-full overflow-hidden overflow-y-scroll flex items-center">
                  <div className="size-full flex gap-2 flex-col p-3 px-6 justify-center">
                    <div className={`text-xl ${noto_serif.className}`}>
                      {story.title
                        ? story.title
                          .split("\n")
                          .map((e, i) => <div key={`title-${i}`}>{e}</div>)
                        : "Please add title."}
                    </div>
                    <div className={`text-2xl ${reenie_beanie.className}`}>
                      {story.subtitle
                        ? story.subtitle
                          .split("\n")
                          .map((e, i) => (
                            <div key={`timeline-subtitle-${i}`}>{e}</div>
                          ))
                        : "Please add subtitle."}
                    </div>
                    <div className="text-xs opacity-75 flex flex-col gap-1">
                      <p>{story.time}</p>
                      <p>{story.location}</p>
                    </div>
                    <div className="text-sm flex gap-1 flex-col">
                      {story.text
                        ? renderStoryText(story.text)
                        : "Please add text."}
                    </div>
                    <div className="text-sm flex gap-1 flex-col">
                      {story.audio &&
                        <PaintingAudio src={`/audio/${story.audio}`} />
                      }
                    </div>
                    {story.map && <div className="text-sm flex gap-1 flex-col z-0">
                      <div className="h-[300px] w-full border-2 border-gray-300 rounded-md opacity-90">
                        <PaintingMap start={story.map.start} end={story.map.end} mapyear={story.map.mapyear} />
                      </div>
                      <div className="opacity-75">
                        {story.map.title && <span>{story.map.title}</span>}
                      </div>
                    </div>}
                    {/* <div className="grid grid-cols-[auto_auto] items-center justify-center gap-2">
                    <CursorArrowRaysIcon
                      width={30}
                      height={30}
                      className="size-8 animate-myping"
                    />
                    <div>Click "Next" to begin Steen's story!</div>
                  </div> */}
                  </div>
                </div>
                <svg className="size-full absolute top-0 left-0 pointer-events-none">
                  <filter id="roughpaper-sidebar">
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.04"
                      result="noise"
                      numOctaves="5"
                    />

                    <feDiffuseLighting
                      in="noise"
                      lightingColor="#fff"
                      surfaceScale="2"
                    >
                      <feDistantLight azimuth="45" elevation="60" />
                    </feDiffuseLighting>
                  </filter>
                  <rect
                    width={"100%"}
                    height={"100%"}
                    filter="url(#roughpaper-sidebar)"
                    opacity={0.3}
                    fill="white"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="size-full">
        {storyData && (
          <PaintingTimeline paintings={paintings} storyData={storyData} />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <MainMenu />
    </Provider>
  );
}
