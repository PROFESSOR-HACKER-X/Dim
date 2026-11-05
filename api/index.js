export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { query } = req.query;

  if (!query) {
    return res.status(400).send("Missing required parameter: query");
  }

  // Basic validation: 03 + 9 digits
  if (!/^03\d{9}$/.test(String(query))) {
    return res.status(400).send("Invalid format. Expected 03XXXXXXXXX (11 digits).");
  }

  try {
    const upstream = `https://api-x.page.gd/?query=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "*/*",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text();

    // Return plain text response directly
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(text);

  } catch (err) {
    return res.status(502).send(
      err.name === "AbortError" ? "Request timed out" : "Upstream request failed: " + err.message
    );
  }
}
