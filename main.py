import asyncio
import json
import argparse

import chatbot
from message_monitor import MessageMonitor  # Import the new MessageMonitor class
import utils

def parse_args():
    parser = argparse.ArgumentParser(description='Speedup configuration')
    
    # Adding mandatory experiment description argument
    parser.add_argument(
        'experiment_description',
        type=str,
        help='Experiment description folder (format: experiment-description/experiment_name.json)'
    )
    
    # Adding optional speedup argument
    parser.add_argument(
        '--speedup', 
        nargs='?', 
        const=10.0, 
        type=float,
        help='Set speed up factor (default: 10.0)'
    )
    
    # Add optional --offline flag (no extra param, just a flag)
    parser.add_argument(
        '--offline',
        action='store_true',
        help='Bots will not interact with the LLM, they will just output some default text'
    )

    # Add optional --start flag (no extra param, just a flag)
    parser.add_argument(
        '--start',
        action='store_true',
        help='Bots will start participating right away with a default message'
    )
    
    # Parsing arguments
    args = parser.parse_args()
    
    # Validate experiment description format
    # if not os.path.isdir(args.experiment_description):
    #    parser.error("The experiment description must be in the format 'experiment-description/something'")
    
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

    # Set OFFLINE from utils
    if args.offline is not None:
        utils.OFFLINE = args.offline
        print(f"Offline flag set to: {utils.OFFLINE}")

    print(f"Experiment description: {args.experiment_description}")

def build_system_prompt(general_system_prompt, bot_system_prompt):
    return '\n'.join(general_system_prompt + [''] + bot_system_prompt)

# Parse and process args
args = parse_args()
process_args(args)

# Read experiment description
with open(args.experiment_description, 'r') as file:
    bot_data = json.load(file)

bots = list(map(chatbot.LLMBot, filter(lambda bot: bot["enable"], bot_data)))

async def run_bots_with_monitor():
    monitor = MessageMonitor("http://localhost:3000/api/messages?roomId=test", bots)
    bot_tasks = [asyncio.create_task(bot.start_bot()) for bot in bots]
    monitor_task = asyncio.create_task(monitor.start_monitoring())
    
    await asyncio.gather(*bot_tasks, monitor_task)

# Run the bots with the message monitor
asyncio.run(run_bots_with_monitor())