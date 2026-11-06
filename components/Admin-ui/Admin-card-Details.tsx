import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Button } from "../tailgrids/core/button";
export default function AdminMainCardDetails() {
  return (
    <div className=" flex  items-center w-full pr-4  ">
      <div className=" border rounded-lg border-gray-300 w-full p-2 shadow">
        <h1 className="text-2xl font-bold pb-3">User Details</h1>
        <h1 className="text-left font-bold">Maya Chen</h1>
        <h2 className="text-left pb-2">maya@example.com .Operator</h2>
        <div className="w-full">
          <TableRoot fullBleed className="border rounded p-1 ">
            <TableHeader>
              <TableRow className="[&>th]:text-title-50 [&>th]:font-bold [&>th]:text-lg">
                <TableHead scope="col">Device</TableHead>
                <TableHead scope="col">Permission</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell> Lobby camera </TableCell>
                <TableCell>Can view</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> Parking camera </TableCell>
                <TableCell>No access</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> Loading dock sensor </TableCell>
                <TableCell>Can view</TableCell>
              </TableRow>
              <TableRow>
                <TableCell> West entrance </TableCell>
                <TableCell>No access</TableCell>
              </TableRow>
            </TableBody>
          </TableRoot>
        </div>
        <div className="flex justify-end mt-2.5">
          <Button>Save permissions</Button>
        </div>
      </div>
    </div>
  );
}
