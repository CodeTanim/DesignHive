"use client";

import { useCallback, useRef } from "react";
import { ThreadData } from "@liveblocks/client";
import { useEditThreadMetadata, useThreads, useUser } from "@liveblocks/react";
import { useMaxZIndex } from "@/lib/useMaxZIndex";

import { PinnedThread } from "./PinnedThread";

type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

type OverlayThreadProps = {
  thread: ThreadData<ThreadMetadata>;
  maxZIndex: number;
};

export const CommentsOverlay = () => {
  const { threads, error, isLoading } = useThreads();

  if (error) {
    return <div>Error</div>;
  }

  if (isLoading) {
    return <div>Loading…</div>;
  }

  // Cast threads to the correct type
  const typedThreads = threads as ThreadData<ThreadMetadata>[];

  // write this back later
  // const maxZIndex = useMaxZIndex();

  const maxZIndex = 0;


  return (
    <div>
      {typedThreads
        .filter((thread) => !thread.metadata.resolved)
        .map((thread) => (
          <OverlayThread key={thread.id} thread={thread} maxZIndex={maxZIndex} />
        ))}
    </div>
  );
};

const OverlayThread = ({ thread, maxZIndex }: OverlayThreadProps) => {
  const editThreadMetadata = useEditThreadMetadata();

  const { isLoading } = useUser(thread.comments[0].userId);

  const threadRef = useRef<HTMLDivElement>(null);

  const handleIncreaseZIndex = useCallback(() => {
    if (maxZIndex === thread.metadata.zIndex) {
      return;
    }

    editThreadMetadata({
      threadId: thread.id,
      metadata: {
        zIndex: maxZIndex + 1,
      },
    });
  }, [thread, editThreadMetadata, maxZIndex]);

  if (isLoading) {
    return null;
  }

  return (
    <div
      ref={threadRef}
      id={`thread-${thread.id}`}
      className="absolute left-0 top-0 flex gap-5"
      style={{
        transform: `translate(${thread.metadata.x}px, ${thread.metadata.y}px)`,
      }}
    >
      <PinnedThread thread={thread} onFocus={handleIncreaseZIndex} />
    </div>
  );
};
