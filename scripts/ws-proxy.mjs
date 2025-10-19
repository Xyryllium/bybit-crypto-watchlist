import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PORT = process.env.WS_PROXY_PORT
  ? Number(process.env.WS_PROXY_PORT)
  : 8787;

const server = http.createServer();
const wss = new WebSocketServer({ server });

function log(...args) {
  console.log("[ws-proxy]", ...args);
}

wss.on("connection", (client, req) => {
  log("client connected", req.url);
  let upstream = null;
  let isInitialized = false;
  let upstreamPingTimer = null;

  function cleanupUpstream() {
    try {
      upstream?.close();
    } catch {}
    upstream = null;
    isInitialized = false;
    if (upstreamPingTimer) {
      clearInterval(upstreamPingTimer);
      upstreamPingTimer = null;
    }
  }

  client.on("message", (data) => {
    try {
      if (!isInitialized) {
        const msg = JSON.parse(data.toString());
        const target = msg?.target;
        if (typeof target !== "string" || !target.startsWith("wss://")) {
          client.send(JSON.stringify({ error: "invalid target" }));
          return;
        }
        log("connecting upstream to", target);
        upstream = new WebSocket(target);
        upstream.on("open", () => {
          isInitialized = true;
          log("upstream opened");
          client.send(JSON.stringify({ ok: true, event: "upstream_open" }));
          upstreamPingTimer = setInterval(() => {
            try {
              upstream?.send(JSON.stringify({ req_id: "hb", op: "ping" }));
            } catch {}
          }, 20000);
        });
        upstream.on("message", (d) => client.send(d));
        upstream.on("close", (code, reason) => {
          log("upstream closed", code, reason.toString());
          client.send(
            JSON.stringify({
              event: "upstream_close",
              code,
              reason: reason.toString(),
            })
          );
          cleanupUpstream();
        });
        upstream.on("error", (err) => {
          log("upstream error", err?.message || err);
          client.send(
            JSON.stringify({
              event: "upstream_error",
              message: String(err?.message || err),
            })
          );
        });
        return;
      }
      upstream?.send(data);
    } catch (e) {
      client.send(JSON.stringify({ error: String(e?.message || e) }));
    }
  });

  client.on("close", () => {
    log("client closed");
    cleanupUpstream();
  });
});

server.listen(PORT, () => {
  log(`listening on ws://localhost:${PORT}`);
});
