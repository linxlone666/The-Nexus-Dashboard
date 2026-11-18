import { useSyncExternalStore } from "react";

export function isMobileDashboard() {
  const agent = navigator.userAgent;
  return (
    /iPhone|iPod|Windows Phone/i.test(agent) || /Android.*Mobile/i.test(agent)
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
