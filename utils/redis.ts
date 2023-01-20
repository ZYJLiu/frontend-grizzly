// redis-server
// redis-cli

import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL!)

// export const redis = new Redis({
//   host: "localhost",
//   port: 6379,
// })
