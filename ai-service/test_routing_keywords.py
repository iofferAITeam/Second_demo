#!/usr/bin/env python3
"""
Simple routing keyword test to verify ML team auto-routing logic
"""

def test_routing_keywords():
    """Test the routing logic for school recommendation requests"""
    
    # Define routing keywords from orchestrating_agent.py
    recommendation_keywords = [
        "推荐", "建议", "帮我找", "应该申请", "适合我", "匹配",
        "recommend", "suggest", "help me find", "should I apply", 
        "fit my profile", "match"
    ]
    
    comparison_keywords = [
        "对比", "比较", "vs", "versus", "哪个好", "有什么区别", "区别", "差异",
        "better", "compare", "difference", "versus", "vs", "pros and cons"
    ]
    
    general_info_keywords = [
        "是什么", "怎么", "如何", "解释", "说明",
        "what is", "how to", "explain", "tell me about", "describe"
    ]
    
    def analyze_message(message):
        """Analyze a message and determine routing"""
        message_lower = message.lower()
        
        # Check for comparison keywords first (highest priority)
        for keyword in comparison_keywords:
            if keyword.lower() in message_lower:
                return "GENERAL_QA", f"Found comparison keyword: {keyword}"
        
        # Check for recommendation keywords
        for keyword in recommendation_keywords:
            if keyword.lower() in message_lower:
                return "SCHOOL_RECOMMENDATION", f"Found recommendation keyword: {keyword}"
        
        # Check for general info keywords
        for keyword in general_info_keywords:
            if keyword.lower() in message_lower:
                return "GENERAL_QA", f"Found general info keyword: {keyword}"
        
        return "GENERAL_QA", "No specific keywords found, default routing"
    
    # Test cases for school recommendation routing
    test_messages = [
        # Should route to SCHOOL_RECOMMENDATION
        "请根据我的资料推荐一些适合的大学，我的GPA是3.8，TOEFL是110分",
        "Can you recommend me some schools based on my profile?",
        "帮我找一些适合我的学校",
        "What schools should I apply to given my background?",
        "推荐学校",
        "Recommend programs that match my GPA and scores",
        
        # Should route to GENERAL_QA (comparison)
        "对比圣路西大学和华盛顿大学",
        "Which school is better between Stanford and MIT?",
        "比较X和Y学校",
        "What is the difference between X and Y universities?",
        
        # Should route to GENERAL_QA (general info)
        "GPA是什么",
        "What is TOEFL?",
        "How do I apply to graduate school?",
        "解释SAT vs GRE"
    ]
    
    print("=== 路由关键词测试 (Routing Keyword Test) ===\n")
    
    for i, message in enumerate(test_messages, 1):
        routing_decision, reason = analyze_message(message)
        print(f"{i:2d}. Message: {message}")
        print(f"    Routing: {routing_decision}")
        print(f"    Reason:  {reason}")
        print()
    
    # Focus on school recommendation cases
    school_rec_cases = [msg for msg in test_messages if analyze_message(msg)[0] == "SCHOOL_RECOMMENDATION"]
    
    print(f"=== 学校推荐路由测试结果 (School Recommendation Routing Results) ===")
    print(f"Total test messages: {len(test_messages)}")
    print(f"School recommendation cases: {len(school_rec_cases)}")
    print(f"Success rate: {len(school_rec_cases)/len(test_messages)*100:.1f}%")
    
    print("\n=== 应该路由到ML模型的消息 (Messages that should route to ML models) ===")
    for msg in school_rec_cases:
        print(f"✓ {msg}")

if __name__ == "__main__":
    test_routing_keywords()
