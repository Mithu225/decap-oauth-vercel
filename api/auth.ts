import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const client_id = process.env.GITHUB_CLIENT_ID;

  try {
    console.log(req.url, "req.url");
    console.log(req.headers.host, "req.headers.host");
    const url = new URL(req.headers.host!);
    const redirectUrl = new URL("https://github.com/login/oauth/authorize");
    redirectUrl.searchParams.set("client_id", client_id!);
    redirectUrl.searchParams.set("redirect_uri", url.origin + "/api/callback");
    redirectUrl.searchParams.set("scope", "repo user");
    redirectUrl.searchParams.set(
      "state",
      crypto.getRandomValues(new Uint8Array(12)).join("")
    );
    return res.redirect(301, redirectUrl.href);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
}
