import type { VercelRequest, VercelResponse } from "@vercel/node";

function renderBody(status, content) {
  const html = `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
    `;
  const blob = new Blob([html]);
  return blob;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  try {
    const url = new URL(req.url!);
    const code = url.searchParams.get("code");
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ client_id, client_secret, code }),
      }
    );
    const result = await response.json();
    if (result.error) {
      return res
        .status(401)
        .send(renderBody("error", result))
        .setHeader("content-type", "text/html;charset=UTF-8");
    }
    const token = result.access_token;
    const provider = "github";
    const responseBody = renderBody("success", {
      token,
      provider,
    });

    return res
      .status(200)
      .send(responseBody)
      .setHeader("content-type", "text/html;charset=UTF-8");
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(error.message)
      .setHeader("content-type", "text/html;charset=UTF-8");
  }
}
