#!/usr/bin/env python3
"""
iOffer AI API 测试客户端

用于测试 WebSocket API 的各种功能，包括连接、消息发送、响应接收等。
"""

import asyncio
import websockets
import json
import time
import argparse
from typing import Dict, Any, Optional

class IOfferAPITestClient:
    """iOffer AI API 测试客户端"""
    
    def __init__(self, url: str = "ws://127.0.0.1:8010/ws"):
        self.url = url
        self.websocket = None
        self.connected = False
        self.message_count = 0
        self.response_count = 0
        
    async def connect(self) -> bool:
        """连接到 WebSocket 服务器"""
        try:
            print(f"🔌 正在连接到 {self.url}...")
            self.websocket = await websockets.connect(self.url)
            self.connected = True
            print("✅ WebSocket 连接成功！")
            return True
        except Exception as e:
            print(f"❌ 连接失败: {e}")
            return False
    
    async def disconnect(self):
        """断开 WebSocket 连接"""
        if self.websocket:
            await self.websocket.close()
            self.connected = False
            print("🔌 连接已断开")
    
    async def send_message(self, content: str, user_id: str = "test_user") -> bool:
        """发送消息到服务器"""
        if not self.connected or not self.websocket:
            print("❌ 未连接到服务器")
            return False
        
        try:
            message = {
                "type": "message",
                "content": content,
                "user_id": user_id
            }
            
            await self.websocket.send(json.dumps(message))
            self.message_count += 1
            print(f"📤 已发送消息 #{self.message_count}: {content[:50]}...")
            return True
            
        except Exception as e:
            print(f"❌ 发送消息失败: {e}")
            return False
    
    async def receive_messages(self, timeout: int = 30) -> Optional[Dict[str, Any]]:
        """接收服务器响应"""
        if not self.connected or not self.websocket:
            return None
        
        try:
            # 设置超时
            response = await asyncio.wait_for(self.websocket.recv(), timeout=timeout)
            data = json.loads(response)
            self.response_count += 1
            
            print(f"📥 收到响应 #{self.response_count}")
            return data
            
        except asyncio.TimeoutError:
            print("⏰ 接收消息超时")
            return None
        except Exception as e:
            print(f"❌ 接收消息错误: {e}")
            return None
    
    def print_response(self, data: Dict[str, Any]):
        """格式化打印响应数据"""
        if data["type"] == "result":
            print("\n" + "="*60)
            print("🤖 AI 回答:")
            print("-" * 30)
            print(data["message"])
            
            if data.get("thinking_process"):
                print("\n🧠 思考过程:")
                print("-" * 30)
                print(data["thinking_process"])
            
            if data.get("reference_links"):
                print("\n🔗 参考链接:")
                print("-" * 30)
                for i, link in enumerate(data["reference_links"], 1):
                    print(f"{i}. {link}")
            
            if data.get("strategy"):
                print(f"\n📋 策略: {data['strategy']}")
            
            if data.get("source"):
                print(f"📚 来源: {data['source']}")
            
            if data.get("rag_similarity"):
                print(f"🎯 RAG 相似度: {data['rag_similarity']}")
            
            if data.get("team_used"):
                print(f"👥 使用团队: {data['team_used']}")
            
            print("="*60 + "\n")
            
        elif data["type"] == "error":
            print(f"\n❌ 错误响应:")
            print(f"   错误代码: {data.get('error_code', 'UNKNOWN')}")
            print(f"   错误信息: {data.get('message', '未知错误')}")
            if data.get("details"):
                print(f"   详细信息: {data['details']}")
            print()
        else:
            print(f"\n📝 其他响应类型: {data['type']}")
            print(f"   内容: {data}")
            print()

