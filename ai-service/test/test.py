from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from src.agents.orchestrating_agent import get_orchestrating_agent
from src.teams.student_info_team import create_student_info_team
from src.utils.session_manager import init_session
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.messages import TextMessage, UserInputRequestedEvent
from autogen_agentchat.agents import UserProxyAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_core import CancellationToken

import logging

logger = logging.getLogger(__name__)

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var ws = new WebSocket("ws://localhost:8000/ws");
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@app.get("/")
async def get():
    return HTMLResponse(html)



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    profile = init_session("12321")

    # User input function used by the team.
    async def _user_input(prompt: str, cancellation_token: CancellationToken | None) -> str:
        try:
            data = await websocket.receive_text()
            return data
        except WebSocketDisconnect:
            # Client disconnected while waiting for input - this is the root cause of the issue
            logger.info("Client disconnected while waiting for user input")
            raise  # Let WebSocketDisconnect propagate to be handled by outer try/except

        
    orchestrating_agent = get_orchestrating_agent()
    # student_info_team = create_student_info_team()
    user_proxy = UserProxyAgent("user_proxy", input_func=_user_input)

    while True:
        data = await websocket.receive_text()

        routing_team = RoundRobinGroupChat([orchestrating_agent, user_proxy],
                        termination_condition=TextMentionTermination("TRANSFER_TO_")
                    )
        
        async for event in routing_team.run_stream(task=data):
            await websocket.send_text(f"Message text was: {event}")


        # stream = student_info_team.run_stream(task=data)
        # async for event in stream:
        #     await websocket.send_text(f"Message from Student Info team was: {event}")