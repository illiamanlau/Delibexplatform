import random
import time
import api
import argparse
from itertools import cycle

# Read the file and store all lines in a list
# Ignore empty lines and lines starting with '#'
with open('assets/hate_speech.txt', 'r') as file:
    attacks = list(filter(lambda phrase:
                          phrase and not phrase.startswith('#'),
                     map(lambda phrase:
                         phrase.strip(), file.readlines())))

# Shuffle the list of attacks for a random permutation
random.shuffle(attacks)

# Create a cycle iterator to go through attacks indefinitely
attack_cycle = cycle(attacks)

FREQ = 10.0  # Frequency of sending messages (in seconds)
NAMES = 4    # Number of bot names to be used

def get_parsed_args():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Update frequency, names, and room IDs.")
    
    # Add optional --freq argument
    parser.add_argument(
        '--freq', 
        type=float, 
        help='Frequency value (float), defaults to 10.0'
    )
    
    # Add optional --names argument
    parser.add_argument(
        '--names',
        type=int,
        help='Number of bot names, defaults to 4'
    )
    
    # Add mandatory --roomIds argument
    parser.add_argument(
        '--roomIds',
        required=True,
        help='Comma-separated list of room IDs'
    )

    # Parse the arguments
    return parser.parse_args()

def process_parsed_args(args):
    global FREQ, NAMES, room_ids
    # Update the frequency if provided
    if args.freq is not None:
        FREQ = args.freq
    # Update the number of names if provided
    if args.names is not None:
        NAMES = args.names
    # Split the roomIds argument into a list
    room_ids = args.roomIds.strip(',').split(',')

process_parsed_args(get_parsed_args())

number_list = list(range(1, NAMES + 1))
random.shuffle(number_list)

# Iterate over attack_cycle with enumerate to get index and content
for i, content in enumerate(attack_cycle):
    # Strip any extra whitespace from the content
    content = content.strip()
    
    # Construct the bot name with a cyclic number based on NAMES
    name = "HaterBot" + str(3000 + number_list[i % NAMES])
    
    # Iterate over each roomId and send the message
    for room_id in room_ids:
        response = api.send_message({
            "roomId": room_id,
            "name": name,
            "email": name + '@bot.bot',
            "content": content,
        })
    
    # Wait for the specified time interval before the next message
    time.sleep(FREQ)
