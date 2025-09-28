s# iOffer AI - 用户测试用例

**测试版本**: 1.0.0-stable  
**测试分支**: feat/api-server-v2  
**测试环境**: macOS + Chrome/Safari + uvicorn 8010  
**最后更新**: 2025-01-15

---

## 📋 测试概述

本文档包含iOffer AI系统的完整用户测试用例，专注于Agent交互、UI体验和Edge Case验证。不包括Unit Test，主要验证端到端用户体验。

### 测试目标
- ✅ 验证WebSocket API稳定性
- ✅ 确保Agent路由正确性
- ✅ 验证ML模型真实性（无fallback）
- ✅ 测试边界情况和错误处理
- ✅ 确保用户体验流畅

### 测试环境设置
```bash
# 启动服务器
uv run uvicorn api_server:app --host 127.0.0.1 --port 8010

# 打开测试页面
open manual_test.html
```

---

## 1. 基础连接和UI测试

### TC-1.1: WebSocket连接基础测试
**目标**: 验证WebSocket连接稳定性

**测试步骤**:
1. 打开manual_test.html
2. 选择用户: hanyu_liu_003
3. 点击"连接"按钮
4. 观察连接状态变化

**预期结果**:
- 状态从"❌ 未连接到服务器"变为"✅ 已连接到服务器"
- 看到"🔗 WebSocket连接已建立"消息
- 连接状态显示绿色背景

**可能问题**:
- 服务器未启动
- 端口8010被占用
- MongoDB未运行

**测试记录**:
```
测试日期: ___________
测试者: ___________
结果: [Y] PASS [ ] FAIL [ ] BLOCKED
问题描述: ___________
备注: ___________
```

---

### TC-1.2: 用户档案切换测试
**目标**: 验证不同用户档案的切换功能

**测试步骤**:
1. 先用hanyu_liu_003连接并测试
2. 断开连接
3. 切换到hanyuliu用户
4. 重新连接

**预期结果**:
- 能够成功切换用户选项
- 不同用户连接成功
- 推荐结果应该基于不同档案

**Edge Cases**:
- 快速切换用户
- 连接状态下切换用户

**测试记录**:
```
测试日期: ___________
测试者: ___________
hanyu_liu_003结果: [Y] PASS [ ] FAIL
hanyuliu结果: [Y] PASS [ ] FAIL
切换功能: [Y] PASS [ ] FAIL
问题描述: ___________
```

---

## 2. Agent路由和交互测试

### TC-2.1: General QA Agent测试
**目标**: 验证通用问答功能完整性

**测试消息**:
- "What is GPA?"
- "How to apply for graduate school?"
- "What is TOEFL?"
- "Explain SAT vs GRE"

**测试步骤**:
1. 连接WebSocket（建议用hanyuliu用户）
2. 点击"General QA Test"或输入测试消息
3. 观察路由过程和响应

**预期结果**:
- 路由到GENERAL_QA团队
- 显示thinking process步骤
- 返回详细、准确的回答
- 包含参考链接或来源
- 响应时间 < 2分钟

**路由验证**:
- 看到"Routed to GENERAL_QA"状态消息
- 无路由到其他团队

**Edge Cases**:
```
空消息: ""
极长消息: [重复1000字符的测试]
特殊字符: "What is GPA? 🤔📚"
混合语言: "What is GPA? 请详细解释一下"
模糊问题: "help me with something"
```

**测试记录**:
```
测试日期: ___________
基础问答: [Y] PASS [ ] FAIL
路由正确: [Y] PASS [ ] FAIL
响应时间: _____ 秒
思考过程: [ Y] 显示 [ ] 未显示
参考链接: [ Y] 包含 [ ] 不包含

Edge Case结果:
空消息: [ ] PASS [ ] FAIL [ ] N/A
长消息: [ ] PASS [ ] FAIL [ ] N/A
特殊字符: [ ] PASS [ ] FAIL [ ] N/A
混合语言: [ ] PASS [ ] FAIL [ ] N/A

问题描述: __需要区分就是学校推荐和这个general QA有的时候我让它对比它也会变成school recommendation就我们需要找一些routing 错误的例子_________
```

---

### TC-2.2: School Recommendation Agent测试
**目标**: 验证学校推荐功能完整性和ML模型真实性

**测试消息**:
- "Please recommend 10 Business master programs for me"
- "I want to study Computer Science"
- "Recommend me Data Science programs"
- "什么学校适合我？"

