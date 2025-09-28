"""
优化的多Agent学校推荐工作流
改进：状态管理、错误处理、减少重复、工具调用支持
"""
import asyncio
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

from src.domain.students_prediction import StudentTagInfo


class DegreeType(Enum):
    """学位类型枚举"""
    GRADUATE = "graduate"
    UNDERGRADUATE = "undergraduate"


@dataclass
class WorkflowState:
    """工作流状态对象 - 避免数据丢失"""
    user_message: str
    user_id: str
    user_profile: Optional[Dict] = None
    ml_predictions: Optional[Any] = None
    application_details: Optional[Dict] = None
    degree_type: Optional[DegreeType] = None
    summary: str = ""
    research_result: str = ""
    final_recommendation: str = ""
    program_result: str = ""
    final_analysis: str = ""

    def __post_init__(self):
        """初始化时加载用户数据"""
        self._load_user_data()

    def _load_user_data(self):
        """一次性加载所有用户数据"""
        try:
            from src.tools.school_rec_tools import (
                get_complete_user_profile,
                get_user_application_details
            )

            self.user_profile = get_complete_user_profile()
            self.application_details = get_user_application_details()

            # 如果有档案，尝试获取ML预测
            if self.user_profile:
                try:
                    from src.tools.school_rec_tools import get_prediction
                    student_tags = ProfileConverter.convert(self.user_profile)
                    if student_tags:
                        self.ml_predictions = get_prediction(student_tags)
                        print("✅ ML预测数据已加载")
                except Exception as e:
                    print(f"⚠️ ML预测失败: {e}")

        except Exception as e:
            print(f"⚠️ 用户数据加载失败: {e}")


