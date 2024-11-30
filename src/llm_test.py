import llm_client
import utils

client = llm_client.LLMClient({"model" : llm_client.MODEL_NAME}, utils.get_logger("llm_test"))
print(client.complete_from_message("Hello, how are you?"))
