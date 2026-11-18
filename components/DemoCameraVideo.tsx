export function DemoCameraVideo({
  name,
  footage,
  className,
}: {
  name: string;
  footage: { video: string; poster: string };
  className?: string;
}) {
  return (
    <video
      className={className}
      aria-label={name + " simulated footage"}
      src={footage.video}
      poster={footage.poster}
      controls
      muted
      loop
      playsInline
      preload="none"
    >
      Your browser does not support video playback.
    </video>
  );
}
