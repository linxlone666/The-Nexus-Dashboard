"use client";

// button styles for the action buttons
export const botton_Ex =
  "mt-5 border border-gray-300 h-11 w-40 bg-white text-black hover:bg-[#6BDEC1] hover:text-white";
export const botton_In =
  "mt-5 border border-gray-300 h-11 w-40 bg-[#138C80] text-white hover:bg-[#6BDEC1] hover:text-black";

export default function AdminUI() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* the second title  */}
      <div className=" flex gap-4 justify-between w-full pt-3 ">
        <div className="flex flex-col items-left justify-center gap-2">
          <p className="text-sm font-medium text-gray-800">NEXUS / Admin</p>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm font-medium text-gray-800">
            Manage user accounts, roles, permissions and project access.
          </p>
        </div>
      </div>
    </div>
  );
}
