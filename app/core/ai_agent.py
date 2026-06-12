from langchain_groq import ChatGroq
from langchain_tavily import TavilySearch

from langchain.agents import create_agent
from langchain_core.messages.ai import AIMessage

from app.config.settings import settings

def get_response_from_ai_agents(llm_id, query, allow_search, system_prompt):
    
    llm = ChatGroq(model=llm_id)

    tools = [TavilySearch(max_results=2)] if allow_search else []

    agent = create_agent(model=llm,
                               tools=tools,
                               system_prompt=system_prompt
                               )
    
    state = {"messages": query}

    response = agent.invoke(state)

    messages = response.get("messages")

    ai_messages = [message for message in messages if isinstance(message, AIMessage)]

    return ai_messages[-1]

if __name__ == "__main__":
    llm_id = settings.ALLOWED_MODEL_NAMES[0]
    query = "What is the capital of France?"
    allow_search = True
    system_prompt = "You are a helpful assistant."

    response = get_response_from_ai_agents(llm_id, query, allow_search, system_prompt)
    print(response.content)