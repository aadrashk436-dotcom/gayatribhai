import { NextRequest } from "next/server";
import fs from "fs";
import { getDbPath, readStoredOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) route for Real-Time Orders & Shiprocket Status updates.
 * - Streams live updates without triggering client-side table unmounts or flickering.
 * - Watches db.json file modification time on server side.
 * - Sends instant push events whenever orders change or live Shiprocket tracking progresses.
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      // 1. Send initial orders payload immediately
      const initialOrders = readStoredOrders();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "INITIAL_SYNC", orders: initialOrders, timestamp: Date.now() })}\n\n`)
      );

      let lastMtime = 0;
      const dbPath = getDbPath();
      try {
        if (fs.existsSync(dbPath)) {
          lastMtime = fs.statSync(dbPath).mtimeMs;
        }
      } catch {}

      // 2. Server-side watcher: checks every 2 seconds for database updates
      const checkInterval = setInterval(() => {
        if (isClosed) return;
        try {
          if (fs.existsSync(dbPath)) {
            const currentMtime = fs.statSync(dbPath).mtimeMs;
            if (currentMtime !== lastMtime) {
              lastMtime = currentMtime;
              const freshOrders = readStoredOrders();
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "ORDERS_UPDATED", orders: freshOrders, timestamp: Date.now() })}\n\n`
                )
              );
            }
          }
        } catch {
          // ignore stat check errors
        }
      }, 2000);

      // 3. Heartbeat ping every 25 seconds to keep the SSE connection alive
      const pingInterval = setInterval(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // connection might have closed
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(checkInterval);
        clearInterval(pingInterval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
