import {
  NativeSelect,
  NativeSelectOption,
} from "../tailgrids/core/native-select";
type Card_Add_User_Props = {
  onClose: () => void;
};
export default function Card_Add_User({ onClose }: Card_Add_User_Props) {
  const in_p = "flex flex-col p-2 gap-1 ";
  return (
    <div className="flex justify-center items-center w-full py-2 p-4 ">
      <div className="inline border rounded-lg border-gray-300  p-2 h-full w-120 bg-white ">
        <div className=" m-auto w-100">
          <h1 className=" text-3xl font-bold text-left p-3">Add user</h1>
          <label htmlFor="" className={in_p}>
            Work email
            <input
              className="rounded-md"
              type="text"
              id=""
              placeholder="@Nexus.com"
            />
          </label>
          <label htmlFor="" className={in_p}>
            Role
            <input
              className="rounded-md"
              type="date"
              id=""
              placeholder="Role"
            />
          </label>
          <div>
            <label htmlFor="" className={in_p}>
              Workspace
              <NativeSelect className="text-center text-black-500 hover:text-blue-700 cursor-pointer">
                <NativeSelectOption value="option1">
                  Status All
                </NativeSelectOption>
                <NativeSelectOption value="option1">User</NativeSelectOption>
                <NativeSelectOption value="option2">Admin</NativeSelectOption>
                <NativeSelectOption value="option3">
                  Super Admin
                </NativeSelectOption>
              </NativeSelect>
            </label>
          </div>
          <div className="flex justify-end mt-5">
            <button onClick={onClose} className="border rounded-lg p-4 ">
              Send invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
