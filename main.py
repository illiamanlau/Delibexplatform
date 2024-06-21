import asyncio
import json
import argparse

import chatbot
from message_monitor import MessageMonitor  # Import the new MessageMonitor class
import utils

def parse_args():
    parser = argparse.ArgumentParser(description='Speedup configuration')
    
    # Adding optional speedup argument
    parser.add_argument('--speedup', nargs='?', const=10.0, type=float, 
                        help='Set speed up factor (default: 10.0)')
    
    # Add optional --start flag (no extra param, just a flag)
    parser.add_argument(
        '--start', 
        action='store_true',  # If --start is present, this will be True
        help='Bots will start participating right away with a default message'
    )

    # Parsing arguments
    args = parser.parse_args()
    
    return args

def process_args(args):
    if args.start:
        chatbot.SEND_INITIAL_MESSAGE = True

    # Set SPEED_UP_FACTOR from utils
    if args.speedup is not None:
        utils.SPEED_UP_FACTOR = args.speedup
        print(f"Speed up factor set to: {utils.SPEED_UP_FACTOR}")
    else:
        print(f"Speed up factor remains unchanged at: {utils.SPEED_UP_FACTOR}")

def build_system_prompt(general_system_prompt, bot_system_prompt):
    return '\n'.join(general_system_prompt + [''] + bot_system_prompt)

def get_descriptions():
    with open('descriptions.json', 'r') as file:
        data = json.load(file)
    for bot in data["bots"]:
        if "system_prompt" in bot:
            bot["system_prompt"] = build_system_prompt(data["general_system_prompt"], bot["system_prompt"])
    utils.print_json(data["bots"])
    return data["bots"]

args = parse_args()
process_args(args)

bots = [chatbot.LLMBot(description) for description in get_descriptions() if description["bot"]]

async def run_bots_with_monitor():
    monitor = MessageMonitor("http://localhost:3000/api/messages?roomId=chat1", bots)
    bot_tasks = [asyncio.create_task(bot.start_bot()) for bot in bots]
    monitor_task = asyncio.create_task(monitor.start_monitoring())
    
    await asyncio.gather(*bot_tasks, monitor_task)

# Run the bots with the message monitor
asyncio.run(run_bots_with_monitor())