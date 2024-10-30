import llm_client

client = llm_client.LLMClient({"model" : llm_client.MODEL_NAME})
print(client.complete_from_message("Hello, how are you?"))
