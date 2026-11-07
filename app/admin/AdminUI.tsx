"use client";

import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import AdminTitle, {
  botton_Ex,
  botton_In,
} from "@/components/Admin-ui/card-secon-title";
import AdminTopCard from "@/components/Admin-ui/card-top";
import AdminMainCardTable from "@/components/Admin-ui/card-table";
import AdminMainCardDetails from "@/components/Admin-ui/card-Details";
import Card_Add_User from "@/components/Admin-ui/card-add-user";
import Card_top_title from "@/components/Admin-ui/card-top-title";

export default function AdminUI() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="flex flex-col min-h-screen">
      <Card_top_title />
      <div className="flex gap-4 mt-1 px-4">
        <AdminTitle />
        <Button className={botton_Ex}>Export users</Button>
        <Button className={botton_In} onClick={() => setIsOpen(true)}>
          + Add user
        </Button>
      </div>
      {/* Popup Add User */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Card */}
          <div className="relative z-10 max-h-[90vh] overflow-y-auto backdrop-none ">
            <Card_Add_User onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 items-baseline md:grid-cols-3">
        <div className="md:col-span-2">
          <AdminTopCard />
          <AdminMainCardTable />
        </div>

        <div className="md:col-span-1">
          <AdminMainCardDetails />
        </div>
      </div>
    </main>
  );
}