class TestSuite:
    """API 测试套件"""
    
    def __init__(self, client: IOfferAPITestClient):
        self.client = client
    
    async def test_connection(self):
        """测试连接功能"""
        print("🔍 测试 1: 连接功能")
        print("-" * 40)
        
        success = await self.client.connect()
        if success:
            print("✅ 连接测试通过")
        else:
            print("❌ 连接测试失败")
        
        return success
    
    async def test_general_qa(self):
        """测试通用问答功能"""
        print("🔍 测试 2: 通用问答功能")
        print("-" * 40)
        
        test_questions = [
            "什么是人工智能？",
            "介绍一下哈佛大学",
            "Python 编程语言有什么特点？"
        ]
        
        for i, question in enumerate(test_questions, 1):
            print(f"\n📝 测试问题 {i}: {question}")
            
            # 发送消息
            if await self.client.send_message(question):
                # 接收响应
                response = await self.client.receive_messages(timeout=30)
                if response:
                    self.client.print_response(response)
                else:
                    print("❌ 未收到响应")
            
            # 等待一下再发送下一条
            await asyncio.sleep(2)
        
        print("✅ 通用问答测试完成")
    
    async def test_school_recommendation(self):
        """测试学校推荐功能"""
        print("🔍 测试 3: 学校推荐功能")
        print("-" * 40)
        
        test_requests = [
            "我是一名计算机科学专业的学生，GPA 3.8，想申请美国的研究生项目，请推荐一些学校",
            "我是商科专业，托福 95，预算每年 4 万美元，推荐一些适合的学校"
        ]
        
        for i, request in enumerate(test_requests, 1):
            print(f"\n📝 测试请求 {i}: {request}")
            
            if await self.client.send_message(request):
                response = await self.client.receive_messages(timeout=30)
                if response:
                    self.client.print_response(response)
                else:
                    print("❌ 未收到响应")
            
            await asyncio.sleep(2)
        
        print("✅ 学校推荐测试完成")
    
    async def test_student_info(self):
        """测试学生信息收集功能"""
        print("🔍 测试 4: 学生信息收集功能")
        print("-" * 40)
        
        test_info = [
            "我叫张三，25岁，计算机科学专业，GPA 3.7，托福 100，GRE 320",
            "我是李四，22岁，商科专业，GPA 3.5，雅思 7.0"
        ]
        
        for i, info in enumerate(test_info, 1):
            print(f"\n📝 测试信息 {i}: {info}")
            
            if await self.client.send_message(info):
                response = await self.client.receive_messages(timeout=30)
                if response:
                    self.client.print_response(response)
                else:
                    print("❌ 未收到响应")
            
            await asyncio.sleep(2)
        
        print("✅ 学生信息收集测试完成")
    
    async def test_error_handling(self):
        """测试错误处理"""
        print("🔍 测试 5: 错误处理")
        print("-" * 40)
        
        # 测试无效消息格式
        print("📝 测试无效消息格式...")
        if self.client.websocket:
            try:
                await self.client.websocket.send("invalid json")
                response = await self.client.receive_messages(timeout=10)
                if response:
                    self.client.print_response(response)
            except Exception as e:
                print(f"❌ 发送无效消息时出错: {e}")
        
        print("✅ 错误处理测试完成")
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始运行 iOffer AI API 测试套件")
        print("=" * 60)
        
        try:
            # 测试连接
            if not await self.test_connection():
                print("❌ 连接测试失败，无法继续其他测试")
                return
            
            # 等待一下确保连接稳定
            await asyncio.sleep(1)
            
            # 运行功能测试
            await self.test_general_qa()
            await asyncio.sleep(2)
            
            await self.test_school_recommendation()
            await asyncio.sleep(2)
            
            await self.test_student_info()
            await asyncio.sleep(2)
            
            await self.test_error_handling()
            
            print("\n🎉 所有测试完成！")
            print(f"📊 统计信息:")
            print(f"   发送消息: {self.client.message_count}")
            print(f"   接收响应: {self.client.response_count}")
            
        except Exception as e:
            print(f"❌ 测试过程中出错: {e}")
        finally:
            await self.client.disconnect()

async def interactive_mode(client: IOfferAPITestClient):
    """交互式测试模式"""
    print("🎮 进入交互式测试模式")
    print("输入 'quit' 退出，输入 'help' 查看帮助")
    
    try:
        while True:
            user_input = input("\n💬 请输入您的问题: ").strip()
            
            if user_input.lower() == 'quit':
                print("👋 再见！")
                break
            elif user_input.lower() == 'help':
                print("📖 帮助信息:")
                print("  - 直接输入问题即可测试 AI 回答")
                print("  - 输入 'quit' 退出程序")
                print("  - 输入 'help' 显示此帮助")
                continue
            elif not user_input:
                continue
            
            # 发送消息
            if await client.send_message(user_input):
                # 接收响应
                response = await client.receive_messages(timeout=30)
                if response:
                    client.print_response(response)
                else:
                    print("❌ 未收到响应")
    
    except KeyboardInterrupt:
        print("\n👋 用户中断，正在退出...")
    finally:
        await client.disconnect()

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="iOffer AI API 测试客户端")
    parser.add_argument("--url", default="ws://127.0.0.1:8010/ws", 
                       help="WebSocket 服务器地址")
    parser.add_argument("--mode", choices=["auto", "interactive"], default="auto",
                       help="测试模式: auto(自动测试) 或 interactive(交互式)")
    
    args = parser.parse_args()
    
    # 创建客户端
    client = IOfferAPITestClient(args.url)
    
    if args.mode == "interactive":
        # 交互式模式
        asyncio.run(interactive_mode(client))
    else:
        # 自动测试模式
        test_suite = TestSuite(client)
        asyncio.run(test_suite.run_all_tests())

if __name__ == "__main__":
    main()
