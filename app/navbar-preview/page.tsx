import Navbar from "@/components/Navbar";

const sections = [
  { id: "overview", title: "Overview", description: "2 cameras online · 1 active alarm" },
  { id: "activity", title: "Activity", description: "09:42 · Lobby camera came online" },
  { id: "cctv", title: "CCTV", description: "Lobby and Parking cameras are online" },
  { id: "alarms", title: "Alarms", description: "09:48 · Motion detected at the loading dock" },
];

export default function NavbarPreview() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-6 px-5 pt-8 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div>
          <p className="text-sm font-medium text-primary-700">Demo workspace</p>
          <h1 className="mt-1 text-3xl font-bold">Dashboard preview</h1>
        </div>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={section.id + "-title"}
            className="min-h-72 scroll-mt-6 rounded-xl border border-slate-200 bg-white p-6"
          >
            <h2 id={section.id + "-title"} className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-slate-600">{section.description}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
