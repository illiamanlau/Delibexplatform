# message_monitor.py
import aiohttp
import time
from datetime import datetime, timezone
import utils

def parse_timestamp(timestamp):
    # Check if the timestamp ends with 'Z' (indicating UTC)
    if timestamp.endswith('Z'):
        # Replace 'Z' with '+00:00'
        timestamp = timestamp[:-1] + '+00:00'
    
    # Use fromisoformat to parse the modified timestamp
    return datetime.fromisoformat(timestamp)

class MessageMonitor:
    def __init__(self, api_url, bots):
        self.api_url = api_url
        self.bots = bots
        self.last_message_timestamp = datetime.min.replace(tzinfo=timezone.utc)

    async def fetch_messages(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(self.api_url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    print(f"Error fetching messages: {response.status}")
                    return []

    def check_new_messages(self, messages):
        new_messages = [
            msg for msg in messages
            if parse_timestamp(msg['timestamp']) > self.last_message_timestamp
        ]
        print("NEW MESSAGES!", new_messages)

    async def update_message_list(self, messages):
        if messages:
            self.last_message_timestamp = max(
                parse_timestamp(msg['timestamp']) for msg in messages
            )
        await self.alert_bots(messages)

    async def alert_bots(self, messages):
        for bot in self.bots:
            await bot.update_messages(messages)

    def log_messages(self, new_messages):
        with open('logs/chat_history.txt', 'a') as f:
            for msg in new_messages:
                log_entry = f"{msg['name']} ({msg['timestamp']}): {msg['content']}\n"
                f.write(log_entry)

    async def start_monitoring(self, interval=3):
        while True:
            starting_time = time.time()
            messages = await self.fetch_messages()
            self.check_new_messages(messages)
            await self.update_message_list(messages)
            end_time = time.time()
            await utils.bot_sleep(interval)
            total_time_after_sleep = time.time()
            print(f'Message update (without sleep) lasted for {end_time - starting_time:.3f}s')
            print(f'Message update (including sleep) lasted for {total_time_after_sleep - starting_time:.3f}s')
