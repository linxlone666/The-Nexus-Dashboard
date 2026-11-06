import { Button } from "@/components/tailgrids/core/button";

export default function AdminUI() {
  // button styles for the action buttons
  const bottom_Ex =
    "border border-gray-300 h-10 bg-white text-black hover:bg-[#6BDEC1] hover:text-white";
  const bottom_In =
    "border border-gray-300 h-10 bg-[#138C80] text-white  hover:bg-[#6BDEC1] hover:text-black";

  return (
    <div className="flex flex-col items-center w-full py-2">
      {/*  title  */}
      <div className=" flex flex-nowrap justify-between border-b border-gray-300 w-full">
        <h1 className="text-3xl font-bold m-0 p-4 ">NEXUS</h1>
      </div>
      {/* the second title  */}
      <div className=" flex gap-4 justify-between w-full p-6 ">
        <div className="flex flex-col items-left justify-center gap-2">
          <p className="text-sm font-medium text-gray-800">
            NEXUS / Admin / Users
          </p>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm font-medium text-gray-800">
            Manage user accounts, roles, permissions and project access.
          </p>
        </div>
        {/* Action buttons */}
        <div className="flex flex-nowrap gap-4 mt-1">
          <Button className={bottom_Ex}>Export users</Button>
          <Button className={bottom_In}> + Add user</Button>
        </div>
      </div>
    </div>
  );
}
