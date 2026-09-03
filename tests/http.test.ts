import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { authorize, authorizeAdmin, clientIp } from "../lib/http.ts";

const originalEnvironment = {
  FACILITATOR_API_KEYS: process.env.FACILITATOR_API_KEYS,
  FACILITATOR_PUBLIC: process.env.FACILITATOR_PUBLIC,
  NODE_ENV: process.env.NODE_ENV,
};

function request(headers: Record<string, string> = {}) {
  return new NextRequest("https://gateway.test/api/test", { headers });
}

before(() => {
  process.env.FACILITATOR_PUBLIC = "true";
  process.env.FACILITATOR_API_KEYS = "admin-secret,rotated-secret";
});

after(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("public protocol mode never grants administrator access", () => {
  assert.equal(authorize(request()), true);
  assert.equal(
    authorizeAdmin(request({ "oai-authenticated-user-email": "forged@test" })),
    false,
  );
  assert.equal(
    authorizeAdmin(request({ authorization: "Bearer admin-secret" })),
    true,
  );
});

test("administrator access fails closed without a configured key", () => {
  delete process.env.FACILITATOR_API_KEYS;
  assert.equal(
    authorizeAdmin(request({ authorization: "Bearer arbitrary" })),
    false,
  );
  process.env.FACILITATOR_API_KEYS = "admin-secret,rotated-secret";
});

test("production rate-limit identity ignores forwarded-for spoofing", () => {
  Reflect.set(process.env, "NODE_ENV", "production");
  assert.equal(
    clientIp(
      request({
        "x-forwarded-for": "203.0.113.10, 198.51.100.1",
        "cf-connecting-ip": "192.0.2.44",
      }),
    ),
    "192.0.2.44",
  );
  assert.equal(
    clientIp(request({ "x-forwarded-for": "203.0.113.10" })),
    "unknown",
  );
  Reflect.set(process.env, "NODE_ENV", "test");
});
