import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BYBIT_WS_ENDPOINTS } from "~/lib/bybit";

type MessageHandler = (msg: any) => void;

type BybitWSContextValue = {
  isConnected: boolean;
  subscribe: (topics: string[], handler: MessageHandler) => () => void;
};

const BybitWSContext = createContext<BybitWSContextValue | null>(null);

export function BybitWebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const pingTimerRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const endpointIndexRef = useRef<number>(0);
  const subscribedTopicsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function clearTimers() {
      if (pingTimerRef.current) {
        window.clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function connect() {
      try {
        const endpoint =
          BYBIT_WS_ENDPOINTS[endpointIndexRef.current] ?? BYBIT_WS_ENDPOINTS[0];
        console.info("Bybit shared WS connecting to", endpoint);
        const ws = new WebSocket(endpoint);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.info("Bybit shared WS connected");

          if (subscribedTopicsRef.current.size > 0) {
            ws.send(
              JSON.stringify({
                op: "subscribe",
                args: Array.from(subscribedTopicsRef.current),
              })
            );
          }

          if (!pingTimerRef.current) {
            pingTimerRef.current = window.setInterval(() => {
              try {
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                  socketRef.current.send(
                    JSON.stringify({ req_id: "hb", op: "ping" })
                  );
                }
              } catch (e) {
                console.warn("Bybit WS ping failed", e);
              }
            }, 20000);
          }
        };

        ws.onclose = (ev) => {
          setIsConnected(false);
          console.warn("Bybit shared WS closed", ev.code);
          clearTimers();

          if (ev.code === 1006 || ev.code === 1002 || ev.code === 1003) {
            endpointIndexRef.current =
              (endpointIndexRef.current + 1) % BYBIT_WS_ENDPOINTS.length;
          }
          reconnectTimerRef.current = window.setTimeout(() => connect(), 3000);
        };

        ws.onerror = (ev) => {
          console.error("Bybit shared WS error", ev);
        };

        ws.onmessage = async (ev) => {
          try {
            let text: string;
            const raw: any = ev.data;
            if (raw instanceof Blob) {
              text = await raw.text();
            } else if (typeof raw === "string") {
              text = raw;
            } else {
              text = String(raw);
            }

            const msg = JSON.parse(text);
            if (msg.op === "pong" || msg.ret_msg === "pong") return;

            if (msg.success === false && msg.ret_msg) {
              console.error("Bybit WS error:", msg.ret_msg);
            }

            if (msg.topic && msg.data) {
              const handlers = handlersRef.current.get(msg.topic);
              if (handlers) {
                handlers.forEach((handler) => handler(msg));
              }
            }
          } catch (e) {
            console.warn("Bybit WS message parse error", e);
          }
        };
      } catch (e) {
        console.error("Bybit WS connect error", e);
        setIsConnected(false);
        endpointIndexRef.current =
          (endpointIndexRef.current + 1) % BYBIT_WS_ENDPOINTS.length;
        reconnectTimerRef.current = window.setTimeout(() => connect(), 3000);
      }
    }

    connect();

    return () => {
      clearTimers();
      try {
        socketRef.current?.close();
      } catch {}
    };
  }, []);

  const subscribe = (topics: string[], handler: MessageHandler) => {
    topics.forEach((topic) => {
      if (!handlersRef.current.has(topic)) {
        handlersRef.current.set(topic, new Set());
      }
      handlersRef.current.get(topic)!.add(handler);
      subscribedTopicsRef.current.add(topic);
    });

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ op: "subscribe", args: topics }));
    }

    return () => {
      topics.forEach((topic) => {
        const handlers = handlersRef.current.get(topic);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            handlersRef.current.delete(topic);
            subscribedTopicsRef.current.delete(topic);

            if (socketRef.current?.readyState === WebSocket.OPEN) {
              try {
                socketRef.current.send(
                  JSON.stringify({ op: "unsubscribe", args: [topic] })
                );
              } catch {}
            }
          }
        }
      });
    };
  };

  return (
    <BybitWSContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </BybitWSContext.Provider>
  );
}

export function useBybitWS() {
  const context = useContext(BybitWSContext);
  if (!context) {
    throw new Error("useBybitWS must be used within BybitWebSocketProvider");
  }
  return context;
}
