import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar
        site="Nexus Headquarters"
        workspace="Control room"
        user={{ name: "Alex", initials: "AL" }}
      />
    </>
  );
}
