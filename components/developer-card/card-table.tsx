import { statuse } from "@/data/Satatus";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  NativeSelect,
  NativeSelectOption,
} from "../tailgrids/core/native-select";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";

export default function AdminMainCardTable() {
  const text_native_select =
    "text-left text-blue-500 hover:text-blue-700 cursor-pointer";
  const text_th = "text-3xl font-bold text-gray-800";
  return (
    <div className="flex items-center w-full ">
      <div className="col-span-3  gap-4 p-3 w-full">
        <div className="border border-gray-300 h-full bg-white text-left p-4 rounded-lg shadow-md ">
          <div className="grid grid-cols-2 gap-4">
            <h1 className=" text-2xl font-bold">Users</h1>
          </div>
          {/* search input */}

          <div className="flex gap-2 mt-2">
            <label htmlFor="" className=" flex-column-reverse">
              <input
                className="rounded-md"
                type="text"
                id="search"
                placeholder="Search users..."
              />
            </label>
            <div>
              <NativeSelect className="text-center text-blue-500 hover:text-blue-700 cursor-pointer">
                <NativeSelectOption
                  className={text_native_select}
                  value="option1"
                >
                  Status All
                </NativeSelectOption>
                <NativeSelectOption
                  className={text_native_select}
                  value="option1"
                >
                  On line
                </NativeSelectOption>
                <NativeSelectOption
                  className={text_native_select}
                  value="option2"
                >
                  Off line
                </NativeSelectOption>
              </NativeSelect>
            </div>

            <div>
              <NativeSelect className="text-center text-blue-500 hover:text-blue-700 cursor-pointer">
                <NativeSelectOption
                  className={text_native_select}
                  value="option1"
                >
                  Role All
                </NativeSelectOption>
                <NativeSelectOption
                  className={text_native_select}
                  value="option1"
                >
                  User
                </NativeSelectOption>
                <NativeSelectOption
                  className={text_native_select}
                  value="option2"
                >
                  Admin
                </NativeSelectOption>
                <NativeSelectOption
                  className={text_native_select}
                  value="option2"
                >
                  Super Admin
                </NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          {/* table */}
          <div className="w-full mt-3">
            <TableRoot>
              <TableHeader>
                <TableRow className="bg-background-soft-50 [&>th]:text-text-500 ">
                  <TableHead scope="col" className={text_th}>
                    Name / Email
                  </TableHead>
                  <TableHead scope="col" className={text_th}>
                    Role
                  </TableHead>
                  <TableHead scope="col" className={text_th}>
                    Status
                  </TableHead>
                  <TableHead scope="col" className={text_th}>
                    Last active
                  </TableHead>
                  <TableHead scope="col" className={text_th}>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {statuse.map((item) => (
                  <TableRow
                    key={item.role + item.Email + item.log_work + item.action}
                    className="text-sm"
                  >
                    <TableCell
                      scope="row"
                      className="font-medium text-title-50 whitespace-nowrap"
                    >
                      {item.Email}
                    </TableCell>

                    <TableCell className="font-semibold text-text-100 -tracking-0.2px whitespace-nowrap">
                      {item.role}
                    </TableCell>

                    <TableCell>
                      <Badge
                        color={item.statuse < 10 ? "warning" : "success"}
                        prefixIcon={
                          <span
                            className={`size-1.5 rounded-full ${
                              item.statuse < 10
                                ? "bg-warning-500"
                                : "bg-success-500"
                            }`}
                          />
                        }
                      >
                        {item.statuse < 10 ? "Off line" : "On line"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-text-100 -tracking-0.2px whitespace-nowrap">
                      {item.log_work}
                    </TableCell>
                    <TableCell className="font-semibold text-text-100 -tracking-0.2px whitespace-nowrap">
                      <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
                        {item.action}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </div>
      </div>
    </div>
  );
}
