import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

export const runtime = "nodejs";

const MAX_HTML_BYTES = 600_000;

function isPublicAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();
    return !(
      lower === "::" || lower === "::1" || lower.startsWith("fc") || lower.startsWith("fd") ||
      lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb") ||
      lower.startsWith("::ffff:")
    );
  }
  return false;
}

function decodeText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#[0-9]+|amp|quot|apos|lt|gt|nbsp);/gi, (match, entity: string) => {
      const named: Record<string, string> = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
      if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      return named[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html: string, key: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = Object.fromEntries(
      [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
        .map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? ""]),
    );
    if ((attributes.name ?? attributes.property ?? "").toLowerCase() === key) {
      return decodeText(attributes.content ?? "");
    }
  }
  return "";
}

function validWebsiteUrl(url: URL) {
  return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password &&
    (!url.port || ["80", "443"].includes(url.port)) && url.hostname.includes(".");
}

async function readPublicHtml(url: URL, redirects = 0): Promise<string> {
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  const address = addresses.find((entry) => isPublicAddress(entry.address));
  if (!address || addresses.some((entry) => !isPublicAddress(entry.address))) {
    throw new Error("Please enter a public website address.");
  }

  return new Promise<string>((resolve, reject) => {
    const protocolRequest = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = protocolRequest(url, {
      method: "GET",
      headers: { "User-Agent": "RavusWebsiteScanner/1.0", Accept: "text/html,application/xhtml+xml" },
      timeout: 8000,
      lookup: (_hostname, options, callback) => {
        if (options.all) callback(null, [{ address: address.address, family: address.family }]);
        else callback(null, address.address, address.family);
      },
    }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        let destination: URL;
        try { destination = new URL(response.headers.location, url); }
        catch { reject(new Error("This website redirected to an invalid address.")); return; }
        if (redirects >= 3 || !validWebsiteUrl(destination)) {
          reject(new Error("This website redirected too many times or to an unsupported address."));
          return;
        }
        readPublicHtml(destination, redirects + 1).then(resolve, reject);
        return;
      }
      if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error("That website did not return a readable page. Try its homepage URL."));
        return;
      }
      const contentType = response.headers["content-type"] ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        response.resume();
        reject(new Error("This address does not point to a website page."));
        return;
      }
      let bytes = 0;
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => {
        if (bytes + chunk.length > MAX_HTML_BYTES) {
          chunks.push(chunk.subarray(0, MAX_HTML_BYTES - bytes));
          resolve(Buffer.concat(chunks).toString("utf8"));
          response.destroy();
          return;
        }
        bytes += chunk.length;
        chunks.push(chunk);
      });
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      response.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new Error("The website took too long to respond.")));
    req.on("error", reject);
    req.end();
  });
}

export async function POST(request: Request) {
  let url: URL;
  try {
    const body = await request.json();
    if (typeof body.url !== "string" || body.url.length > 2048) throw new Error();
    url = new URL(body.url);
    if (!validWebsiteUrl(url)) throw new Error();
  } catch {
    return Response.json({ error: "Enter a valid public website URL." }, { status: 400 });
  }

  try {
    const html = await readPublicHtml(url);
    const title = decodeText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const heading = decodeText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
    const siteName = metaContent(html, "og:site_name") || title.split(/\s+[|—–-]\s+/)[0] || url.hostname.replace(/^www\./, "");
    const description = metaContent(html, "description") || metaContent(html, "og:description") || heading;
    const accent = metaContent(html, "theme-color");
    const sectionHeadings = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map((match) => decodeText(match[1]).slice(0, 80))
      .filter(Boolean)
      .slice(0, 4);

    return Response.json({
      url: url.toString(),
      domain: url.hostname.replace(/^www\./, ""),
      name: siteName.slice(0, 90),
      title: title.slice(0, 140),
      headline: heading.slice(0, 150) || title.slice(0, 150),
      description: description.slice(0, 320),
      accent: /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(accent) ? accent : "#F6A144",
      topics: sectionHeadings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not scan this website.";
    return Response.json({ error: message }, { status: 422 });
  }
}
