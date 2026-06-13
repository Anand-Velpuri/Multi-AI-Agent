from typing import Optional
from uuid import uuid4
import json
from langchain_core.messages.ai import AIMessage, AIMessageChunk
from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch
from langchain.agents import create_agent


def serialise_ai_message_chunk(chunk):
    if (isinstance(chunk, (AIMessage, AIMessageChunk))):
        return chunk.content
    else:
        raise TypeError(
            f"Object of type {type(chunk).__name__} is not correctly formatter for serialisation"
        )

def sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


async def generate_agent_responses(llm_id: str, query: str, allow_search: bool, system_prompt: str, checkpointer_id: Optional[str]):

    llm = ChatGroq(model=llm_id)

    tools = [TavilySearch(max_results=5)] if allow_search else []

    agent = create_agent(model=llm,
                         tools=tools,
                         system_prompt=system_prompt
                        )
    
    state = {"messages": query}

    is_new_conversation = checkpointer_id is None

    if is_new_conversation:

        new_checkpointer_id = str(uuid4())

        config = {
            "configurable": {
                "thread_id": new_checkpointer_id,
            }
        }

        events = agent.astream_events(state, version="v2", config=config)

        yield sse({"type": "checkpoint", "checkpoint_id": new_checkpointer_id})
    
    else:

        config = {
            "configurable": {
                "thread_id": checkpointer_id,
            }
        }

        events = agent.astream_events(state, version="v2", config=config)

    async for event in events:
        event_type = event["event"]

        if event_type == "on_chat_model_stream":
            chunk_content = serialise_ai_message_chunk(event["data"]["chunk"])

            if not chunk_content:
                continue

            yield sse({"type": "content", "content": chunk_content})
        
        elif event_type == "on_chat_model_end":
            # check if there are any tool calls
            tool_calls = event["data"]["output"].additional_kwargs.get("tool_calls", []) if "tool_calls" in event["data"]["output"].additional_kwargs else []


            search_calls = [call for call in tool_calls if call["function"]["name"] == "tavily_search"]

            if search_calls:
                search_query = json.loads(search_calls[0]["function"]["arguments"]).get("query", "")

                yield sse({"type": "search_start", "query": search_query})
        
        elif event_type == "on_tool_end" and event["name"] == "tavily_search":
            output = json.loads(event["data"]["output"].content)["results"]

            if isinstance(output, list):
                urls = []
                for item in output:
                    if isinstance(item, dict) and "url" in item:
                        urls.append(item["url"])
            

                yield sse({"type": "search_results", "urls": urls})
    
    yield sse({"type": "end"})