**测试步骤**:
1. 连接WebSocket（**必须用hanyuliu用户**）
2. 点击"School Recommendation Test"
3. 观察完整5步流程
4. 验证最终结果完整性

**预期结果**:
- 路由到SCHOOL_RECOMMENDATION团队
- 显示5步进度追踪：
  1. analysis_start
  2. profile_analysis
  3. generating_schools
  4. evaluating_fit
  5. finalizing_results
- 生成10所学校的详细分析
- 包含Reach/Target/Safety分类
- 每所学校有具体评分(1-5分)和详细理由
- 处理时间5-10分钟

**ML模型验证** (关键):
- 服务器日志包含`[pred]`标记
- 无fallback或虚假数据
- 推荐结果基于真实XGBoost模型

**Edge Cases**:
```
无效专业: "I want to study Unicorn Science"
模糊请求: "recommend something good"
过于具体: "Recommend exactly Stanford CS PhD with AI focus"
中文请求: "推荐一些好学校"
```

**测试记录**:
```
测试日期: ___________
用户档案: [y] hanyuliu [ ] hanyu_liu_003 [ ] 其他: _____

基础功能:
路由正确: [ y] PASS [ ] FAIL
5步进度: [ y] 全部显示 [ ] 部分显示 [ ] 未显示
最终结果: [y] 10所学校 [ ] 少于10所 [ ] 超过10所
处理时间: 5 分钟

结果质量:
Reach学校: _____ 所
Target学校: _____ 所  
Safety学校: _____ 所
评分完整: [ ] PASS [ ] FAIL
理由详细: [ ] PASS [ ] FAIL

ML模型验证:
[pred]日志: [ ] 存在 [ ] 不存在
真实数据: [ ] 确认 [ ] 疑似fallback
不同用户结果: [ ] 不同 [ ] 相同 [ ] 未测试

Edge Case结果:
无效专业: [ ] PASS [ ] FAIL [ ] N/A
模糊请求: [ ] PASS [ ] FAIL [ ] N/A
中文请求: [ ] PASS [ ] FAIL [ ] N/A

问题描述: _____我觉得他选校选的挺一般的 这人背景很好然后他选的学校很多专业比较垃圾 我觉得______
服务器日志截取: ___________
```

---

### TC-2.3: Student Info Agent测试
**目标**: 验证学生信息管理功能

**测试消息**:
- "I want to share my GPA and activities"
- "Help me upload my profile"
- "What information do you need?"
- "Update my academic background"

**测试步骤**:
1. 连接WebSocket
2. 发送学生信息相关请求
3. 观察信息收集流程

**预期结果**:
- 路由到STUDENT_INFO团队
- 提供清晰的信息收集指导
- 显示thinking process
- 能够处理档案更新请求

**Edge Cases**:
```
不完整信息: "My GPA is..."(不提供完整信息)
格式错误: "GPA is very good"(非数字格式)
语言混合: "我的GPA是3.8，其他information..."
```

**测试记录**:
```
测试日期: ___________
路由正确: [ ] PASS [ ] FAIL
信息指导: [ ] 清晰 [ ] 模糊 [ ] 无
thinking显示: [ ] PASS [ ] FAIL
响应时间: _____ 秒

Edge Case结果:
不完整信息: [ ] PASS [ ] FAIL [ ] N/A
格式错误: [ ] PASS [ ] FAIL [ ] N/A
语言混合: [ ] PASS [ ] FAIL [ ] N/A

问题描述: ___________
```

---

### TC-2.4: 文件上传功能测试
**目标**: 验证文件上传和信息提取功能

**测试文件类型**:
- PDF简历文件
- JPG/PNG成绩单图片
- 包含学生信息的文档

**测试步骤**:
1. 连接WebSocket
2. 选择或拖拽文件到上传区域
3. 点击"上传文件"按钮
4. 观察文件处理流程
5. 验证信息提取结果

**预期结果**:
- 文件成功上传到服务器
- 自动路由到STUDENT_INFO团队
- 显示文件处理进度
- 返回提取的结构化信息
- 支持拖拽上传

**文件验证**:
- 文件类型限制：PDF, JPG, JPEG, PNG
- 文件大小限制：最大10MB
- 文件名唯一性：时间戳前缀

