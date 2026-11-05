export default function AdminTopCard() {
  const box =
    "border border-gray-300 h-full bg-white text-left p-4 rounded-lg shadow-md hover:bg-[#6BDEC1] hover:text-white";

  const text_p = "font-medium text-gray-800";
  const text_h1 = "text-xl font-bold text-gray-800";
  const text_xp = "font-medium text-red-500 text-sm";

  return (
    <div className="flex flex-col items-center w-full py-0">
      <div className="grid grid-cols-4 gap-4 p-3  w-full">
        <div className={box}>
          <p className={text_p}>Workspace users</p>
          <h1 className={text_h1}>126</h1>
          <span className={text_xp}>118 active . 8 invitations pending</span>
        </div>
        <div className={box}>
          <p className={text_p}>Connected devices</p>
          <h1 className={text_h1}>248 / 252</h1>
          <span className={text_xp}>4 devices need attention</span>
        </div>
        <div className={box}>
          <p className={text_p}>Integrations healthy</p>
          <h1 className={text_h1}>4 / 5</h1>
          <span className={text_xp}>1 integration requires review</span>
        </div>
        <div className={box}>
          <p className={text_p}>Access requests</p>
          <h1 className={text_h1}>07</h1>
          <span className={text_xp}>3 awaiting admin approval</span>
        </div>
      </div>
    </div>
  );
}
