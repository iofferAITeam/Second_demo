# 统一用户资料管理系统使用指南

## 🎯 架构概览

你的项目现在采用了**PostgreSQL为主的统一数据管理架构**：

```
用户聊天 → ProfileExtractionService → PostgreSQL (主要数据源)
                                   ↓
                           AI服务 (MongoDB 缓存层)
                                   ↓
                           推荐模型 ← 特征数据
```

## 📊 关键改进

### 1. **扩展的PostgreSQL Schema**
- ✅ 支持所有推荐模型所需的features
- ✅ 包含计算的标签特征 (gpaTag, paperTag等)
- ✅ 支持复杂数据存储 (JSON字段)
- ✅ 应用历史记录追踪

### 2. **增强的ProfileExtractionService**
- ✅ 自动计算推荐模型标签特征
- ✅ 智能大学类型推断 (985/211/海外/普通)
- ✅ GPA标准化 (支持4.0/5.0/100分制)
- ✅ AI驱动的个性化后续问题生成

### 3. **完整的数据迁移支持**
- ✅ 自动迁移现有用户数据到新结构
- ✅ 计算历史数据的特征标签
- ✅ 生成样本应用历史记录

## 🚀 如何使用

### 立即开始使用：

1. **生成数据库迁移：**
```bash
cd backend
npm run migrate:generate
```

2. **应用数据库更改：**
```bash
npm run db:migrate
```

3. **迁移现有用户数据：**
```bash
npm run migrate:profiles
```

4. **生成Prisma客户端：**
```bash
npm run db:generate
```

### 在代码中使用：

```typescript
// 获取推荐模型所需的特征
const features = await profileExtractor.getModelFeatures(userId)

// features 包含：
// - 基础特征: gpa, toefl, ielts, gre, gmat
// - 标签特征: gpa_tag, toefl_tag, paper_tag 等
// - 申请目标: target_major, target_country
// - 其他特征: has_research_experience, publication_count
```

## 📈 支持的推荐模型Features

### 基础学术特征：
- `gpa`, `gre`, `gmat`, `ielts`, `toefl`
- `averageGPA` (标准化4.0制)
- `major`, `undergraduateUniversity`

### 标签特征 (自动计算)：
- `gpa_tag`: 1.0(低) / 2.0(中) / 3.0(高)
- `paper_tag`: 1.0(无) / 2.0(水) / 3.0(多) / 4.0(牛)
- `toefl_tag`: 1.0(低) / 2.0(中) / 3.0(高)
- `gre_tag`: 1.0(L) / 2.0(M) / 3.0(H)
- `research_tag`: 0.0(无) / 1.0(有)
- `college_type_tag`: 0.0(双非) / 1.0(985/211) / 2.0(海外)
- `recommendation_tag`: 0.0(无牛推) / 1.0(国内) / 2.0(国外)

### 申请相关：
- `target_major`, `target_country`, `target_degree`
- `application_year`, `application_term`

## 🔄 数据流

1. **用户聊天** → AI提取资料信息
2. **ProfileExtractionService** → 处理并计算特征标签
3. **PostgreSQL** → 存储完整用户资料
4. **AI服务** → 异步同步(可选缓存)
5. **推荐模型** → 使用统一特征数据

## 💡 核心优势

- **单一数据源**: PostgreSQL作为唯一真实来源
- **自动特征计算**: 无需手动计算推荐模型标签
- **智能数据推断**: 自动识别院校类型、标准化GPA
- **完整数据历史**: 追踪申请历史和预测结果
- **高性能查询**: 支持复杂SQL查询和分析
- **数据一致性**: 事务保证，避免同步问题

## 🎉 下一步

你的统一用户资料管理系统已经准备就绪！现在你可以：

1. 从聊天中智能提取用户资料
2. 自动计算所有推荐模型特征
3. 为用户提供个性化的院校推荐
4. 追踪申请历史和成功率

所有这些都基于一个统一、可靠的PostgreSQL数据存储！🚀