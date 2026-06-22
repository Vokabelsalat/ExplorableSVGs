"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../../../store/store";
import { setSelectedGroup, setSelectedPainting } from "../../../store/appSlice";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { StoryEntry } from "../page";
import { ThumbnailPainting } from "./ThumbnailPainting";
import { Noto_Serif, Reenie_Beanie } from "next/font/google";

const noto_serif = Noto_Serif({ weight: "400", subsets: ["latin"] });
const reenie_beanie = Reenie_Beanie({ weight: "400", subsets: ["latin"] });

function sameElements(left: Array<string> = [], right: Array<string> = []) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export interface PaintingTimelineProps {
  paintings: Array<any>;
  storyData: Record<string, StoryEntry>;
  discoveredStoryKeys: Array<string>;
}

export function PaintingTimeline(props: PaintingTimelineProps) {
  const { paintings, storyData, discoveredStoryKeys } = props;
  const dispatch = useDispatch();
  const selectedPainting = useSelector(
    (state: State) => state.app.selectedPainting
  );
  const svgRef = useRef(null);

  const selectedGroup = useSelector((state: State) => state.app.selectedGroup);

  const [interactiveElements, setInteractiveElements] = useState<
    Record<string, Array<string>>
  >({});

  const currentInteractiveElements =
    interactiveElements[selectedPainting.toString()] ?? [];

  const selectedGroupIndex =
    selectedGroup != null
      ? currentInteractiveElements.indexOf(selectedGroup)
      : -1;

  const previousInteractiveElements =
    selectedPainting > 0
      ? interactiveElements[(selectedPainting - 1).toString()] ?? []
      : [];

  const canNavigatePrevious = selectedPainting > 0 || selectedGroup != null;
  const canNavigateNext =
    selectedGroupIndex >= 0
      ? selectedGroupIndex + 1 < currentInteractiveElements.length ||
      selectedPainting + 1 < paintings.length
      : currentInteractiveElements.length > 0 ||
      selectedPainting + 1 < paintings.length;

  const discoveredStoryCount = discoveredStoryKeys.length;
  const totalStoryCount = Object.keys(storyData).length;

  function navigatePrevious() {
    if (selectedGroupIndex > 0) {
      dispatch(
        setSelectedGroup(currentInteractiveElements[selectedGroupIndex - 1])
      );
      return;
    }

    if (selectedGroupIndex === 0) {
      dispatch(setSelectedGroup(null));
      return;
    }

    if (selectedPainting > 0) {
      const previousPainting = selectedPainting - 1;
      dispatch(setSelectedPainting(previousPainting));
      dispatch(
        setSelectedGroup(
          previousInteractiveElements[previousInteractiveElements.length - 1] ??
          null
        )
      );
    }
  }

  function navigateNext() {
    if (
      selectedGroupIndex >= 0 &&
      selectedGroupIndex + 1 < currentInteractiveElements.length
    ) {
      dispatch(
        setSelectedGroup(currentInteractiveElements[selectedGroupIndex + 1])
      );
      return;
    }

    if (selectedGroup == null && currentInteractiveElements.length > 0) {
      dispatch(setSelectedGroup(currentInteractiveElements[0]));
      return;
    }

    if (selectedPainting + 1 < paintings.length) {
      dispatch(setSelectedPainting(selectedPainting + 1));
      dispatch(setSelectedGroup(null));
    }
  }

  useEffect(() => {
    if (svgRef.current != null) {
      const image = (svgRef.current as HTMLElement).querySelector(
        "#background"
      );
      // images.forEach((element) => {
      //   if (element.id != null) {
      //     console.log(element.id, element);
      //   }
      // if (inactive !== true) {
      //   element.classList.add("myPath");
      //   element.addEventListener("click", clickHandler);
      // }
      // });
    }
  }, [svgRef.current]);

  return (
    <div className="size-full items-center grid grid-cols-[64px_auto_64px] gap-2 border-t border-gray-300 relative">
      <svg className="size-full absolute top-0 left-0 pointer-events-none">
        <filter id="roughpaper-timeline">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            result="noise"
            numOctaves="5"
          />

          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2">
            <feDistantLight azimuth="45" elevation="60" />
          </feDiffuseLighting>
        </filter>
        <rect
          width={"100%"}
          height={"100%"}
          filter="url(#roughpaper-timeline)"
          opacity={0.3}
          fill="white"
        />
      </svg>
      {canNavigatePrevious && (
        <div
          className="rounded-full px-2 size-16 shadow hover:shadow-lg hover:bg-gray-400 hover:text-white cursor-pointer items-center justify-center flex"
          onClick={navigatePrevious}
        >
          <ChevronLeftIcon className="size-7" />
        </div>
      )}
      <div
        className="w-full grid items-center painting-timeline grid-rows-[auto_auto_auto] relative col-start-2"
        style={{
          gridTemplateColumns: `repeat(${Math.max(
            1,
            paintings.length
          )}, minmax(0, 1fr))`,
        }}
      >
        {paintings.map((e, i) => {
          const story = storyData ? storyData[e.key] ?? null : null;
          const paintingDiscovered = discoveredStoryKeys.includes(e.key);
          return (
            <>
              <div
                key={`timeline-title-${i}`}
                className={`text-xs row-start-1 py-1 ${noto_serif.className}`}
              >
                {story?.title}
              </div>
              <div
                key={`timeline-image-${i}`}
                className="relative items-center justify-between flex pr-5 row-start-2"
              >
                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                  <div
                    className={`h-1 mt-[4px] w-full ${i < selectedPainting ? "bg-gray-400" : "bg-gray-200"
                      }`}
                  ></div>
                </div>
                <div
                  className={`size-18 rounded-full overflow-hidden relative cursor-pointer shadow-md items-center bg-white ${paintingDiscovered || (selectedPainting === i && selectedGroup == null)
                    ? "border-3 border-gray-400"
                    : ""
                    }`}
                  key={`timeline-entry-${i}`}
                  onClick={() => {
                    dispatch(setSelectedGroup(null));
                    dispatch(setSelectedPainting(i));
                  }}
                  ref={svgRef}
                >
                  <SVG
                    src={e.svgFile}
                    className="size-full object-contain absolute timeline-painting-svg"
                    // style={{
                    //   backgroundImage: "url('/assets/paper-texture.jpg')",
                    // }}
                    preProcessor={(code) => {
                      const timelineKey = i.toString();
                      const discoveredElements = Object.keys(storyData).filter(
                        (element) => code.includes(`id="${element}"`)
                      );

                      setInteractiveElements((currentElements) => {
                        if (
                          sameElements(
                            currentElements[timelineKey],
                            discoveredElements
                          )
                        ) {
                          return currentElements;
                        }

                        return {
                          ...currentElements,
                          [timelineKey]: discoveredElements,
                        };
                      });

                      let newCode = code.replaceAll(
                        '_image"',
                        '_image" class="mythumbnailimage"'
                      );

                      newCode = newCode.replaceAll(
                        'background"',
                        'background" class="mybackground"'
                      );
                      return newCode.replaceAll('id="', `id="timeline-${i}`);
                    }}
                  />
                  <svg className="size-full absolute top-0 left-0">
                    <filter id={`timeline-roughpaper-${i}`}>
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
                {selectedPainting === i &&
                  interactiveElements[i.toString()] != null &&
                  interactiveElements[i.toString()].map((ie, i) => (
                    <ThumbnailPainting
                      key={`timeline-thumbnail-${i}`}
                      elementID={ie}
                      svgFile={e.svgFile}
                      discovered={discoveredStoryKeys.includes(ie)}
                    />
                  ))}
              </div>
              <div
                key={`timeline-time-${i}`}
                className={`text-xs row-start-3 py-1 ${noto_serif.className}`}
              >
                {story?.time}
              </div>
            </>
          );
        })}
      </div>
      <div className="col-start-3 row-start-1 z-10 flex size-full flex-col items-center justify-center gap-1">
        {canNavigateNext && (
          <div
            className="px-2 shadow hover:shadow-lg hover:bg-gray-400 hover:text-white cursor-pointer size-16 rounded-full justify-center items-center flex"
            onClick={navigateNext}
          >
            <ChevronRightIcon className="size-7" />
          </div>
        )}
        <div
          className={`text-xs text-gray-600 ${noto_serif.className}`}
          aria-label={`Discovered ${discoveredStoryCount} of ${totalStoryCount} story entries`}
        >
          {discoveredStoryCount}/{totalStoryCount}
        </div>
      </div>
    </div>
  );
}
