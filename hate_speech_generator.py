import random
import time
import api
import argparse

# Read the file and store all lines in a list
with open('hate_speech.txt', 'r') as file:
    attacks = file.readlines()


FREQ = 10.0     # Frequency of hate texts

# Set the default frequency value

def get_parsed_args():
    # Set up argument parser
    parser = argparse.ArgumentParser(description="Update frequency value.")
    
    # Add optional --freq argument
    parser.add_argument(
        '--freq', 
        type=float, 
        help='Frequency value (float), defaults to 10.0'
    )
    
    # Parse the arguments
    return parser.parse_args()
    
def process_parsed_args(args):
    global FREQ
    # If --freq is provided, update the freq value
    if args.freq is not None:
        FREQ = args.freq

process_parsed_args(get_parsed_args())

# Infinite loop to select random attacks every 10 seconds
while True:
    # Choose a random line and strip any extra whitespace
    message = random.choice(attacks).strip()
    
    # Output the random attack phrase
    response = api.send_message("chat1", "HaterBot3000", message)
    
    # Wait for 10 seconds before choosing again
    time.sleep(FREQ)
