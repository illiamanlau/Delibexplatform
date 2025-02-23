import asyncio
import argparse
import csv
import faulthandler
import time

import chatbot
import llm_client
from message_monitor import MessageMonitor  # Import the new MessageMonitor class
import utils

faulthandler.enable()

def get_experiment_description_file(experiment_name):
    return f"assets/experiment-descriptions/{experiment_name}.csv"

def parse_args():
    parser = argparse.ArgumentParser(description='Speedup configuration')
    
    # Adding mandatory experiment description argument
    parser.add_argument(
        'experiment_description',
        type=str,
        help='EXPERIMENT_NAME (as described in assets/experiment-descriptions/EXPERIMENT_NAME.csv)'
    )
    
    # Adding optional speedup argument
    parser.add_argument(
        '--speedup', 
        nargs='?', 
        const=1.0,
        type=float,
        help='Set speed up factor (default: 1.0)'
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
    
    # Adding mandatory model argument
    parser.add_argument(
        '--model',
        type=str,
        required=True,
        help='Specify the model to be used (e.g., llama3-8b-8192)'
    )

    # Adding optional delay_seconds argument
    parser.add_argument(
        '--delay_seconds',
        type=float,
        help='Delay initialization by a specified number of seconds'
    )

    # Adding mandatory max_time_to_response argument with default 60 seconds
    parser.add_argument(
        '--max_time_to_response',
        type=int,
        default=60,
        required=True,
        help='Maximum allowed time (in seconds) for the bot to respond (default: 60s)'
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

    # Set OFFLINE from utils
    if args.offline is not None:
        utils.OFFLINE = args.offline
        print(f"Offline flag set to: {utils.OFFLINE}")
    
    # Set MODEL_NAME from llm_client
    llm_client.MODEL_NAME = args.model
    print(f"Model set to: {llm_client.MODEL_NAME}")
    
    print(f"Experiment description: {get_experiment_description_file(args.experiment_description)}")

    if args.delay_seconds is not None:
        print(f"Sleeping for {args.delay_seconds} seconds before initialization")
        time.sleep(args.delay_seconds)

    # Print max_time_to_response
    utils.MAX_RESPONSE_DURATION_S = args.max_time_to_response
    print(f"Max time to response set to: {utils.MAX_RESPONSE_DURATION_S} seconds")

# Parse and process args
args = parse_args()
process_args(args)

# Read experiment description
with open(get_experiment_description_file(args.experiment_description), 'r') as file:
    bot_data = list(csv.DictReader(file))

async def run_bots_with_monitor():
    tasks = []
    for bot_desc in bot_data:
        # Ignore disabled bots
        if bot_desc["enable"] != "true":
            continue

        # Construct bot
        bot = chatbot.LLMBot(bot_desc)

        # Create start bot task
        tasks.append(asyncio.create_task(bot.start_bot()))

        # Create message monitoring task
        monitor = MessageMonitor(f"http://localhost:3000/api/messages?roomId={bot_desc['chatroom']}", bot)
        tasks.append(asyncio.create_task(monitor.start_monitoring()))

    await asyncio.gather(*tasks)

# Run the bots with the message monitor
asyncio.run(run_bots_with_monitor())
