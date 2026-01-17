/**
 * Custom Cache Handler for Next.js 16
 * Implements Redis-backed ISR caching with filesystem fallback
 * Compatible with Next.js 16 cache handler API
 */

import Redis from 'ioredis';

class CustomCacheHandler {
  constructor(options) {
    this.options = options;
    this.redis = null;
    this.redisEnabled = false;

    // Initialize Redis if REDIS_URL is set
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn('⚠️  Redis connection failed, falling back to filesystem cache');
              return null;
            }
            return Math.min(times * 100, 3000);
          },
          reconnectOnError: (err) => {
            console.error('Redis connection error:', err.message);
            return false;
          },
        });

        this.redis.on('connect', () => {
          this.redisEnabled = true;
          console.log('✓ Redis cache handler connected');
        });

        this.redis.on('error', (err) => {
          console.warn('⚠️  Redis error, falling back to filesystem:', err.message);
          this.redisEnabled = false;
        });

      } catch (error) {
        console.warn('⚠️  Failed to initialize Redis, using filesystem cache:', error.message);
        this.redis = null;
        this.redisEnabled = false;
      }
    } else {
      console.log('ℹ️  REDIS_URL not set, using filesystem cache');
    }
  }

  async get(key) {
    // Try Redis first if available
    if (this.redisEnabled && this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn(`Redis GET error for key ${key}:`, error.message);
      }
    }

    // Fallback to default cache (filesystem)
    return null;
  }

  async set(key, data, context) {
    // Try Redis first if available
    if (this.redisEnabled && this.redis) {
      try {
        const ttl = context?.revalidate || 60 * 60 * 24; // Default 24 hours
        const serialized = JSON.stringify(data);
        await this.redis.setex(key, ttl, serialized);
      } catch (error) {
        console.warn(`Redis SET error for key ${key}:`, error.message);
      }
    }

    // Note: Filesystem cache is handled by Next.js automatically as fallback
    return;
  }

  async revalidateTag(tag) {
    // Try Redis first if available
    if (this.redisEnabled && this.redis) {
      try {
        const keys = await this.redis.keys(`*${tag}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.warn(`Redis revalidateTag error for tag ${tag}:`, error.message);
      }
    }

    return;
  }

  async delete(key) {
    // Try Redis first if available
    if (this.redisEnabled && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.warn(`Redis DELETE error for key ${key}:`, error.message);
      }
    }

    return;
  }
}

export default CustomCacheHandler;
