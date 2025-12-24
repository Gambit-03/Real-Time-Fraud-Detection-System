import redis.asyncio as redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class RedisClient:
    def __init__(self):
        self.redis_client = None

    async def connect(self):
        self.redis_client = await redis.from_url(REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.close()

    async def get_user_profile(self, user_id: str):
        """Get user behavior profile from Redis"""
        profile_key = f"user_profile:{user_id}"
        profile = await self.redis_client.get(profile_key)
        if profile:
            return json.loads(profile)
        return None

    async def update_user_profile(self, user_id: str, profile: dict):
        """Update user behavior profile in Redis"""
        profile_key = f"user_profile:{user_id}"
        await self.redis_client.setex(
            profile_key,
            86400 * 30,  # 30 days TTL
            json.dumps(profile)
        )

    async def cache_transaction(self, transaction_id: str, data: dict, ttl: int = 3600):
        """Cache transaction data"""
        key = f"transaction:{transaction_id}"
        await self.redis_client.setex(key, ttl, json.dumps(data))

    async def get_cached_transaction(self, transaction_id: str):
        """Get cached transaction data"""
        key = f"transaction:{transaction_id}"
        data = await self.redis_client.get(key)
        if data:
            return json.loads(data)
        return None

    async def publish_alert(self, channel: str, message: dict):
        """Publish fraud alert to Redis pub/sub"""
        await self.redis_client.publish(channel, json.dumps(message))

redis_client = RedisClient()

