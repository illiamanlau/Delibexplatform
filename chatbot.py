import llm_client
import conversation_manager
import api
import utils

import asyncio
import time

SEND_INITIAL_MESSAGE = False

class ChatBot():
    def __init__(self, description):
        self.description = description
        self.logger = utils.get_logger(description["display-name"])

    async def start_bot(self):
        self.log(f'Starting ChatBot {self.description["display-name"]}')
        await self.on_ready()

    def log(self, msg):
        self.logger.info(msg)

    async def send_message(self, message, recorder=None, greeting=False):
        # Simulate writing message
        if recorder is not None:
            await recorder.write_message(message, greeting)

        self.log(f'Sending message {message[:100]}')
        response = api.send_message({
            "roomId": self.description["chatroom"],
            "name": self.description["display-name"],
            "email": self.description["email"],
            "content": message,
        })
        self.log(f"RESPONSE: {response}")

    async def update_messages(self, messages):
        self.log(f'update_messages()')

        try:
            # Update message list, get whether we need to write a message afterwards
            write_afterwards = await self.messages.update_messages(messages)
            self.log(f"write_afterwards is {write_afterwards}")

            # No message to write
            if not write_afterwards: return

            # Get the next message via GPT
            time_before_llm_call = time.time()
            response = self.llm_client.continue_conversation(await self.messages.get_relevant_history(self.system_prompt))
            self.log(f'LLM call lasted {time.time() - time_before_llm_call:.3f}s')

            # Abort if no response (in principle None, but also acccepting empty strings)
            if not response:
                await self.messages.abort_sending_message()
                return
            
            # Clean the response
            response = utils.clean_text_start(response)
            
            await self.send_message(response, recorder=self.messages)
        except Exception as err:
            self.logger.error(f"Unexpected {err=}, {type(err)=} for on_message")

def join_paragraphs(*paragraphs):
    return '\n\n'.join(*paragraphs)

def read_file_text(filepath):
    with open(filepath, 'r') as file:
        return file.read()

def generate_elaborated_prompt(description_path, llm_client):
    # Read behavior prompt
    behavior_prompt_text = read_file_text(description_path + '/behavior-prompt.txt')

    # Read elaborated prompt
    elaborated_prompt_text = read_file_text(description_path + '/elaborated-prompt.txt')

    # Get self-reflected response
    self_reflection_response = llm_client.complete_from_message(elaborated_prompt_text)

    # Complete the elaborated prompt
    elaborated_prompt_completion_text = read_file_text(description_path + '/elaborated-prompt-completion.txt')

    # Merge all paragraphs
    return join_paragraphs(
        behavior_prompt_text,
        elaborated_prompt_text,
        self_reflection_response,
        elaborated_prompt_completion_text,
    )

class LLMBot(ChatBot):
    def __init__(self, description):
        super().__init__(description)

        self.llm_client = llm_client.LLMClient({"model" : "llama3-8b-8192"}, self.logger)
        self.typing_lock = asyncio.Lock()

        if description["role"] == "simple":
            self.system_prompt = join_paragraphs(map(read_file_text, [
                description["path"] + '/behavior-prompt.txt',
                description["path"] + '/simple-prompt.txt'
            ]))
        else:
            self.system_prompt = generate_elaborated_prompt(description["path"], self.llm_client)
            self.log(f'Elaborated system prompt:\n {self.system_prompt}')

    async def on_ready(self):
        self.log("on_ready")

        # Build message recorder
        self.messages = conversation_manager.ChatHistoryInteractionManager(
            self.description["display-name"], "test", self.logger)

        greeting = self.llm_client.complete_from_message("Hi!", self.system_prompt)
        self.log(f'Bot is connected and ready as {self.description["display-name"]}. "{greeting}"')
        
        if SEND_INITIAL_MESSAGE:
            await self.send_message("hello everyone!", recorder=self.messages, greeting=True)



