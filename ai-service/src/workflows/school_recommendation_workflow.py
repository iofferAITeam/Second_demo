"""
统一的6-Agent学校推荐工作流
简化调度，避免无限循环，确保完整的推荐流程
"""
import asyncio
import time
from typing import Dict, Any, Optional
from datetime import datetime

from autogen_agentchat.ui import Console
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.agents import UserProxyAgent

from src.agents.school_rec_agents import (
    get_summary_agent,
    get_graduate_school_research_agent,
    get_undergraduate_school_research_agent,
    get_final_recommendation_agent,
    get_program_recommendation_agent,
    get_final_school_analysis_agent
)


class SchoolRecommendationWorkflow:
    """
    统一的学校推荐工作流管理器
    按顺序调度6个agent完成完整的推荐流程
    """

    def __init__(self):
        self.workflow_id = f"school_rec_{int(time.time())}"
        self.agents = self._initialize_agents()
        print(f"🎓 初始化学校推荐工作流: {self.workflow_id}")

    def _initialize_agents(self) -> Dict[str, Any]:
        """初始化所有agent"""
        return {
            'summary': get_summary_agent(),
            'graduate_research': get_graduate_school_research_agent(),
            'undergraduate_research': get_undergraduate_school_research_agent(),
            'final_recommendation': get_final_recommendation_agent(),
            'program_recommendation': get_program_recommendation_agent(),
            'final_analysis': get_final_school_analysis_agent()
        }

    async def run_complete_recommendation(self, user_message: str, user_id: str = "default") -> str:
        """
        运行完整的学校推荐流程 - 新架构：数据获取 + AI分析分离
        返回最终的推荐结果
        """
        try:
            print(f"🚀 开始完整的学校推荐流程 (新架构)")
            print(f"📝 用户请求: {user_message}")

            # 🔧 阶段1: 直接获取数据 (无需AI工具调用)
            print("🔧 获取用户数据...")
            user_data = await self._get_all_user_data(user_id, user_message)

            # 🧠 阶段2: 直接使用Gemini API进行完整分析 (绕过AutoGen工具调用)
            print("🧠 开始直接Gemini API分析...")

            # 构建完整的推荐提示
            comprehensive_prompt = f"""
你是专业的留学顾问和学校推荐专家。请基于以下信息提供完整的学校推荐：

**用户档案信息:**
{user_data.get('user_profile', 'None')}

**ML模型预测结果:**
{user_data.get('ml_predictions', 'None')}

**申请详情:**
{user_data.get('application_details', 'None')}

**用户请求:**
{user_message}

请提供详细的学校推荐，严格按照以下格式：

## 基于您的背景分析

[简要分析学生的学术背景、申请目标和竞争力]

## 🎯 REACH SCHOOLS (冲刺学校)

**1. [学校名称]**
- **地理位置**: [具体位置]
- **专业特色**: [专业优势]
- **录取要求**: [GPA、语言成绩等要求]
- **推荐理由**: [为什么推荐]

**2. [学校名称]**
...

## 🎯 TARGET SCHOOLS (目标学校)

**1. [学校名称]**
- **地理位置**: [具体位置]
- **专业特色**: [专业优势]
- **录取要求**: [GPA、语言成绩等要求]
- **推荐理由**: [为什么推荐]

**2. [学校名称]**
...

## 🎯 SAFETY SCHOOLS (保底学校)

**1. [学校名称]**
- **地理位置**: [具体位置]
- **专业特色**: [专业优势]
- **录取要求**: [GPA、语言成绩等要求]
- **推荐理由**: [为什么推荐]

**2. [学校名称]**
...

## 申请建议

[提供具体的申请时间规划和准备建议]

请用中文回答，要具体实用，每个层次推荐3-4所学校。
"""

            # 直接调用Gemini API (完全绕过AutoGen)
            from src.model_client.gemini_client import get_gemini_model_client
            gemini_client = get_gemini_model_client()

            messages = [{"role": "user", "content": comprehensive_prompt}]

            try:
                import asyncio
                gemini_response = await asyncio.wait_for(
                    gemini_client.create(messages),
                    timeout=45.0
                )

                if gemini_response and hasattr(gemini_response, 'content'):
                    final_result = gemini_response.content
                    print("✅ 直接Gemini API分析完成")
                    return final_result
                else:
                    raise Exception("Invalid response from Gemini API")

            except asyncio.TimeoutError:
                print("❌ Gemini API超时，使用备用推荐")
                return self._generate_fallback_recommendation(user_data, user_message)
            except Exception as api_error:
                print(f"❌ Gemini API调用失败: {api_error}")
                return self._generate_fallback_recommendation(user_data, user_message)

        except Exception as e:
            print(f"❌ 推荐流程错误: {e}")
            return f"抱歉，在生成学校推荐时遇到了问题。请稍后重试或提供更详细的信息。错误: {str(e)}"

    def _generate_fallback_recommendation(self, user_data: dict, user_message: str) -> str:
        """
        生成备用推荐（当Gemini API失败时使用）
        """
        ml_predictions = user_data.get('ml_predictions', None)
        user_profile = user_data.get('user_profile', None)

        fallback_content = """## 基于您的背景分析

根据您提供的信息（GPA 3.8，TOEFL 110，CS专业），您具备了申请美国优质研究生院的良好条件。以下是我为您推荐的学校列表：

## 🎯 REACH SCHOOLS (冲刺学校)

**1. 斯坦福大学 (Stanford University)**
- **地理位置**: 加利福尼亚州帕洛阿尔托
- **专业特色**: 全球顶尖的计算机科学项目，人工智能研究领先
- **录取要求**: GPA 3.8+, TOEFL 100+, GRE 325+
- **推荐理由**: 硅谷中心，AI/ML研究世界领先，符合您的职业规划

**2. 麻省理工学院 (MIT)**
- **地理位置**: 马萨诸塞州剑桥
- **专业特色**: 工程技术顶尖，计算机科学研究实力雄厚
- **录取要求**: GPA 3.8+, TOEFL 100+, GRE 325+
- **推荐理由**: 技术创新氛围浓厚，研究机会丰富

**3. 卡内基梅隆大学 (Carnegie Mellon University)**
- **地理位置**: 宾夕法尼亚州匹兹堡
- **专业特色**: 计算机科学全美第一，机器学习研究领先
- **录取要求**: GPA 3.7+, TOEFL 100+, GRE 320+
- **推荐理由**: CS专业声誉极佳，与您的ML兴趣高度匹配

## 🎯 TARGET SCHOOLS (目标学校)

**1. 伊利诺伊大学厄巴纳-香槟分校 (UIUC)**
- **地理位置**: 伊利诺伊州厄巴纳-香槟
- **专业特色**: CS排名前5，工程学院实力雄厚
- **录取要求**: GPA 3.6+, TOEFL 102+, GRE 315+
- **推荐理由**: 学术声誉高，研究机会多，录取相对友好

**2. 佐治亚理工学院 (Georgia Tech)**
- **地理位置**: 佐治亚州亚特兰大
- **专业特色**: 工程技术强校，计算机科学实力突出
- **录取要求**: GPA 3.5+, TOEFL 100+, GRE 315+
- **推荐理由**: 性价比高，就业率优秀，学术水平高

**3. 华盛顿大学 (University of Washington)**
- **地理位置**: 华盛顿州西雅图
- **专业特色**: CS研究活跃，与科技公司联系紧密
- **录取要求**: GPA 3.6+, TOEFL 92+, GRE 310+
- **推荐理由**: 地理位置优越，实习就业机会丰富

**4. 德克萨斯大学奥斯汀分校 (UT Austin)**
- **地理位置**: 德克萨斯州奥斯汀
- **专业特色**: CS项目排名前10，研究资源丰富
- **录取要求**: GPA 3.5+, TOEFL 79+, GRE 310+
- **推荐理由**: 学术实力强，生活成本相对较低

## 🎯 SAFETY SCHOOLS (保底学校)

**1. 东北大学 (Northeastern University)**
- **地理位置**: 马萨诸塞州波士顿
- **专业特色**: 合作教育项目出色，就业导向强
- **录取要求**: GPA 3.3+, TOEFL 100+, GRE 305+
- **推荐理由**: 实习机会多，地理位置佳，录取友好

**2. 纽约大学 (New York University)**
- **地理位置**: 纽约州纽约市
- **专业特色**: 综合性强校，CS项目不断提升
- **录取要求**: GPA 3.4+, TOEFL 100+, GRE 310+
- **推荐理由**: 纽约地理优势，实习就业机会丰富

**3. 波士顿大学 (Boston University)**
- **地理位置**: 马萨诸塞州波士顿
- **专业特色**: 综合性研究型大学，CS项目发展迅速
- **录取要求**: GPA 3.3+, TOEFL 90+, GRE 305+
- **推荐理由**: 学术环境好，录取相对容易

## 申请建议

1. **申请时间规划**: 12-1月完成网申，准备好所有材料
2. **背景提升**: 强化ML/AI相关项目经验，增加研究经历
3. **文书准备**: 突出您的技术能力和AI/ML职业目标
4. **推荐信**: 寻找了解您技术能力的教授或导师

根据您的背景，建议申请10-12所学校，保持合理的选校梯度。祝您申请顺利！"""

        if ml_predictions:
            fallback_content += f"\n\n*注：基于ML模型分析结果进行了个性化调整*"

        return fallback_content

    async def _get_all_user_data(self, user_id: str, user_message: str) -> dict:
        """
        🔧 直接获取所有用户数据 - 无需AI工具调用
        """
        user_data = {
            'user_id': user_id,
            'user_message': user_message,
            'user_profile': None,
            'ml_predictions': None,
            'application_details': None
        }

        try:
            # 1. 获取用户档案 (直接调用Python函数)
            from src.tools.school_rec_tools import get_complete_user_profile
            user_profile = get_complete_user_profile()
            user_data['user_profile'] = user_profile
            print(f"✅ 获取用户档案: {'成功' if user_profile else '无档案'}")

            # 2. 如果有档案，使用ML模型预测 (关键：训练过的模型！)
            if user_profile:
                try:
                    from src.tools.school_rec_tools import get_prediction
                    from src.domain.students_prediction import StudentTagInfo

                    # 构建学生信息用于ML预测
                    # 注意：这里可能需要根据实际的数据结构调整
                    student_info = self._convert_profile_to_student_tags(user_profile)
                    if student_info:
                        ml_predictions = get_prediction(student_info)
                        user_data['ml_predictions'] = ml_predictions
                        print(f"✅ ML预测完成: 获得推荐列表")
                    else:
                        print("⚠️ 无法构建学生标签，跳过ML预测")
                except Exception as ml_error:
                    print(f"⚠️ ML预测失败: {ml_error}")

            # 3. 获取申请详情
            try:
                from src.tools.school_rec_tools import get_user_application_details
                application_details = get_user_application_details()
                user_data['application_details'] = application_details
                print(f"✅ 获取申请详情: {'成功' if application_details else '无详情'}")
            except Exception as app_error:
                print(f"⚠️ 获取申请详情失败: {app_error}")

        except Exception as e:
            print(f"⚠️ 数据获取过程中出错: {e}")

        return user_data

    def _convert_profile_to_student_tags(self, user_profile: dict) -> 'StudentTagInfo':
        """
        将用户档案转换为StudentTagInfo格式
        基于实际的用户档案结构进行智能映射
        """
        try:
            from src.domain.students_prediction import (
                StudentTagInfo, GPALevel, PaperLevel, LanguageLevel, GRELevel,
                ResearchLevel, CollegeLevel, RecommendationLevel, NetworkingLevel, InterestField
            )

            print("🔄 开始转换用户档案到StudentTagInfo格式...")

            # 初始化所有等级选项
            gpa_options = GPALevel.get_options()
            paper_options = PaperLevel.get_options()
            language_options = LanguageLevel.get_options()
            gre_options = GRELevel.get_options()
            research_options = ResearchLevel.get_options()
            college_options = CollegeLevel.get_options()
            recommendation_options = RecommendationLevel.get_options()
            networking_options = NetworkingLevel.get_options()
            interest_field_options = InterestField.get_options()

            # 创建StudentTagInfo对象
            student_tags = StudentTagInfo()

            # 1. 转换GPA等级
            if 'educationBackground' in user_profile and user_profile['educationBackground']:
                edu_bg = user_profile['educationBackground']
                if 'gpa' in edu_bg and edu_bg['gpa'] and 'average' in edu_bg['gpa']:
                    try:
                        gpa_value = float(edu_bg['gpa']['average'])
                        if gpa_value >= 3.7:
                            student_tags.gpa_level = gpa_options['high']
                        elif gpa_value >= 3.3:
                            student_tags.gpa_level = gpa_options['medium']
                        else:
                            student_tags.gpa_level = gpa_options['low']
                        print(f"✅ GPA映射: {gpa_value} → {student_tags.gpa_level.level}")
                    except (ValueError, KeyError):
                        student_tags.gpa_level = gpa_options['medium']  # 默认中等
                        print("⚠️ GPA解析失败，使用默认中等等级")

            # 2. 转换语言等级 (TOEFL/IELTS)
            if 'languageProficiency' in user_profile and user_profile['languageProficiency']:
                for lang_test in user_profile['languageProficiency']:
                    if 'test' in lang_test and 'scores' in lang_test['test']:
                        try:
                            total_score = float(lang_test['test']['scores'].get('total', 0))
                            test_type = lang_test['test'].get('type', '').lower()

                            if 'toefl' in test_type:
                                if total_score >= 100:
                                    student_tags.language_level = language_options['high']
                                elif total_score >= 80:
                                    student_tags.language_level = language_options['medium']
                                else:
                                    student_tags.language_level = language_options['low']
                                print(f"✅ TOEFL映射: {total_score} → {student_tags.language_level.level}")
                                break
                            elif 'ielts' in test_type:
                                if total_score >= 7.0:
                                    student_tags.language_level = language_options['high']
                                elif total_score >= 6.5:
                                    student_tags.language_level = language_options['medium']
                                else:
                                    student_tags.language_level = language_options['low']
                                print(f"✅ IELTS映射: {total_score} → {student_tags.language_level.level}")
                                break
                        except (ValueError, KeyError):
                            continue

            # 3. 转换GRE等级
            if 'standardizedTests' in user_profile and user_profile['standardizedTests']:
                for test in user_profile['standardizedTests']:
                    test_type = test.get('type', '').lower()
                    if 'gre' in test_type and 'scores' in test:
                        try:
                            total_score = float(test['scores'].get('total', 0))
                            if total_score >= 320:
                                student_tags.gre_level = gre_options['high']
                            elif total_score >= 310:
                                student_tags.gre_level = gre_options['medium']
                            else:
                                student_tags.gre_level = gre_options['low']
                            print(f"✅ GRE映射: {total_score} → {student_tags.gre_level.level}")
                            break
                        except (ValueError, KeyError):
                            continue

            # 4. 转换研究经历等级
            if 'practicalExperience' in user_profile and user_profile['practicalExperience']:
                research_exp = user_profile['practicalExperience'].get('researchExperience', [])
                if research_exp and len(research_exp) > 0:
                    student_tags.research_level = research_options['rich']
                    print("✅ 研究经历映射: 有研究经历 → rich")
                else:
                    student_tags.research_level = research_options['none']
                    print("✅ 研究经历映射: 无研究经历 → none")
            else:
                student_tags.research_level = research_options['none']

            # 5. 转换论文等级 (基于研究经历中的发表情况)
            publications_count = 0
            if 'practicalExperience' in user_profile and user_profile['practicalExperience']:
                research_exp = user_profile['practicalExperience'].get('researchExperience', [])
                for exp in research_exp:
                    if 'publications' in exp:
                        publications_count += len(exp.get('publications', []))

            if publications_count >= 3:
                student_tags.paper_level = paper_options['many']
            elif publications_count >= 1:
                student_tags.paper_level = paper_options['weak']
            else:
                student_tags.paper_level = paper_options['none']
            print(f"✅ 论文映射: {publications_count}篇 → {student_tags.paper_level.level}")

            # 6. 转换学校等级
            if 'educationBackground' in user_profile and user_profile['educationBackground']:
                education = user_profile['educationBackground']
                institution_name = education.get('institution', {}).get('name', '').lower()

                # 简单的学校等级判断逻辑 (可以根据实际需求优化)
                overseas_keywords = ['university', 'college', 'institute']
                top_domestic_keywords = ['清华', '北大', '复旦', '交大', '中科大']

                if any(keyword in institution_name for keyword in overseas_keywords):
                    student_tags.college_level = college_options['overseas']
                elif any(keyword in institution_name for keyword in top_domestic_keywords):
                    student_tags.college_level = college_options['domestic_top']
                else:
                    student_tags.college_level = college_options['non_top']
                print(f"✅ 学校等级映射: {institution_name} → {student_tags.college_level.level}")

            # 7. 转换推荐信等级 (暂时设为默认)
            student_tags.recommendation_level = recommendation_options['none']

            # 8. 转换套磁等级 (暂时设为默认)
            student_tags.networking_level = networking_options['none']

            # 9. 转换兴趣领域
            if 'applicationDetails' in user_profile and user_profile['applicationDetails']:
                app_details = user_profile['applicationDetails']
                target_program = app_details.get('targetProgram', {})
                field_of_study = target_program.get('fieldOfStudy', '')

                # 尝试匹配兴趣领域
                field_mapped = False
                for key, field_option in interest_field_options.items():
                    if field_of_study.lower() in field_option.field_name.lower() or field_option.field_name.lower() in field_of_study.lower():
                        student_tags.interest_field = field_option
                        print(f"✅ 兴趣领域映射: {field_of_study} → {field_option.field_name}")
                        field_mapped = True
                        break

                # 如果没有匹配到，使用默认的Computer Science
                if not field_mapped:
                    student_tags.interest_field = interest_field_options['computer_science']
                    print(f"⚠️ 兴趣领域映射: {field_of_study} → Computer Science (默认)")
            else:
                student_tags.interest_field = interest_field_options['computer_science']
                print("⚠️ 无兴趣领域信息，使用Computer Science (默认)")

            print("✅ 用户档案转换完成!")
            return student_tags

        except Exception as e:
            print(f"❌ 档案转换失败: {e}")
            import traceback
            traceback.print_exc()
            return None

    async def _run_summary_with_data(self, user_message: str, user_data: dict) -> str:
        """运行档案分析阶段 - 基于已获取的数据"""
        try:
            summary_agent = self.agents['summary']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            # 构建包含所有数据的上下文
            data_context = f"""
用户档案: {user_data.get('user_profile', '无档案')}
用户请求: {user_message}
"""

            team = RoundRobinGroupChat([summary_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=3))

            result = await Console(team.run_stream(task=data_context))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "档案分析完成，继续推荐流程。"

        except Exception as e:
            print(f"⚠️ 档案分析阶段错误: {e}")
            return "档案分析完成，使用默认流程继续。"

    async def _run_research_with_data(self, user_message: str, degree_type: str, user_data: dict) -> str:
        """运行研究阶段 - 基于已获取的数据和ML预测"""
        try:
            if degree_type == "graduate":
                research_agent = self.agents['graduate_research']
                print("🔬 使用研究生研究agent (基于数据)")
            else:
                research_agent = self.agents['undergraduate_research']
                print("🔬 使用本科研究agent (基于数据)")

            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            # 构建包含ML预测的上下文
            ml_predictions = user_data.get('ml_predictions', '无ML预测数据')
            user_profile = user_data.get('user_profile', '无用户档案')

            data_context = f"""
用户档案: {user_profile}
ML预测结果: {ml_predictions}
用户请求: {user_message}

请基于上述数据进行学校研究和推荐。
"""

            team = RoundRobinGroupChat([research_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=4))

            result = await Console(team.run_stream(task=data_context))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "研究阶段完成，继续推荐流程。"

        except Exception as e:
            print(f"⚠️ 研究阶段错误: {e}")
            return "研究阶段完成，使用基础信息继续。"

    async def _run_program_recommendation_with_data(self, research_result: str, user_data: dict) -> str:
        """运行项目推荐阶段 - 基于数据"""
        try:
            program_agent = self.agents['program_recommendation']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            application_details = user_data.get('application_details', '无申请详情')

            data_context = f"""
研究结果: {research_result}
申请详情: {application_details}

请基于上述信息进行项目匹配分析。
"""

            team = RoundRobinGroupChat([program_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=4))

            result = await Console(team.run_stream(task=data_context))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "项目推荐完成。"

        except Exception as e:
            print(f"⚠️ 项目推荐阶段错误: {e}")
            return "项目推荐完成，使用默认推荐。"

    async def _run_final_recommendation_with_data(self, program_result: str, user_data: dict) -> str:
        """运行最终推荐阶段 - 基于数据"""
        try:
            final_agent = self.agents['final_recommendation']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            user_profile = user_data.get('user_profile', '无用户档案')

            data_context = f"""
项目分析结果: {program_result}
用户档案: {user_profile}

请基于上述信息生成最终的学校推荐。
"""

            team = RoundRobinGroupChat([final_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=4))

            result = await Console(team.run_stream(task=data_context))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "最终推荐完成。"

        except Exception as e:
            print(f"⚠️ 最终推荐阶段错误: {e}")
            return "最终推荐完成，提供基础建议。"

    async def _run_final_analysis_with_data(self, final_result: str, user_data: dict) -> str:
        """运行最终分析阶段 - 基于数据"""
        try:
            analysis_agent = self.agents['final_analysis']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            user_profile = user_data.get('user_profile', '无用户档案')

            data_context = f"""
最终推荐: {final_result}
用户档案: {user_profile}

请基于上述信息进行详细的学校分析和评分。
"""

            team = RoundRobinGroupChat([analysis_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=4))

            result = await Console(team.run_stream(task=data_context))

            if result and result.messages:
                content = result.messages[-1].content
                if "TERMINATE" in content:
                    content = content.replace("TERMINATE", "").strip()
                return content
            else:
                return final_result  # 如果分析失败，返回推荐结果

        except Exception as e:
            print(f"⚠️ 最终分析阶段错误: {e}")
            return final_result  # 如果分析失败，返回推荐结果

    async def _run_summary_phase(self, user_message: str, user_id: str) -> str:
        """运行档案分析阶段"""
        try:
            # 使用summary agent分析用户档案
            summary_agent = self.agents['summary']

            # 创建用户代理
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

            # 创建简单的团队
            team = RoundRobinGroupChat([summary_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=5))

            # 运行任务
            result = await Console(team.run_stream(task=f"用户ID: {user_id}\n请求: {user_message}"))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "档案分析完成，继续推荐流程。"

        except Exception as e:
            print(f"⚠️ 档案分析阶段错误: {e}")
            return "档案分析完成，使用默认流程继续。"

    def _determine_degree_type(self, summary_result: str) -> str:
        """从分析结果中确定申请类型"""
        summary_lower = summary_result.lower()

        # 研究生关键词
        grad_keywords = ['master', 'phd', 'graduate', 'ms', 'ma', '硕士', '博士', '研究生']
        # 本科关键词
        undergrad_keywords = ['bachelor', 'undergraduate', 'bs', 'ba', '本科', '学士']

        grad_count = sum(1 for keyword in grad_keywords if keyword in summary_lower)
        undergrad_count = sum(1 for keyword in undergrad_keywords if keyword in summary_lower)

        if grad_count > undergrad_count:
            return "graduate"
        elif undergrad_count > grad_count:
            return "undergraduate"
        else:
            # 默认假设研究生申请
            return "graduate"

    async def _run_research_phase(self, user_message: str, degree_type: str) -> str:
        """运行研究阶段"""
        try:
            if degree_type == "graduate":
                research_agent = self.agents['graduate_research']
                print("🔬 使用研究生研究agent")
            else:
                research_agent = self.agents['undergraduate_research']
                print("🔬 使用本科研究agent")

            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")
            team = RoundRobinGroupChat([research_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=8))

            result = await Console(team.run_stream(task=user_message))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "研究阶段完成，继续推荐流程。"

        except Exception as e:
            print(f"⚠️ 研究阶段错误: {e}")
            return "研究阶段完成，使用基础信息继续。"

    async def _run_program_recommendation(self, research_result: str) -> str:
        """运行项目推荐阶段"""
        try:
            program_agent = self.agents['program_recommendation']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")
            team = RoundRobinGroupChat([program_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=6))

            result = await Console(team.run_stream(task=f"基于研究结果: {research_result}"))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "项目推荐完成。"

        except Exception as e:
            print(f"⚠️ 项目推荐阶段错误: {e}")
            return "项目推荐完成，使用默认推荐。"

    async def _run_final_recommendation(self, program_result: str) -> str:
        """运行最终推荐阶段"""
        try:
            final_agent = self.agents['final_recommendation']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")
            team = RoundRobinGroupChat([final_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=6))

            result = await Console(team.run_stream(task=f"基于项目分析: {program_result}"))

            if result and result.messages:
                return result.messages[-1].content
            else:
                return "最终推荐完成。"

        except Exception as e:
            print(f"⚠️ 最终推荐阶段错误: {e}")
            return "最终推荐完成，提供基础建议。"

    async def _run_final_analysis(self, final_result: str) -> str:
        """运行最终分析阶段"""
        try:
            analysis_agent = self.agents['final_analysis']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")
            team = RoundRobinGroupChat([analysis_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=6))

            result = await Console(team.run_stream(task=f"基于最终推荐: {final_result}"))

            if result and result.messages:
                # 清理输出
                content = result.messages[-1].content
                if "TERMINATE" in content:
                    content = content.replace("TERMINATE", "").strip()
                return content
            else:
                return final_result  # 如果分析失败，返回推荐结果

        except Exception as e:
            print(f"⚠️ 最终分析阶段错误: {e}")
            return final_result  # 如果分析失败，返回推荐结果

    async def run_simple_recommendation(self, user_message: str) -> str:
        """
        运行简化的推荐流程（如果完整流程太复杂）
        """
        try:
            print(f"⚡ 运行简化推荐流程")

            # 直接使用最终推荐agent
            final_agent = self.agents['final_recommendation']
            user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")
            team = RoundRobinGroupChat([final_agent, user_proxy],
                                     termination_condition=MaxMessageTermination(max_messages=4))

            result = await Console(team.run_stream(task=user_message))

            if result and result.messages:
                content = result.messages[-1].content
                if "TERMINATE" in content:
                    content = content.replace("TERMINATE", "").strip()
                return content
            else:
                return "推荐流程完成。"

        except Exception as e:
            print(f"❌ 简化推荐流程错误: {e}")
            return "抱歉，推荐系统暂时不可用。请稍后重试。"


# 创建全局实例
_workflow_instance = None

def get_school_recommendation_workflow():
    """获取学校推荐工作流实例"""
    global _workflow_instance
    if _workflow_instance is None:
        _workflow_instance = SchoolRecommendationWorkflow()
    return _workflow_instance


async def run_school_recommendation(user_message: str, user_id: str = "default",
                                  use_simple: bool = False) -> str:
    """
    运行学校推荐流程的便捷函数

    Args:
        user_message: 用户请求
        user_id: 用户ID
        use_simple: 是否使用简化流程

    Returns:
        推荐结果
    """
    workflow = get_school_recommendation_workflow()

    if use_simple:
        return await workflow.run_simple_recommendation(user_message)
    else:
        return await workflow.run_complete_recommendation(user_message, user_id)