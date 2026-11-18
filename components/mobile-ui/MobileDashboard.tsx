import { MobileCctv } from "./MobileCctv";
import { MobileSystemView } from "./MobileSystemView";
import BottomNavigation from "./BottomNavigation";
import { PhonePreview } from "./PhonePreview";
import "./mobile-preview.css";

type Screen = "overview" | "activity" | "alarms" | "cctv";

const screens: Record<Screen, string> = {
  overview: "Overview",
  activity: "Activity",
  alarms: "Alarms",
  cctv: "CCTV",
};

export default function MobileDashboard({ screen }: { screen: Screen }) {
  return (
    <PhonePreview>
      <main className="mobile-ui-preview">
        <div className={`mobile-app app-${screen}`}>
          {screen !== "overview" && (
            <h1 className="mobile-preview-heading">{screens[screen]}</h1>
          )}
          <div className={`screen-content screen-${screen}`}>
            {screen === "overview" && <MobileSystemView />}
            {screen === "activity" && <MobileSystemView systemId="access" />}
            {screen === "alarms" && <MobileSystemView systemId="alarms" />}
            {screen === "cctv" && <MobileCctv />}
          </div>
          <BottomNavigation />
        </div>
      </main>
    </PhonePreview>
  );
}