**Edge Cases**:
```
超大文件: 超过10MB的文件
不支持格式: .txt, .doc, .xlsx等
损坏文件: 无法读取的PDF/图片
空文件: 0字节文件
```

**测试记录**:
```
测试日期: ___________
文件类型: [Y] PDF [ ] JPG [ ] JPEG [ ] PNG [ ] 其他: _____

上传功能:
文件选择: [Y] PASS [ ] FAIL
拖拽上传: [ ] PASS [ ] FAIL
大小验证: [ ] PASS [ ] FAIL
格式验证: [ ] PASS [ ] FAIL

处理流程:
自动路由: [Y] STUDENT_INFO [ ] 其他团队 [ ] 路由错误
进度显示: [Y] 清晰 [ ] 模糊 [ ] 无
信息提取: [Y] 成功 [ ] 部分成功 [ ] 失败

结果质量:
结构化数据: [Y] 完整 [ ] 部分 [ ] 无
信息准确性: [Y] 高 [ ] 中 [ ] 低
格式规范: [Y] 符合 [ ] 部分符合 [ ] 不符合

Edge Case结果:
超大文件: [ ] PASS [ ] FAIL [ ] N/A
不支持格式: [ ] PASS [ ] FAIL [ ] N/A
损坏文件: [ ] PASS [ ] FAIL [ ] N/A

问题描述: ___________
```

---

## 3. 路由和切换测试

### TC-3.1: 智能路由测试
**目标**: 验证系统正确识别用户意图并路由到合适的Agent

**测试序列**:
1. "What is GPA?" → 应路由到General QA
2. "Recommend schools for me" → 应路由到School Rec
3. "I want to update my profile" → 应路由到Student Info
4. "continue" → 继续当前话题
5. "new topic - what is TOEFL?" → 切换到新话题

**测试步骤**:
1. 按序列依次发送消息
2. 观察每次的路由决策
3. 验证路由结果的正确性

**预期结果**:
- 正确的团队路由决策
- 路由过程在status消息中清晰显示
- 无路由错误或无限循环
- 对话上下文正确处理

**测试记录**:
```
测试日期: ___________

序列1 - GPA问题:
预期路由: GENERAL_QA
实际路由: ___________
结果: [ ] PASS [ ] FAIL

序列2 - 学校推荐:
预期路由: SCHOOL_RECOMMENDATION  
实际路由: ___________
结果: [ ] PASS [ ] FAIL

序列3 - 档案更新:
预期路由: STUDENT_INFO
实际路由: ___________
结果: [ ] PASS [ ] FAIL

序列4 - Continue命令:
执行结果: [ ] 正确继续 [ ] 路由错误 [ ] 无响应
结果: [ ] PASS [ ] FAIL

序列5 - 话题切换:
执行结果: [ ] 正确切换 [ ] 路由错误 [ ] 无响应
结果: [ ] PASS [ ] FAIL

整体路由: [ ] PASS [ ] FAIL
问题描述: ___________
```

---

### TC-3.2: 路由Override测试
**目标**: 验证关键词检测的路由覆盖机制

**测试消息**:
- "I need help with something. Can you recommend universities?"
- "General question but also recommend schools"
- "推荐学校" (纯中文)

**预期结果**:
- 检测到"recommend"关键词
- Override到SCHOOL_RECOMMENDATION
- 显示routing_override状态消息

**测试记录**:
```
测试日期: ___________
关键词检测: [ ] PASS [ ] FAIL
路由覆盖: [ ] PASS [ ] FAIL  
中文支持: [ ] PASS [ ] FAIL
问题描述: ___________
```

---

### TC-3.3: 新Routing逻辑测试
**目标**: 验证更新后的routing逻辑，确保学校比较问题路由到General QA，只有明确请求推荐时才路由到School Recommendation

**测试场景**:

**场景1: 学校比较问题 (应路由到General QA)**
- "华盛顿大学和华盛顿圣路易斯哪个好？"
- "How does Stanford compare to MIT?"
- "What are the pros and cons of studying CS at Berkeley vs CMU?"
- "Tell me about Harvard's CS program"

**场景2: 明确推荐请求 (应路由到School Recommendation)**
- "Please recommend 10 Business master programs for me"
- "What schools should I apply to given my background?"
- "Help me find schools that fit my profile"
- "Which universities should I choose?"

**场景3: 一般信息咨询 (应路由到General QA)**
- "What is GPA?"
- "How do I apply to graduate school?"
- "What is the application process?"

