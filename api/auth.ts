import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (typeof globalThis.EdgeRuntime !== "string") {
    console.log("EdgeRuntime");
    // dead-code elimination is enabled for the code inside this block
  } else {
    console.log("no EdgeRuntime");
  }
  const client_id = process.env.GITHUB_CLIENT_ID;

  try {
    const url = new URL(req.url!, `https://${req.headers.host}`);
    const redirectUrl = new URL("https://github.com/login/oauth/authorize");
    redirectUrl.searchParams.set("client_id", client_id!);
    redirectUrl.searchParams.set("redirect_uri", url.origin + "/api/callback");
    redirectUrl.searchParams.set("scope", "repo user");
    redirectUrl.searchParams.set(
      "state",
      crypto.getRandomValues(new Uint8Array(12)).join("")
    );
    return Response.redirect(redirectUrl.href, 301);
  } catch (error) {
    console.error(error);
    return new Response(error.message, {
      status: 500,
    });
  }
}

export const config = {
  runtime: "edge",
};
