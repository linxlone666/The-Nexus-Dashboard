"use client";

import { useId, useRef, useState } from "react";

export function DemoCameraVideo({ name, footage, className }: {
  name: string;
  footage: { video: string; poster: string };
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inlineVideo = useRef<HTMLVideoElement>(null);
  const expandedVideo = useRef<HTMLVideoElement>(null);
  const titleId = useId();
  const [failed, setFailed] = useState(false);

  return (
    <div className="nexus-camera-player">
      <video
        ref={inlineVideo}
        className={className}
        aria-label={name + " simulated footage"}
        src={footage.video}
        poster={footage.poster}
        controls muted loop playsInline preload="none"
        onError={() => setFailed(true)}
      />
      {failed ? <p role="status">Demo footage could not be loaded.</p> : (
        <button type="button" className="nexus-camera-expand" aria-label={"Expand " + name}
          onClick={() => { inlineVideo.current?.pause(); dialog.current?.showModal(); }}>
          <span aria-hidden="true">⤢</span>
        </button>
      )}
      <dialog ref={dialog} className="nexus-camera-dialog" aria-labelledby={titleId}
        onClose={() => expandedVideo.current?.pause()}>
        <div>
          <h2 id={titleId}>{name}</h2>
          <button type="button" onClick={() => dialog.current?.close()}>Close</button>
        </div>
        <video ref={expandedVideo} src={footage.video} poster={footage.poster} controls muted loop playsInline preload="none" aria-label={name + " expanded footage"} onError={() => setFailed(true)} />
        {failed && <p role="status">Demo footage could not be loaded.</p>}
      </dialog>
    </div>
  );
}