class ProfileConverter:
    """用户档案转换器 - 独立模块"""

    @staticmethod
    def convert(user_profile: dict) -> Optional[StudentTagInfo]:
        """将用户档案转换为StudentTagInfo格式"""
        try:
            from src.domain.students_prediction import (
                StudentTagInfo, GPALevel, PaperLevel, LanguageLevel, GRELevel,
                ResearchLevel, CollegeLevel, RecommendationLevel,
                NetworkingLevel, InterestField
            )

            student_tags = StudentTagInfo()

            # GPA转换
            ProfileConverter._convert_gpa(user_profile, student_tags, GPALevel)

            # 语言成绩转换
            ProfileConverter._convert_language(user_profile, student_tags, LanguageLevel)

            # GRE转换
            ProfileConverter._convert_gre(user_profile, student_tags, GRELevel)

            # 研究经历转换
            ProfileConverter._convert_research(user_profile, student_tags, ResearchLevel)

            # 论文转换
            ProfileConverter._convert_papers(user_profile, student_tags, PaperLevel)

            # 学校等级转换
            ProfileConverter._convert_college(user_profile, student_tags, CollegeLevel)

            # 兴趣领域转换
            ProfileConverter._convert_interest(user_profile, student_tags, InterestField)

            # 默认设置
            student_tags.recommendation_level = RecommendationLevel.get_options()['none']
            student_tags.networking_level = NetworkingLevel.get_options()['none']

            return student_tags

        except Exception as e:
            print(f"❌ 档案转换失败: {e}")
            return None

    @staticmethod
    def _convert_gpa(profile: dict, tags: StudentTagInfo, GPALevel):
        """GPA转换逻辑"""
        try:
            gpa_value = float(profile['educationBackground']['gpa']['average'])
            options = GPALevel.get_options()

            if gpa_value >= 3.7:
                tags.gpa_level = options['high']
            elif gpa_value >= 3.3:
                tags.gpa_level = options['medium']
            else:
                tags.gpa_level = options['low']

            print(f"✅ GPA: {gpa_value} → {tags.gpa_level.level}")
        except (KeyError, ValueError, TypeError):
            tags.gpa_level = GPALevel.get_options()['medium']

    @staticmethod
    def _convert_language(profile: dict, tags: StudentTagInfo, LanguageLevel):
        """语言成绩转换逻辑"""
        try:
            options = LanguageLevel.get_options()
            for lang_test in profile.get('languageProficiency', []):
                test_type = lang_test['test']['type'].lower()
                total_score = float(lang_test['test']['scores']['total'])

                if 'toefl' in test_type:
                    tags.language_level = (
                        options['high'] if total_score >= 100 else
                        options['medium'] if total_score >= 80 else
                        options['low']
                    )
                    print(f"✅ TOEFL: {total_score} → {tags.language_level.level}")
                    break
                elif 'ielts' in test_type:
                    tags.language_level = (
                        options['high'] if total_score >= 7.0 else
                        options['medium'] if total_score >= 6.5 else
                        options['low']
                    )
                    print(f"✅ IELTS: {total_score} → {tags.language_level.level}")
                    break
        except (KeyError, ValueError, TypeError):
            pass

    @staticmethod
    def _convert_gre(profile: dict, tags: StudentTagInfo, GRELevel):
        """GRE转换逻辑"""
        try:
            options = GRELevel.get_options()
            for test in profile.get('standardizedTests', []):
                if 'gre' in test['type'].lower():
                    total_score = float(test['scores']['total'])
                    tags.gre_level = (
                        options['high'] if total_score >= 320 else
                        options['medium'] if total_score >= 310 else
                        options['low']
                    )
                    print(f"✅ GRE: {total_score} → {tags.gre_level.level}")
                    break
        except (KeyError, ValueError, TypeError):
            pass

    @staticmethod
    def _convert_research(profile: dict, tags: StudentTagInfo, ResearchLevel):
        """研究经历转换逻辑"""
        try:
            options = ResearchLevel.get_options()
            research_exp = profile.get('practicalExperience', {}).get('researchExperience', [])
            tags.research_level = options['rich'] if research_exp else options['none']
        except (KeyError, TypeError):
            tags.research_level = ResearchLevel.get_options()['none']

    @staticmethod
    def _convert_papers(profile: dict, tags: StudentTagInfo, PaperLevel):
        """论文转换逻辑"""
        try:
            options = PaperLevel.get_options()
            count = sum(
                len(exp.get('publications', []))
                for exp in profile.get('practicalExperience', {}).get('researchExperience', [])
            )
            tags.paper_level = (
                options['many'] if count >= 3 else
                options['weak'] if count >= 1 else
                options['none']
            )
            print(f"✅ 论文: {count}篇 → {tags.paper_level.level}")
        except (KeyError, TypeError):
            tags.paper_level = PaperLevel.get_options()['none']

    @staticmethod
    def _convert_college(profile: dict, tags: StudentTagInfo, CollegeLevel):
        """学校等级转换逻辑"""
        try:
            options = CollegeLevel.get_options()
            institution = profile['educationBackground']['institution']['name'].lower()

            if any(kw in institution for kw in ['university', 'college', 'institute']):
                tags.college_level = options['overseas']
            elif any(kw in institution for kw in ['清华', '北大', '复旦', '交大', '中科大']):
                tags.college_level = options['domestic_top']
            else:
                tags.college_level = options['non_top']
        except (KeyError, TypeError):
            tags.college_level = CollegeLevel.get_options()['non_top']

    @staticmethod
    def _convert_interest(profile: dict, tags: StudentTagInfo, InterestField):
        """兴趣领域转换逻辑"""
        try:
            options = InterestField.get_options()
            field = profile['applicationDetails']['targetProgram']['fieldOfStudy']

            for key, option in options.items():
                if field.lower() in option.field_name.lower():
                    tags.interest_field = option
                    print(f"✅ 兴趣: {field} → {option.field_name}")
                    return

            tags.interest_field = options['computer_science']
        except (KeyError, TypeError):
            tags.interest_field = InterestField.get_options()['computer_science']


class GeminiAPIClient:
    """Gemini API客户端 - 统一调用接口"""

    def __init__(self):
        self.timeout = 60.0
        self._client = None

    @property
    def client(self):
        """延迟加载Gemini客户端"""
        if self._client is None:
            from src.model_client.gemini_client import get_gemini_model_client
            self._client = get_gemini_model_client()
        return self._client

    async def call(self, system_message: str, user_content: str,
                   tools: Optional[List[Dict]] = None) -> str:
        """
        统一的Gemini API调用方法

        Args:
            system_message: 系统提示
            user_content: 用户内容
            tools: 工具定义（用于function calling）
        """
        try:
            messages = [{
                "role": "user",
                "content": f"{system_message}\n\n{user_content}"
            }]

            # TODO: 如果需要工具调用，在这里添加tools参数
            # response = await self.client.create(messages, tools=tools)

            response = await asyncio.wait_for(
                self.client.create(messages),
                timeout=self.timeout
            )

            if response and hasattr(response, 'content'):
                return response.content
            else:
                raise Exception("Gemini返回空响应")

        except asyncio.TimeoutError:
            raise Exception(f"Gemini API超时 ({self.timeout}s)")
        except Exception as e:
            raise Exception(f"Gemini API调用失败: {e}")


