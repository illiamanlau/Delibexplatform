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

FREQ = None     # Frequency of sending messages (in seconds)
NAMES = None    # Display names used the haterbots

def get_parsed_args():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Update frequency, names, and room IDs.")
    
    # Add --freq argument
    parser.add_argument(
        '--freq',
        required=True,
        type=float, 
        help='Frequency value (float), defaults to 10.0'
    )
    
    # Add --names argument
    parser.add_argument(
        '--names',
        required=True,
        help='List of bot names'
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
        NAMES = args.names.strip().strip(',').split(',')
        assert len(NAMES) > 0, f"List of names is empty. Original string was {args.names}."
    # Split the roomIds argument into a list
    room_ids = args.roomIds.strip(',').split(',')

process_parsed_args(get_parsed_args())

random.shuffle(NAMES)

# Iterate over attack_cycle with enumerate to get index and content
for i, content in enumerate(attack_cycle):
    # Strip any extra whitespace from the content
    content = content.strip()
    
    # Use the same haterbot name cyclically
    name = NAMES[i % len(NAMES)]
    
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
