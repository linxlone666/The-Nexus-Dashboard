const sampleUsers = [
  {
    name: "Alex Turner",
    email: "alex@example.com",
    role: "User",
    access: "Muang Thong · Attendance, Visitor Management",
  },
  {
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "Admin",
    access: "Assigned sites",
  },
  {
    name: "Sam Lee",
    email: "sam@example.com",
    role: "Superadmin",
    access: "All sites",
  },
];

export default function UsersPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <p className="mb-1 text-xs text-[#506769]">Nexus / Superadmin / Users</p>
      <h1 className="text-3xl font-bold">User Management</h1>
      <p className="mt-1 text-sm text-[#506769]">
        Review accounts, roles, and site access.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,2fr)] lg:items-start">
        <section
          className="min-w-0 rounded-lg border border-[#dce6e4] bg-white p-5"
          aria-labelledby="users-heading"
        >
          <h2 id="users-heading" className="mb-4 text-lg font-semibold">
            Users
          </h2>
          <div className="overflow-x-auto">
            <table
              className="w-full text-left text-sm"
              aria-labelledby="users-heading"
            >
              <thead className="bg-[#e8f2ef]">
                <tr>
                  <th scope="col" className="px-3 py-2">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-2">
                    Site access
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce6e4]">
                {sampleUsers.map((user) => (
                  <tr key={user.email}>
                    <td className="px-3 py-3 font-medium">{user.name}</td>
                    <td className="px-3 py-3 text-[#506769]">{user.email}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-[#e8f2ef] px-2 py-1 text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#506769]">{user.access}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="rounded-lg border border-[#dce6e4] bg-white p-5"
          aria-labelledby="create-heading"
        >
          <h2 id="create-heading" className="mb-4 text-lg font-semibold">
            Create account
          </h2>
          <fieldset disabled className="grid gap-3 text-sm">
            <label className="grid gap-1">
              Name
              <input
                type="text"
                placeholder="Full name"
                className="rounded-md border-[#dce6e4] bg-[#f8faf9]"
              />
            </label>
            <label className="grid gap-1">
              Email
              <input
                type="email"
                placeholder="name@company.com"
                className="rounded-md border-[#dce6e4] bg-[#f8faf9]"
              />
            </label>
            <label className="grid gap-1">
              Demo password
              <input
                type="password"
                className="rounded-md border-[#dce6e4] bg-[#f8faf9]"
              />
            </label>
            <label className="grid gap-1">
              Role
              <select className="rounded-md border-[#dce6e4] bg-[#f8faf9]">
                <option>User</option>
                <option>Admin</option>
                <option>Superadmin</option>
              </select>
            </label>
            <button
              type="button"
              className="mt-1 rounded-md bg-[#08786d] px-4 py-2 font-semibold text-white"
            >
              Create account
            </button>
          </fieldset>
        </section>
      </div>
    </main>
  );
}
