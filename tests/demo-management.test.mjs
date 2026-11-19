import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import test from "node:test";

test("independent sessions share accounts and permissions, survive restarts, and enforce access", { timeout: 60000 }, async () => {
  const folder = await mkdtemp(path.join(os.tmpdir(), "nexus-demo-test-"));
  const socket = createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const url = `http://127.0.0.1:${port}/api/demo/management`;
  let child;
  let logs = "";
  async function start() {
    child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
      cwd: process.cwd(),
      env: { ...process.env, NEXT_PUBLIC_NEXUS_DEMO: "true", NEXUS_DEMO_DATA_FILE: path.join(folder, "management.json") },
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", chunk => { logs += chunk; });
    child.stderr.on("data", chunk => { logs += chunk; });
    for (let attempt = 0; attempt < 100; attempt++) {
      try { if ((await fetch(url)).status === 401) return; } catch { /* Server is starting. */ }
      if (child.exitCode !== null) throw new Error(logs);
      await delay(100);
    }
    throw new Error("Demo server did not start: " + logs);
  }
  async function stop() {
    if (!child || child.exitCode !== null) return;
    const exited = once(child, "exit");
    child.kill();
    await exited;
  }
  async function request(body, token) {
    const response = await fetch(url, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, ...await response.json() };
  }
  async function login(email, password = "pass") {
    const result = await request({ action: "login", email, password });
    assert.equal(result.status, 200, JSON.stringify(result));
    return result.credential.token;
  }
  try {
    await start();
    const superadmin = await login("superadmin@company.com");
    const admin = await login("admin@company.com");
    assert.notEqual(superadmin, admin);
    assert.equal((await request()).status, 401);
    assert.equal((await request(undefined, "invented-token")).status, 401);
    assert.equal((await request({ action: "login", email: "admin@company.com", password: "wrong" })).status, 401);

    const before = await request(undefined, admin);
    assert(before.data.accounts.every(account => account.password === ""));
    const siteId = before.data.sites[0].id;
    const account = { name: "Cross-browser Demo", email: "cross-browser@example.com", password: "demo-pass", role: "User", active: true, siteIds: [siteId] };
    const created = await request({ action: "saveAccount", args: [account] }, superadmin);
    assert.equal(created.status, 200);
    assert((await request(undefined, admin)).data.accounts.some(item => item.email === account.email));
    const user = await login(account.email, account.password);
    const userAgain = await login(account.email, account.password);
    assert.notEqual(user, userAgain);
    const forbidden = await request({ action: "saveAccount", args: [{ ...account, email: "forbidden@example.com" }] }, user);
    assert.equal(forbidden.status, 400);
    const updatedAccess = await request({ action: "saveStandardUserAccess", args: [account.email, [], {}] }, admin);
    assert.equal(updatedAccess.status, 200);
    assert.deepEqual((await request(undefined, user)).data.accounts.find(item => item.email === account.email).siteIds, []);

    // Concurrent actions must apply to the latest server state, not replace a stale browser snapshot.
    const concurrent = await Promise.all(["one", "two"].map(suffix => request({ action: "saveAccount", args: [{ ...account, email: suffix + "@example.com" }] }, superadmin)));
    assert(concurrent.every(result => result.status === 200));
    const latest = await request(undefined, admin);
    assert(latest.data.accounts.some(item => item.email === "one@example.com"));
    assert(latest.data.accounts.some(item => item.email === "two@example.com"));
    assert(latest.data.audit.some(event => event.target === account.email && event.actorEmail === "superadmin@company.com"));
    assert.equal((await request({ action: "saveAccount", args: [account] }, superadmin)).status, 400);

    await request({ action: "logout" }, user);
    assert.equal((await request(undefined, user)).status, 401);
    assert.equal((await request(undefined, userAgain)).status, 200);
    assert.equal((await request(undefined, admin)).status, 200);
    await stop();
    await start();
    assert((await request(undefined, admin)).data.accounts.some(item => item.email === account.email));
    assert.equal((await request({ action: "saveAccount", args: [{ ...account, password: "", active: false }, account.email] }, superadmin)).status, 200);
    assert.equal((await request(undefined, userAgain)).status, 401);
    assert.equal((await request({ action: "login", email: account.email, password: account.password })).status, 401);
  } finally {
    await stop();
    await rm(folder, { recursive: true, force: true });
  }
});
