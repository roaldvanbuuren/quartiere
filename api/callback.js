// GitHub OAuth, step 2: swap the code for a token and hand it to the Decap editor window.
export default async function handler(req, res) {
  const { code, state } = req.query || {};
  const cookie = (req.headers.cookie || "").match(/decap_oauth_state=([a-f0-9]+)/);
  const reply = (status, content) => {
    const msg = `authorization:github:${status}:${JSON.stringify(content)}`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html><script>
      (function () {
        function receive(e) {
          window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
          window.removeEventListener("message", receive, false);
        }
        window.addEventListener("message", receive, false);
        window.opener.postMessage("authorizing:github", "*");
      })();
    </script>`);
  };
  if (!code || !cookie || cookie[1] !== state) return reply("error", { message: "Sign-in could not be verified. Please try again." });
  try {
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
    });
    const data = await r.json();
    if (!data.access_token) return reply("error", { message: data.error_description || "GitHub did not return a token." });
    return reply("success", { token: data.access_token, provider: "github" });
  } catch (e) {
    return reply("error", { message: "Could not reach GitHub." });
  }
}