**测试步骤**:
1. 连接WebSocket
2. 依次测试每个场景的问题
3. 观察routing决策
4. 验证路由结果的正确性

**预期结果**:
- 学校比较问题 → GENERAL_QA
- 明确推荐请求 → SCHOOL_RECOMMENDATION
- 一般信息咨询 → GENERAL_QA
- 路由过程清晰显示在status消息中

**测试记录**:
```
测试日期: ___________

场景1 - 学校比较问题:
"华盛顿大学和华盛顿圣路易斯哪个好？"
预期路由: GENERAL_QA
实际路由: ___________
结果: [ ] PASS [ ] FAIL

"How does Stanford compare to MIT?"
预期路由: GENERAL_QA
实际路由: ___________
结果: [ ] PASS [ ] FAIL

场景2 - 明确推荐请求:
"Please recommend 10 Business master programs for me"
预期路由: SCHOOL_RECOMMENDATION
实际路由: ___________
结果: [ ] PASS [ ] FAIL

"Help me find schools that fit my profile"
预期路由: SCHOOL_RECOMMENDATION
实际路由: ___________
结果: [ ] PASS [ ] FAIL

场景3 - 一般信息咨询:
"What is GPA?"
预期路由: GENERAL_QA
实际路由: ___________
结果: [ ] PASS [ ] FAIL

整体新routing逻辑: [ ] PASS [ ] FAIL
问题描述: ___________
```

---

## 4. 错误处理和Edge Case测试

### TC-4.1: 网络中断恢复测试
**目标**: 验证网络问题的优雅处理

**测试步骤**:
1. 开始学校推荐测试
2. 在处理过程中关闭WiFi/断开网络
3. 等待30秒
4. 重新连接网络
5. 刷新页面并重新连接

**预期结果**:
- 优雅处理断开连接
- 显示连接断开状态
- 重连后功能正常
- 无系统崩溃

**测试记录**:
```
测试日期: ___________
断网处理: [ ] 优雅 [ ] 崩溃 [ ] 卡死
状态显示: [ ] 正确 [ ] 错误 [ ] 无显示
重连恢复: [ ] PASS [ ] FAIL
问题描述: ___________
```

---

### TC-4.2: API配额限制测试
**目标**: 验证API限制的处理机制

**测试步骤**:
1. 连续发送多个学校推荐请求
2. 直到触发API限制
3. 观察错误处理

**预期结果**:
- 显示配额限制错误消息
- 建议等待和重试时间
- 不影响其他功能(如General QA)

**测试记录**:
```
测试日期: ___________
请求次数: _____ 次触发限制
错误消息: [ ] 清晰 [ ] 模糊 [ ] 无
恢复建议: [ ] 有 [ ] 无
其他功能: [ ] 正常 [ ] 受影响
问题描述: ___________
```

---

### TC-4.3: 超长等待测试
**目标**: 验证长时间处理的用户体验

**测试步骤**:
1. 发送学校推荐请求
2. 等待完整流程(最长10分钟)
3. 不进行任何操作
4. 观察进度更新和最终结果

**预期结果**:
- 持续的进度更新
- 不会超时断开连接
- 最终返回完整结果
- 用户体验良好

**测试记录**:
```
测试日期: ___________
总耗时: _____ 分钟
进度更新: [ ] 持续 [ ] 间断 [ ] 无
连接状态: [ ] 保持 [ ] 断开
最终结果: [ ] 完整 [ ] 不完整 [ ] 无
用户体验: [ ] 好 [ ] 一般 [ ] 差
问题描述: ___________
```

---

## 5. 数据完整性测试

### TC-5.1: ML模型真实性验证(关键测试)
**目标**: 确保使用真实ML模型，无虚假数据

**验证方法**:
1. 检查服务器日志中的`[pred]`标记
2. 比较不同用户档案的推荐结果
3. 验证25→10学校的筛选过程
4. 确认无fallback机制

**测试步骤**:
1. 用hanyuliu测试学校推荐
2. 用hanyu_liu_003测试学校推荐  
3. 对比结果差异
4. 检查服务器日志

**预期结果**:
- 不同用户产生不同推荐
- 日志包含ML预测过程
- 无模拟或虚假数据
- 推荐质量合理

**检查清单**:
```
□ 服务器日志包含[pred]标记
□ 不同用户结果显著不同
□ 推荐学校具有多样性
□ 评分和理由合理
□ 无明显的模板化内容
□ 处理时间符合真实计算
```

