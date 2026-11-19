"use client";

import Link from "next/link";
import { profileActivity } from "@/utils/profile-activity";
import { fontSizes, saveFontPreference, useFontPreference } from "@/utils/font-preferences";
import { TopBar } from "@/components/TopBar";
import { availableSites } from "@/data/management";
import { useManagement } from "@/utils/management-store";
import { useDemoProfile } from "@/utils/demo-session";
import { useSelectedWorkSite } from "@/utils/selected-work-site";

export default function ProfilePage() {
  const profile = useDemoProfile();
  const site = useSelectedWorkSite();
  const management = useManagement();
  const fontSize = useFontPreference(profile?.email);
  const account = management.accounts.find(({ email }) => email === profile?.email);

  if (profile === undefined)
    return (
      <main className="p-6" aria-busy="true">
        Loading profile…
      </main>
    );
  if (!profile) {
    return (
      <main className="p-6">
        <Link className="text-teal-800 underline" href="/login">
          Sign in to view your profile
        </Link>
      </main>
    );
  }

  const workSites = availableSites(management, profile);
  const recentActivity = profileActivity(management.audit, profile, management.sites).slice(0, 10);
  const activityTime = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: management.settings.timeZone,
  });
  const dashboardHref = workSites.some(({ id }) => id === site?.id)
    ? "/home"
    : "/login/sites?view=dashboard";
  return (
    <div className="min-h-dvh bg-[#f2f7f6] text-[#163236]">
      <TopBar
        home="/home"
        name={profile.name}
        initials=""
        roleLabel={profile.role}
      />
      <main className="mx-auto max-w-4xl space-y-5 p-5 sm:p-8">
        <Link href={dashboardHref} className="text-sm text-teal-800 underline">
          Back to Site dashboard
        </Link>
        <h1 className="text-3xl font-extrabold">My profile</h1>
        <section
          className="rounded-xl border border-[#dce6e4] bg-white p-5"
          aria-labelledby="account-title"
        >
          <h2 className="text-lg font-bold" id="account-title">
            Account information
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[#506769]">Name</dt>
              <dd className="font-semibold">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-[#506769]">Work email</dt>
              <dd className="break-all font-semibold">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-[#506769]">Role</dt>
              <dd className="font-semibold">{profile.role}</dd>
            </div>
            <div><dt>Account status</dt><dd>{account?.active ? "Active" : "Inactive"}</dd></div>
            <div><dt>Last sign-in</dt><dd>{account?.lastSignIn ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: management.settings.timeZone }).format(new Date(account.lastSignIn)) : "No sign-in recorded"}</dd></div>
            <div>
              <dt className="text-[#506769]">Selected site</dt>
              <dd className="font-semibold">
                {workSites.find(({ id }) => id === site?.id)?.name ??
                  "No site selected"}
              </dd>
            </div>
          </dl>
        </section>
        <section className="rounded-xl border border-[#dce6e4] bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">Display preferences</h2>
          <label>Text size{" "}
            <select className="rounded border p-2" value={fontSize}
              onChange={(event) => {
                const size = fontSizes.find((item) => item === event.target.value);
                if (size) saveFontPreference(profile.email, size);
              }}>
              <option value="small">Small</option>
              <option value="standard">Standard</option>
              <option value="large">Large</option>
            </select>
          </label>
          <p className="mt-2 text-sm" lang="th">ตัวอย่างข้อความภาษาไทย</p>
        </section>
        <section
          className="rounded-xl border border-[#dce6e4] bg-white p-5"
          aria-labelledby="permissions-title"
        >
          <h2 className="text-lg font-bold" id="permissions-title">
            Permissions
          </h2>
          <p className="mt-1 text-sm text-[#506769]">Demo workspace access</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            <li>View sample system data for your selected site</li>
            <li>Create, edit, and delete personal dashboards</li>
            <li>Switch between available work sites</li>
          </ul>
          <h3 className="mt-4 text-sm font-bold">Available sites</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {workSites.map(({ id, name }) => (
              <li
                key={id}
                className="rounded-full bg-[#e8f2ef] px-3 py-1 text-xs font-semibold"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>
        <section
          className="rounded-xl border border-[#dce6e4] bg-white p-5"
          aria-labelledby="profile-activity-title"
        >
          <h2 className="text-lg font-bold" id="profile-activity-title">Recent activity</h2>
          <p className="mt-1 text-sm text-[#506769]">
            Account activity within your current site access · {management.settings.timeZone}
          </p>
          {recentActivity.length ? (
            <ul className="mt-4 divide-y divide-[#dce6e4] text-sm">
              {recentActivity.map((event) => (
                <li key={event.id} className="grid gap-1 py-3">
                  <strong>{event.action}</strong>
                  <span className="break-words">{event.target}</span>
                  <time className="text-[#506769]" dateTime={event.date}>
                    {activityTime.format(new Date(event.date))}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">No recent activity for this account within your current access.</p>
          )}
        </section>
      </main>
    </div>
  );
}
