// GitHub OAuth, step 1: send the editor to GitHub to sign in.
// Needs Vercel env vars GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (a GitHub OAuth App).
import crypto from "node:crypto";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return res.status(500).send("GITHUB_CLIENT_ID is not set in Vercel.");
  const state = crypto.randomBytes(16).toString("hex");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const redirect = `https://${host}/api/callback`;
  res.setHeader("Set-Cookie", `decap_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);
  res.writeHead(302, { Location: url.toString() });
  res.end();
}
