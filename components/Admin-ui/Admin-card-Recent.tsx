export default function AdminMainCardRecent() {
  const box = "col-span-1 gap-1 w-full ";
  return (
    <div className=" grid grid-cols-1 align-bottom border border-gray-300 h-full bg-white text-left p-4 rounded-lg shadow-md  w-full  ">
      <div className=" grid grid-cols-1 gap-1 text-left ">
        <h1 className="text-left font-bold">Recent Activity</h1>

        <div className={box}>
          <h1>Maya Chen added to Operators</h1>
          <h2>Alex Lim . 10 min ago</h2>
        </div>
        <div className={box}>
          <h1>Maya Chen added to Operators</h1>
          <h2>Alex Lim . 10 min ago</h2>
        </div>
        <div className={box}>
          <h1>Maya Chen added to Operators</h1>
          <h2>Alex Lim . 10 min ago</h2>
        </div>
        <div className={box}>
          <h1>Maya Chen added to Operators</h1>
          <h2>Alex Lim . 10 min ago</h2>
        </div>
        <div className={box}>
          <h1>Maya Chen added to Operators</h1>
          <h2>Alex Lim . 10 min ago</h2>
        </div>
      </div>
    </div>
  );
}
