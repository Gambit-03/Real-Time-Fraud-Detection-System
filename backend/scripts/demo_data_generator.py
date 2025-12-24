"""
Generate demo transaction data for live presentation
"""
import asyncio
import aiohttp
import random
from datetime import datetime, timedelta
import json

API_URL = "http://localhost:8000"

merchants = [
    'Amazon', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s',
    'Best Buy', 'Home Depot', 'CVS', 'Shell', 'Exxon',
    'Apple Store', 'Nike', 'Costco', 'Whole Foods', 'Trader Joe\'s'
]

categories = [
    'Retail', 'Food & Dining', 'Gas', 'Groceries', 'Electronics',
    'Entertainment', 'Travel', 'Utilities', 'Healthcare', 'Other'
]

async def generate_transaction(session, user_id=None):
    """Generate and send a single transaction"""
    if user_id is None:
        user_id = f"user_{random.randint(1, 10)}"
    
    transaction_id = f"txn_{int(datetime.now().timestamp() * 1000)}_{random.randint(1000, 9999)}"
    
    # 10% chance of suspicious transaction
    is_suspicious = random.random() < 0.1
    
    if is_suspicious:
        amount = random.uniform(5000, 15000)  # Large amount
        latitude = 40.7128 + random.uniform(-1, 1)  # Far location
        longitude = -74.0060 + random.uniform(-1, 1)
    else:
        amount = random.uniform(10, 500)  # Normal amount
        latitude = 40.7128 + random.uniform(-0.1, 0.1)  # NYC area
        longitude = -74.0060 + random.uniform(-0.1, 0.1)
    
    transaction = {
        "user_id": user_id,
        "transaction_id": transaction_id,
        "amount": round(amount, 2),
        "merchant": random.choice(merchants),
        "category": random.choice(categories),
        "location": f"{latitude:.4f}, {longitude:.4f}",
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        async with session.post(f"{API_URL}/api/transactions", json=transaction) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✓ Transaction {transaction_id}: ${amount:.2f} at {transaction['merchant']} - Risk: {data.get('risk_score', 'N/A')}")
                if data.get('is_fraud'):
                    print(f"  ⚠️  FRAUD DETECTED!")
            else:
                print(f"✗ Failed to create transaction: {response.status}")
    except Exception as e:
        print(f"✗ Error: {e}")

async def run_demo(duration_minutes=5, interval_seconds=2):
    """Run demo for specified duration"""
    print(f"Starting demo - will run for {duration_minutes} minutes")
    print(f"Sending transactions every {interval_seconds} seconds...")
    print("-" * 60)
    
    end_time = datetime.now() + timedelta(minutes=duration_minutes)
    
    async with aiohttp.ClientSession() as session:
        while datetime.now() < end_time:
            await generate_transaction(session)
            await asyncio.sleep(interval_seconds)
    
    print("-" * 60)
    print("Demo completed!")

async def send_batch(count=10):
    """Send a batch of transactions quickly"""
    print(f"Sending {count} transactions...")
    print("-" * 60)
    
    async with aiohttp.ClientSession() as session:
        tasks = [generate_transaction(session) for _ in range(count)]
        await asyncio.gather(*tasks)
    
    print("-" * 60)
    print("Batch completed!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "batch":
            count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            asyncio.run(send_batch(count))
        else:
            duration = int(sys.argv[1])
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 2
            asyncio.run(run_demo(duration, interval))
    else:
        print("Usage:")
        print("  python demo_data_generator.py <duration_minutes> [interval_seconds]")
        print("  python demo_data_generator.py batch [count]")
        print("\nExample:")
        print("  python demo_data_generator.py 5 2  # Run for 5 minutes, send every 2 seconds")
        print("  python demo_data_generator.py batch 20  # Send 20 transactions quickly")

