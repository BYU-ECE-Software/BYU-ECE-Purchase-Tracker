// sessions.js
/*import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

export async function setupSessions(app) {
  // Behind a proxy/ingress? Needed for secure cookies.
  app.set("trust proxy", 1);

  // Create Redis client
  const redis = createClient({
    url: process.env.REDIS_URL, // e.g. redis://:pass@redis:6379/0  OR  rediss://:pass@host:port/0
    socket: {
      // sensible reconnect strategy
      reconnectStrategy: (retries) => Math.min(50, retries) * 100,
    },
  });

  redis.on("error", (err) => console.error("Redis error:", err));
  await redis.connect();

  // Use cookie maxAge as TTL in Redis
  const ONE_HOUR = 1000 * 60 * 60;
  const cookieMaxAge = 8 * ONE_HOUR; // 8h session

  app.use(
    session({
      store: new RedisStore({ client: redis, prefix: "sess:" }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: cookieMaxAge,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production", // requires HTTPS in prod
      },
    })
  );

  return redis; // if you want to reuse the client elsewhere
}*/