**测试记录**:
```
测试日期: ___________

日志验证:
[pred]标记: [ ] 存在 [ ] 不存在
ML过程: [ ] 完整 [ ] 部分 [ ] 无

用户对比:
hanyuliu结果: _____ 所学校
hanyu_liu_003结果: _____ 所学校
结果差异: [ ] 显著 [ ] 轻微 [ ] 无差异

数据质量:
学校多样性: [ ] 高 [ ] 中 [ ] 低
评分合理性: [ ] 高 [ ] 中 [ ] 低
理由详细度: [ ] 高 [ ] 中 [ ] 低

真实性评估: [ ] 确认真实 [ ] 疑似虚假 [ ] 无法确定
问题描述: ___________
```

---

### TC-5.2: 结果格式一致性测试
**目标**: 验证输出格式的标准化和完整性

**检查项目**:
- 学校推荐包含完整评分(4个维度)
- 每所学校有明确的Tier分类
- 格式化正确，易于阅读
- 包含结构化数据payload

**测试记录**:
```
测试日期: ___________
评分完整性: [ ] PASS [ ] FAIL
分类清晰: [ ] PASS [ ] FAIL
格式规范: [ ] PASS [ ] FAIL
结构化数据: [ ] 存在 [ ] 不存在
问题描述: ___________
```

---

## 6. 性能和稳定性测试

### TC-6.1: 并发连接测试
**目标**: 验证系统处理多用户的能力

**测试步骤**:
1. 打开3个不同的浏览器窗口
2. 分别连接不同用户
3. 同时发送不同类型的请求
4. 观察性能和稳定性

**预期结果**:
- 所有连接正常建立
- 请求无互相干扰
- 响应时间合理
- 系统稳定运行

**测试记录**:
```
测试日期: ___________
并发连接数: _____ 个
连接成功率: _____ %
平均响应时间: _____ 秒
系统稳定性: [ ] 稳定 [ ] 偶尔问题 [ ] 不稳定
问题描述: ___________
```

---

### TC-6.2: 长时间运行稳定性测试
**目标**: 验证系统长期运行的稳定性

**测试步骤**:
1. 保持系统运行2小时以上
2. 间歇性发送各类请求
3. 监控系统资源使用
4. 观察性能变化

**预期结果**:
- 内存使用稳定
- 无异常崩溃
- 性能无明显下降
- 响应时间保持稳定

**测试记录**:
```
测试日期: ___________
运行时长: _____ 小时
系统状态: [ ] 稳定 [ ] 性能下降 [ ] 崩溃
内存使用: [ ] 稳定 [ ] 增长 [ ] 泄漏
响应时间变化: _____ %
问题描述: ___________
```

---

## 📊 测试总结

### 整体测试结果
```
测试完成日期: ___________
总测试用例数: 18
通过数量: _____ / 18
失败数量: _____ / 18
阻塞数量: _____ / 18

通过率: _____ %
```

### 关键功能状态
```
WebSocket连接: [ ] 正常 [ ] 有问题
Agent路由: [ ] 正常 [ ] 有问题
学校推荐: [ ] 正常 [ ] 有问题
ML模型真实性: [ ] 确认 [ ] 有疑问
错误处理: [ ] 正常 [ ] 有问题
用户体验: [ ] 良好 [ ] 需改进
```

### 发现的问题
```
1. ___________
2. ___________
3. ___________
```

### 改进建议
```
1. ___________
2. ___________
3. ___________
```

### 测试环境信息
```
操作系统: ___________
浏览器: ___________
服务器版本: ___________
数据库状态: ___________
网络环境: ___________
```

---

## 📝 测试注意事项

1. **测试前准备**:
   - 确保MongoDB正在运行
   - 确保服务器启动无错误
   - 清除浏览器缓存

2. **测试过程中**:
   - 记录所有异常情况
   - 截图保存重要错误
   - 保存服务器日志

3. **关键验证点**:
   - ML模型真实性是最重要的测试
   - 学校推荐质量直接影响用户体验
   - 错误处理关系到系统稳定性

4. **测试数据**:
   - hanyuliu: 用于完整功能测试
   - hanyu_liu_003: 用于基础功能测试
   - 对比测试必须使用不同用户

---

**文档版本**: 1.0  
**维护者**: iOffer AI Team  
**联系方式**: [项目repository]