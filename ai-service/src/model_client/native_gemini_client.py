"""
Native Gemini Client for AutoGen compatibility
桥接AutoGen的OpenAI格式和Google Gemini原生API
"""

import asyncio
import json
import httpx
from typing import List, Dict, Any, Optional, AsyncGenerator, Union
from dataclasses import dataclass
from src.settings import settings
import logging
from autogen_core.models import CreateResult, UserMessage, AssistantMessage
from autogen_core._types import FunctionCall

logger = logging.getLogger(__name__)

# AutoGen native types are used instead of custom classes

class NativeGeminiClient:
    """
    原生Gemini客户端，兼容AutoGen的OpenAI接口
    """

    def __init__(self, model: str = "gemini-2.5-pro", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1"
        self.client = httpx.AsyncClient(timeout=60.0)

        # AutoGen兼容性属性
        self.model_info = {
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "structured_output": True,
            "multiple_system_messages": True,
        }

    async def create(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        stream: bool = False,
        **kwargs
    ) -> CreateResult:
        """
        AutoGen兼容的create方法
        """
        try:
            logger.info(f"🎯 Native Gemini Client - Creating completion for model: {model or self.model}")
            logger.info(f"📝 Messages count: {len(messages)}")
            logger.info(f"🔧 Tools count: {len(tools) if tools else 0}")

            # 转换格式
            gemini_request = self._convert_to_gemini_format(messages, tools)
            logger.info(f"📤 Converted to Gemini format: {json.dumps(gemini_request, indent=2)}")

            # 调用Gemini API
            response_data = await self._call_gemini_api(gemini_request, model or self.model)
            logger.info(f"📥 Gemini API response: {json.dumps(response_data, indent=2, ensure_ascii=False)}")

            # 转换回AutoGen格式
            autogen_response = self._convert_to_autogen_format(response_data, tools)
            logger.info(f"✅ Converted to AutoGen format")

            return autogen_response

        except Exception as e:
            logger.error(f"❌ Native Gemini Client error: {e}")
            raise

    async def create_stream(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        **kwargs
    ) -> AsyncGenerator[CreateResult, None]:
        """
        AutoGen兼容的create_stream方法 - 流式响应
        目前简化实现：调用非流式API并作为单个chunk返回
        """
        try:
            logger.info(f"🎯 Native Gemini Client - Creating streaming completion for model: {model or self.model}")

            # 调用非流式create方法
            result = await self.create(
                messages=messages,
                model=model,
                tools=tools,
                tool_choice=tool_choice,
                stream=False,
                **kwargs
            )

            # 作为单个chunk返回
            yield result

        except Exception as e:
            logger.error(f"❌ Native Gemini Client streaming error: {e}")
            raise

    def _convert_to_gemini_format(self, messages: List[Dict[str, Any]], tools: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        将OpenAI格式转换为Gemini格式
        """
        contents = []

        for message in messages:
            # 处理AutoGen的消息对象和字典两种格式
            logger.info(f"🔍 Message type: {type(message)}, message: {message}")

            # 使用try-except更安全地处理不同格式
            try:
                # 先尝试字典格式
                if hasattr(message, 'get') and callable(getattr(message, 'get')):
                    # 普通字典格式
                    logger.info(f"✅ Using dict format")
                    role = message.get("role", "")
                    content = message.get("content", "")
                else:
                    # AutoGen消息对象（SystemMessage, UserMessage, AssistantMessage等）
                    logger.info(f"✅ Using AutoGen message object format")
                    # AutoGen对象使用type属性而不是role
                    message_type = getattr(message, 'type', '')
                    content = getattr(message, 'content', '')

                    # 将AutoGen的type映射到role
                    if message_type == 'SystemMessage':
                        role = 'system'
                    elif message_type == 'UserMessage':
                        role = 'user'
                    elif message_type == 'AssistantMessage':
                        role = 'assistant'
                    else:
                        # 尝试从source属性推断角色
                        source = getattr(message, 'source', '')
                        if source == 'user':
                            role = 'user'
                        else:
                            role = 'assistant'
            except Exception as e:
                logger.error(f"❌ Error processing message {message}: {e}")
                # 回退到对象属性访问
                message_type = getattr(message, 'type', '')
                content = getattr(message, 'content', '')

                # 将AutoGen的type映射到role
                if message_type == 'SystemMessage':
                    role = 'system'
                elif message_type == 'UserMessage':
                    role = 'user'
                elif message_type == 'AssistantMessage':
                    role = 'assistant'
                else:
                    # 尝试从source属性推断角色
                    source = getattr(message, 'source', '')
                    if source == 'user':
                        role = 'user'
                    else:
                        role = 'assistant'

            if role == "system":
                # 系统消息作为第一个用户消息的前缀
                if contents and contents[-1].get("role") == "user":
                    contents[-1]["parts"][0]["text"] = f"{content}\n\n{contents[-1]['parts'][0]['text']}"
                else:
                    contents.append({
                        "role": "user",
                        "parts": [{"text": content}]
                    })
            elif role == "user":
                contents.append({
                    "role": "user",
                    "parts": [{"text": content}]
                })
            elif role == "assistant":
                contents.append({
                    "role": "model",
                    "parts": [{"text": content}]
                })

        request_data = {"contents": contents}

        # 暂时完全跳过工具调用处理，只发送消息内容
        # TODO: 修复Gemini API工具兼容性问题
        if tools:
            logger.info(f"⚠️ Completely skipping tools processing due to API compatibility issues. Found {len(tools)} tools.")
        # 注释掉所有工具处理逻辑
        # if tools:
        #     function_declarations = []
        #     for tool in tools:
        #         logger.info(f"🔧 Tool type: {type(tool)}, tool: {tool}")
        #         try:
        #             # 处理FunctionTool对象和字典两种格式
        #             if hasattr(tool, 'get') and callable(getattr(tool, 'get')):
        #                 # 字典格式
        #                 if tool.get("type") == "function":
        #                     func = tool["function"]
        #                     function_declarations.append({
        #                         "name": func["name"],
        #                         "description": func["description"],
        #                         "parameters": func.get("parameters", {})
        #                     })
        #             else:
        #                 # FunctionTool对象格式
        #                 if hasattr(tool, 'function_schema'):
        #                     schema = tool.function_schema
        #                     function_declarations.append({
        #                         "name": schema.get("name", ""),
        #                         "description": schema.get("description", ""),
        #                         "parameters": schema.get("parameters", {})
        #                     })
        #                 elif hasattr(tool, 'name') and hasattr(tool, 'description'):
        #                     # 直接从对象属性获取
        #                     parameters = getattr(tool, 'parameters', {})
        #                     # 确保parameters有正确的格式
        #                     if not parameters or not isinstance(parameters, dict):
        #                         parameters = {"type": "object", "properties": {}, "required": []}
        #                     function_declarations.append({
        #                         "name": getattr(tool, 'name', ''),
        #                         "description": getattr(tool, 'description', ''),
        #                         "parameters": parameters
        #                     })
        #         except Exception as e:
        #             logger.error(f"❌ Error processing tool {tool}: {e}")
        #             continue
        #     if function_declarations:
        #         request_data["tools"] = [{"functionDeclarations": function_declarations}]

        return request_data

    async def _call_gemini_api(self, request_data: Dict[str, Any], model: str) -> Dict[str, Any]:
        """
        调用Gemini原生API
        """
        url = f"{self.base_url}/models/{model}:generateContent"

        params = {"key": self.api_key}
        headers = {"Content-Type": "application/json"}

        logger.info(f"🌐 Calling Gemini API: {url}")
        logger.info(f"📤 Request data: {json.dumps(request_data, indent=2, ensure_ascii=False)}")

        response = await self.client.post(
            url,
            json=request_data,
            params=params,
            headers=headers
        )

        if response.status_code != 200:
            error_text = response.text
            logger.error(f"❌ Gemini API error {response.status_code}: {error_text}")
            raise Exception(f"Gemini API error {response.status_code}: {error_text}")

        return response.json()

    def _convert_to_autogen_format(self, gemini_response: Dict[str, Any], tools: Optional[List[Dict[str, Any]]] = None) -> CreateResult:
        """
        将Gemini响应转换为AutoGen CreateResult格式
        """
        candidates = gemini_response.get("candidates", [])
        if not candidates:
            raise Exception("No candidates in Gemini response")

        candidate = candidates[0]
        content = candidate.get("content", {})
        parts = content.get("parts", [])

        # 提取文本内容
        message_content = ""
        function_calls = []

        for part in parts:
            if "text" in part:
                message_content += part["text"]
            elif "functionCall" in part:
                # 处理工具调用 - 使用FunctionCall而不是FunctionExecutionResult
                func_call = part["functionCall"]
                function_calls.append(FunctionCall(
                    id=f"call_{len(function_calls)}",
                    name=func_call.get("name", ""),
                    arguments=json.dumps(func_call.get("args", {}))
                ))

        # 构建使用统计
        usage_metadata = gemini_response.get("usageMetadata", {})
        usage = {
            "prompt_tokens": usage_metadata.get("promptTokenCount", 0),
            "completion_tokens": usage_metadata.get("candidatesTokenCount", 0),
            "total_tokens": usage_metadata.get("totalTokenCount", 0)
        }

        # 映射Gemini的finishReason到AutoGen期望的值
        finish_reason_map = {
            "STOP": "stop",
            "MAX_TOKENS": "length",
            "SAFETY": "content_filter",
            "RECITATION": "content_filter",
            "OTHER": "unknown"
        }

        gemini_finish_reason = candidate.get("finishReason", "STOP")
        finish_reason = finish_reason_map.get(gemini_finish_reason, "unknown")

        # 如果有函数调用，finish_reason应该是function_calls
        if function_calls:
            finish_reason = "function_calls"

        # 根据CreateResult的期望格式，content应该是字符串或FunctionCall列表
        if function_calls:
            # 如果有函数调用，返回函数调用列表
            result_content = function_calls
        else:
            # 如果只有文本，返回文本内容
            result_content = message_content if message_content else "No response"

        # 返回CreateResult
        return CreateResult(
            finish_reason=finish_reason,
            content=result_content,
            usage=usage,
            cached=False,
            logprobs=None
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

# 全局客户端缓存
_clients = {}

def get_native_gemini_client(model: str = "gemini-2.5-pro") -> NativeGeminiClient:
    """
    获取原生Gemini客户端实例
    """
    if model not in _clients:
        _clients[model] = NativeGeminiClient(model=model)
        logger.info(f"✅ Created new native Gemini client for model: {model}")

    return _clients[model]