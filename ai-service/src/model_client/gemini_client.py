from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelFamily
from src.settings import settings
from src.model_client.native_gemini_client import get_native_gemini_client

_clients = {}

def get_gemini_model_client(model: str = "gemini-2.5-pro"):
    """
    获取Gemini模型客户端
    现在使用原生Gemini客户端来解决API兼容性问题
    """
    if model in _clients:
        return _clients[model]

    # 使用原生Gemini客户端而不是OpenAI包装器
    client = get_native_gemini_client(model=model)
    _clients[model] = client
    return client

def get_gemini_model_client_legacy(model: str = "gemini-2.5-flash"):
    """
    旧版OpenAI包装器客户端（已知有兼容性问题）
    保留用于回退或调试
    """
    if f"{model}_legacy" in _clients:
        return _clients[f"{model}_legacy"]

    family = ModelFamily.GEMINI_1_5_FLASH  # Default fallback for legacy support
    if model == "gemini-2.5-pro":
        family = ModelFamily.GEMINI_1_5_PRO  # Use closest available family
    elif model == "gemini-2.5-flash":
        family = ModelFamily.GEMINI_1_5_FLASH  # Use closest available family

    client = OpenAIChatCompletionClient(
        model=model,
        base_url="https://generativelanguage.googleapis.com/v1/",
        api_key=settings.GEMINI_API_KEY,
        model_info={
            "vision": False,
            "function_calling": True,
            "json_output": True,
            "family": family,
            "structured_output": True,
            "multiple_system_messages": True,
        },
    )
    _clients[f"{model}_legacy"] = client
    return client