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
      return new Response(renderBody("error", result), {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
        status: 401,
      });
    }
    const token = result.access_token;
    const provider = "github";
    const responseBody = renderBody("success", {
      token,
      provider,
    });

    return new Response(responseBody, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(error.message, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
      status: 500,
    });
  }
}

export const runtime = "edge";