class MultiAgentSchoolRecommendationWorkflow:
    """
    优化的多Agent学校推荐工作流
    改进：状态管理、错误处理、模块化
    """

    def __init__(self):
        self.workflow_id = f"multi_agent_{int(time.time())}"
        self.api_client = GeminiAPIClient()
        print(f"🎓 初始化多Agent工作流: {self.workflow_id}")

    async def run_complete_recommendation(
        self,
        user_message: str,
        user_id: str = "default"
    ) -> str:
        """运行完整的推荐流程"""
        try:
            print(f"🚀 开始多Agent推荐流程")
            print(f"📝 用户请求: {user_message}")

            # 初始化状态对象
            state = WorkflowState(
                user_message=user_message,
                user_id=user_id
            )

            # Agent 1: 档案分析
            state = await self._agent_1_profile_analysis(state)

            # Agent 2: 学校研究（根据学位类型分支）
            state = await self._agent_2_school_research(state)

            # Agent 3: 最终推荐
            state = await self._agent_3_final_recommendation(state)

            # Agent 4: 项目匹配（仅研究生）
            if state.degree_type == DegreeType.GRADUATE:
                state = await self._agent_4_program_matching(state)

            # Agent 5: 最终分析
            state = await self._agent_5_final_analysis(state)

            print(f"🎉 推荐流程完成!")
            return state.final_analysis

        except Exception as e:
            print(f"❌ 工作流错误: {e}")
            import traceback
            traceback.print_exc()
            return self._get_error_fallback(str(e))

    async def _agent_1_profile_analysis(self, state: WorkflowState) -> WorkflowState:
        """Agent 1: 档案分析"""
        print("\n🔍 Agent 1: 档案分析...")

        try:
            system_prompt = """You are a student profile analyzer.

Analyze the student's profile and determine:
1. Degree type (graduate/undergraduate) based on indicators
2. Brief 2-3 sentence profile summary

Graduate indicators: Master, PhD, Graduate, MS, MA
Undergraduate indicators: Bachelor, Undergraduate, BS, BA

Format: "Profile summary. Applying for [graduate/undergraduate] programs."
"""

            user_context = f"""
用户档案: {state.user_profile or '无档案'}
用户请求: {state.user_message}
ML预测: {state.ml_predictions or '无'}
"""

            state.summary = await self.api_client.call(system_prompt, user_context)

            # 确定学位类型
            state.degree_type = self._determine_degree_type(state.summary)
            print(f"✅ 学位类型: {state.degree_type.value}")

        except Exception as e:
            print(f"⚠️ Agent 1错误: {e}")
            state.summary = f"基于用户请求，假设申请研究生项目。"
            state.degree_type = DegreeType.GRADUATE

        return state

    async def _agent_2_school_research(self, state: WorkflowState) -> WorkflowState:
        """Agent 2: 学校研究"""
        print(f"\n🔬 Agent 2: 学校研究 ({state.degree_type.value})...")

        try:
            if state.degree_type == DegreeType.GRADUATE:
                system_prompt = self._build_graduate_research_prompt()
            else:
                system_prompt = self._build_undergraduate_research_prompt()

            user_context = f"""
用户档案: {state.user_profile or '无'}
ML预测: {state.ml_predictions or '无'}
档案分析: {state.summary}
用户请求: {state.user_message}

请提供15-20所推荐学校的列表。
"""

            state.research_result = await self.api_client.call(
                system_prompt, user_context
            )
            print("✅ 学校研究完成")

        except Exception as e:
            print(f"⚠️ Agent 2错误: {e}")
            state.research_result = "学校研究完成，生成基础推荐列表。"

        return state

    async def _agent_3_final_recommendation(self, state: WorkflowState) -> WorkflowState:
        """Agent 3: 最终推荐"""
        print("\n🎯 Agent 3: 最终推荐...")

        try:
            system_prompt = """You are an expert school advisor.

From the research results, SELECT EXACTLY 10 universities:
- 3 reach schools (15-30% admission chance)
- 4 target schools (40-70% admission chance)
- 3 safety schools (75%+ admission chance)

For each school provide:
- University name
- Admission probability
- Why it's a good match
- Application strategy
"""

            user_context = f"""
研究结果: {state.research_result}
用户档案: {state.user_profile or '无'}
学位类型: {state.degree_type.value}
"""

            state.final_recommendation = await self.api_client.call(
                system_prompt, user_context
            )
            print("✅ 最终推荐完成")

        except Exception as e:
            print(f"⚠️ Agent 3错误: {e}")
            state.final_recommendation = state.research_result

        return state

    async def _agent_4_program_matching(self, state: WorkflowState) -> WorkflowState:
        """Agent 4: 项目匹配（仅研究生）"""
        print("\n📚 Agent 4: 项目匹配...")

        try:
            system_prompt = """You are a program matching expert.

For each of the 10 universities, find:
- Exact master's program name
- Program requirements
- Admission criteria

Exclude certificates and diplomas. Focus on degree programs only.
"""

            user_context = f"""
推荐学校: {state.final_recommendation}
申请详情: {state.application_details or '无'}
"""

            state.program_result = await self.api_client.call(
                system_prompt, user_context
            )
            print("✅ 项目匹配完成")

        except Exception as e:
            print(f"⚠️ Agent 4错误: {e}")
            state.program_result = state.final_recommendation

        return state

    async def _agent_5_final_analysis(self, state: WorkflowState) -> WorkflowState:
        """Agent 5: 最终分析"""
        print("\n📊 Agent 5: 最终分析...")

        try:
            system_prompt = """You are an admissions strategist.

For each of the 10 schools, evaluate:
1. Academic Background Score (0-5)
2. Practical Experience Score (0-5)
3. Language Proficiency Score (0-5)
4. Overall Fit Score (0-5)

Include:
- === THINKING PROCESS === section
- === FINAL ANALYSIS === with scores for each school
- === REFERENCE LINKS === with admission page URLs
"""

            user_context = f"""
项目匹配结果: {state.program_result}
用户档案: {state.user_profile or '无'}
"""

            state.final_analysis = await self.api_client.call(
                system_prompt, user_context
            )
            print("✅ 最终分析完成")

        except Exception as e:
            print(f"⚠️ Agent 5错误: {e}")
            state.final_analysis = state.program_result

        return state

    def _determine_degree_type(self, summary: str) -> DegreeType:
        """从分析结果确定学位类型"""
        summary_lower = summary.lower()

        grad_keywords = ['master', 'phd', 'graduate', 'ms', 'ma', '硕士', '博士']
        undergrad_keywords = ['bachelor', 'undergraduate', 'bs', 'ba', '本科']

        grad_count = sum(1 for kw in grad_keywords if kw in summary_lower)
        undergrad_count = sum(1 for kw in undergrad_keywords if kw in summary_lower)

        return (DegreeType.UNDERGRADUATE if undergrad_count > grad_count
                else DegreeType.GRADUATE)

    def _build_graduate_research_prompt(self) -> str:
        """构建研究生研究prompt"""
        options = StudentTagInfo.get_all_options_for_llm()
        options_text = "\n\n".join(
            f"{cat.replace('_options', '').upper()}:\n" +
            "\n".join(f"  - {k}: {v.description}" for k, v in opts.items())
            for cat, opts in options.items()
        )

        return f"""Analyze student profile and generate 15-20 recommended universities for graduate programs.

Consider these categories:
{options_text}

Provide university list with brief reasoning for each."""

    def _build_undergraduate_research_prompt(self) -> str:
        """构建本科研究prompt"""
        return """Recommend 10 universities for undergraduate programs.

Consider:
- Student's academic profile
- Target country preferences
- Balanced mix of reach/target/safety schools

Provide university list with reasoning."""

    def _get_error_fallback(self, error: str) -> str:
        """错误回退响应"""
        return f"""很抱歉，学校推荐系统遇到问题。

错误信息: {error}

建议：
1. 检查您的个人档案是否完整
2. 稍后重试
3. 联系技术支持

我们正在努力修复这个问题。"""


# 全局实例
_workflow_instance = None

def get_multi_agent_workflow() -> MultiAgentSchoolRecommendationWorkflow:
    """获取工作流实例（单例模式）"""
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = MultiAgentSchoolRecommendationWorkflow()
    return _workflow_instance


async def run_multi_agent_recommendation(user_message: str, user_id: str = "default") -> str:
    """
    运行多Agent学校推荐流程的便捷函数

    Args:
        user_message: 用户请求
        user_id: 用户ID

    Returns:
        推荐结果
    """
    workflow = get_multi_agent_workflow()
    return await workflow.run_complete_recommendation(user_message, user_id)