# LangChain + ChromaDB RAG Migration Guide

## 概述

本指南说明如何从原有的FAISS RAG实现迁移到新的LangChain + ChromaDB实现。

## 主要改进

### 🔄 技术栈变更
- **原实现**: OpenAI Embeddings + FAISS + Pickle
- **新实现**: LangChain + ChromaDB + OpenAI Embeddings

### ✨ 优势
1. **更好的可维护性**: 使用LangChain标准化框架
2. **更强的扩展性**: ChromaDB支持更多高级功能
3. **更简单的部署**: 无需管理多个文件格式
4. **更好的性能**: ChromaDB优化的存储和检索
5. **更丰富的元数据**: 支持复杂的过滤和查询

## 文件对比

| 功能 | 原实现 | 新实现 |
|------|--------|--------|
| 数据准备 | `prepare_rag_data.py` | `prepare_rag_data_langchain.py` |
| RAG检索 | `rag_agent.py` | `rag_agent_langchain.py` |
| 测试脚本 | 无 | `test_langchain_rag.py` |
| 存储格式 | FAISS + Pickle | ChromaDB |
| 配置文件 | `rag_config.json` | `rag_config_langchain.json` |

## 迁移步骤

### 1. 安装依赖

新的依赖已添加到 `pyproject.toml`:
```toml
"langchain>=0.3.0",
"langchain-openai>=0.2.0", 
"langchain-community>=0.3.0",
"chromadb>=0.5.0",
"tiktoken>=0.8.0",
```

安装依赖:
```bash
cd ai-service
uv sync
```

### 2. 准备数据

运行新的数据准备脚本:
```bash
# 从项目根目录运行
uv run python ai-service/src/agents/general_qa_agent/prepare_rag_data_langchain.py
```

这将创建:
- `data/chromadb/` - ChromaDB数据库目录
- `data/rag_config_langchain.json` - 配置文件

### 3. 测试新实现

```bash
# 运行测试脚本
uv run python ai-service/src/agents/general_qa_agent/test_langchain_rag.py

# 或直接测试RAG代理
uv run python ai-service/src/agents/general_qa_agent/rag_agent_langchain.py
```

### 4. 集成到现有代码

#### 替换导入
```python
# 原代码
from src.agents.general_qa_agent.rag_agent import RAGRetriever

# 新代码  
from src.agents.general_qa_agent.rag_agent_langchain import LangChainRAGRetriever
```

#### 更新初始化
```python
# 原代码
retriever = RAGRetriever()

# 新代码
retriever = LangChainRAGRetriever()
```

#### API兼容性
新实现保持了相同的API接口:
```python
# 两种实现都支持相同的方法
result = retriever.get_rag_context(question)
# 返回格式完全相同:
# {
#     'has_context': bool,
#     'context': str, 
#     'retrieved_pairs': List[Dict],
#     'best_similarity': float,
#     'total_pairs': int
# }
```

## 配置对比

### 原配置 (rag_config.json)
```json
{
  "embedding_model": "text-embedding-3-large",
  "embedding_dimensions": 3072,
  "total_qa_pairs": 1000,
  "source_csv": "/path/to/qa_pairs.csv",
  "preparation_script": "prepare_rag_data.py"
}
```

### 新配置 (rag_config_langchain.json)
```json
{
  "embedding_model": "text-embedding-3-large", 
  "collection_name": "qa_pairs_collection",
  "chromadb_directory": "/path/to/data/chromadb",
  "total_qa_pairs": 1000,
  "source_csv": "/path/to/qa_pairs.csv",
  "framework": "langchain_chromadb"
}
```

## 性能对比

| 指标 | 原实现 (FAISS) | 新实现 (ChromaDB) |
|------|----------------|-------------------|
| 初始化时间 | ~2-3秒 | ~1-2秒 |
| 查询速度 | ~0.1-0.2秒 | ~0.1-0.3秒 |
| 内存使用 | 中等 | 较低 |
| 磁盘空间 | 多个文件 | 单一数据库 |
| 扩展性 | 有限 | 优秀 |

## 故障排除

### 常见问题

1. **ChromaDB初始化失败**
   ```bash
   # 确保目录权限正确
   chmod -R 755 data/chromadb/
   ```

2. **嵌入模型错误**
   ```bash
   # 检查OpenAI API密钥
   echo $OPENAI_API_KEY
   ```

3. **依赖冲突**
   ```bash
   # 重新安装依赖
   uv sync --reinstall
   ```

### 调试模式

启用详细日志:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 回滚方案

如果需要回滚到原实现:

1. 确保原数据文件存在:
   - `data/qa_pairs.pkl`
   - `data/faiss.index` 
   - `data/embeddings.npy`
   - `data/mapping.pkl`

2. 使用原导入:
   ```python
   from src.agents.general_qa_agent.rag_agent import RAGRetriever
   ```

## 最佳实践

1. **数据备份**: 迁移前备份原有数据文件
2. **渐进式迁移**: 先在测试环境验证
3. **性能监控**: 对比迁移前后的性能指标
4. **错误处理**: 实现适当的异常处理和重试机制

## 后续优化

新实现为以下高级功能奠定了基础:

1. **混合搜索**: 结合关键词和语义搜索
2. **动态过滤**: 基于元数据的复杂过滤
3. **增量更新**: 支持实时数据更新
4. **多模态检索**: 支持文本以外的数据类型
5. **分布式部署**: ChromaDB支持集群部署

## 支持

如有问题，请参考:
- LangChain文档: https://python.langchain.com/
- ChromaDB文档: https://docs.trychroma.com/
- 项目测试脚本: `test_langchain_rag.py`
