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

def concatenate_files_with_text(file1_path, file2_path):
    with open(file1_path, 'r') as file1:
        content1 = file1.read()
    with open(file2_path, 'r') as file2:
        content2 = file2.read()
    return f"{content1}\n\n{content2}"

class LLMBot(ChatBot):
    def __init__(self, description):
        super().__init__(description)
        if description["role"] == "simple":
            self.system_prompt = concatenate_files_with_text(
                description["path"] + '/behavior-prompt.txt',
                description["path"] + '/simple-prompt.txt')
        else:
            raise Exception("Only accepting simple prompts")
        self.llm_client = llm_client.LLMClient({"model" : "llama3-8b-8192"}, self.logger)
        self.typing_lock = asyncio.Lock()

    async def on_ready(self):
        self.log("on_ready")

        # Build message recorder
        self.messages = conversation_manager.ChatHistoryInteractionManager(
            self.description["display-name"], "test", self.logger)

        greeting = self.llm_client.complete_from_message("Hi!", self.system_prompt)
        self.log(f'Bot is connected and ready as {self.description["display-name"]}. "{greeting}"')
        
        if SEND_INITIAL_MESSAGE:
            await self.send_message("hello everyone!", recorder=self.messages, greeting=True)



