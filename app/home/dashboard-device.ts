import { useSyncExternalStore } from "react";

export function isMobileDashboard() {
  const agent = navigator.userAgent;
  return (
    /Android|iPhone|iPad|iPod|Windows Phone/i.test(agent) ||
    (/Macintosh/i.test(agent) && navigator.maxTouchPoints > 1)
  );
}

const subscribe = () => () => {};
export function useDashboardDevice() {
  return useSyncExternalStore(
    subscribe,
    () => (isMobileDashboard() ? ("mobile" as const) : ("desktop" as const)),
    () => null,
  );
}
