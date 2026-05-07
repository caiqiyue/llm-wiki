# STKB 与 LLM-Wiki 概念对比分析及可行性建议

> 分析日期：2026-05-07  
> 分析目的：判断 STKB 的概念设计/实现是否可以借鉴 LLM-Wiki，以及 STKB 是否可以用 LLM-Wiki 简单实现一版

---

## 一、LLM-Wiki 核心概念

### 1.1 是什么
LLM-Wiki 是一种用于构建和管理 AI 知识库的模式，旨在将散乱的信息源转化为 AI 可查询、可推理、可更新的结构化 wiki 系统。

### 1.2 核心架构
```
文档输入 → 解析 → Chunking → Embedding → 向量存储
                    ↓
              知识抽取（LLM）
                    ↓
              Wiki 页面生成
                    ↓
              实体/概念去重合并
                    ↓
              知识图谱构建
                    ↓
              增量更新 + 质量检查
```

### 1.3 关键技术特性
- **增量 ingest**：基于 SHA256 的 ingest cache，重复内容不重新处理
- **per-project mutex**：并发控制，防止同一项目并发操作
- **dedup 机制**：实体/概念去重，支持跨 ingest 合并页面
- **三段式文本架构**：
  - canonical_text：权威知识正文
  - retrieval_text：向量检索压缩版
  - prompt_text：LLM 调用短 prompt 版
- **多语言支持**：i18n 框架（i18next）
- **lint 机制**：结构性和语义性质量检查
- **graph insights**：知识缺口发现 + 意外连接检测
- **web search 集成**：Tavily/SerpApi 补充最新信息

### 1.4 知识组织方式
- **Wiki Page Type**：entity、concept、query、source、task、policy、benchmark、lesson 等
- **双向链接**：页面之间的语义关系
- **知识图谱**：实体关系网络
- **review 机制**：人工审核流程

---

## 二、STKB 核心概念

### 2.1 是什么
STKB（Sales Training Knowledge Base）是销售培训知识库，将企业销售经验转化为"可操作的知识资产"，是 AI 销售训练系统的知识核心。

### 2.2 核心架构
```
文档输入 → Stage 0（预处理+快速扫描）→ Stage 1（领域并行抽取）→ Stage 2（链接+打标）→ 人工审核 → 存储
                                                                                    ↓
G0 治理层 ← K1-K13 知识领域 ← A1 应用映射层（AI教练/AI助理/AI诊断/数字人）
```

### 2.3 13 个知识域（K1-K13）
| 域 | 名称 | 说明 |
|----|------|------|
| K1 | Product | 产品知识 |
| K2 | Customer Persona | 客户画像 |
| K3 | Customer Needs | 客户需求 |
| K4 | Sales Scene | 销售场景 |
| K5 | Sales Stage | 销售阶段 |
| K6 | Competency Model | 能力模型 |
| K7 | Sales Strategy | 销售策略 |
| K8 | Talk/Script Structure | 话术结构 |
| K9 | Objection Handling | 异议处理 |
| K10 | Customer Reaction Patterns | 客户反应模式 |
| K11 | Service Rights | 服务权益 |
| K12 | Compliance Rules | 合规规则 |
| K13 | Training Evaluation | 培训评估 |

### 2.4 三层所有权架构
- **Core Layer（核心层）**：跨行业通用方法论
- **Industry Pack（行业包）**：行业特定知识（如保险）
- **Enterprise Overlay（企业覆盖层）**：企业特定定制

### 2.5 三段式文本架构
与 LLM-Wiki 完全一致：
- **canonical_text**：专家维护的标准知识正文
- **retrieval_text**：向量检索压缩版
- **prompt_text**：LLM 调用短 prompt 版

### 2.6 知识抽取流程
1. **Stage 0**：格式解析（PDF/PPT/DOCX/MP3/MP4）、语义分块、领域相关性快速扫描
2. **Stage 1**：领域并行抽取器（Schema + Few-shot examples）
3. **Stage 2**：跨域链接、置信度打分、通用性打标
4. **Human Review**：通过/修改/拒绝/标记为企业特定/标记为行业通用

### 2.7 12 个客户画像（保险示例）
1. 单身上班族新手
2. 新婚规划型
3. 新手父母育儿型
4. 家庭经济支柱型
5. 中产升级型
6. 小企业主型
7. 高净值传承型
8. 50+老年筹备型
9. 退休前规划型
10. 儿童保险父母型
11. 亚健康/慢性病型
12. 银保稳健储蓄型

---

## 三、核心相似性分析

### 3.1 高度一致的架构设计

| 维度 | LLM-Wiki | STKB | 一致性 |
|------|----------|------|--------|
| 三段式文本 | ✓ | ✓ | **完全一致** |
| 治理/审核层 | review-store | Human Review | **高度一致** |
| 知识域分类 | Wiki Page Type | K1-K13 | **概念一致** |
| 增量更新 | ingest-cache | 增量抽取 | **概念一致** |
| 去重合并 | dedup + dedup-queue | 实体去重 | **概念一致** |
| 多语言支持 | i18n | output_language | **概念一致** |
| 知识图谱 | graph-filters | 跨域链接 | **概念一致** |

### 3.2 共同的底层逻辑

```
输入 → 解析分块 → 向量化 → LLM知识抽取 → 结构化知识 → 人工审核 → 知识库
                                                        ↓
                                              AI应用（检索/推理/生成）
```

两者本质上是**同一个 pipeline 的不同具体化**：
- LLM-Wiki 侧重于**通用知识库**的构建
- STKB 侧重于**垂直领域（销售培训）知识库**的构建

### 3.3 技术实现层面的共通点
1. **文本分块（Chunking）**：LLM-Wiki 的 `text-chunker.ts`（601行）是 markdown 感知的递归分块器；STKB 的 Stage 0 语义分块，概念相同
2. **去重机制**：两者都有基于相似度的去重逻辑
3. **置信度打分**：两者都有 confidence_score 概念
4. **增量处理**：两者都避免重复处理相同内容

---

## 四、差异分析

### 4.1 领域深度 vs 通用广度

| 维度 | LLM-Wiki | STKB |
|------|----------|------|
| 目标 | 通用知识库 | 销售培训垂直领域 |
| 知识表示 | 实体-概念-关系 | K1-K13 领域模型 |
| 抽取逻辑 | 通用的 entity/concept 抽取 | 强 schema 驱动的领域抽取 |
| 应用场景 | RAG、问答、研究 | AI教练、AI助理、AI诊断、数字人 |
| 行业适配 | 无特定行业 | 可配置 Industry Pack |

### 4.2 知识组织粒度

LLM-Wiki 以**实体**和**概念**为原子单位，通过双向链接形成知识网络。

STKB 以**销售场景**为组织核心，将 K1-K13 知识域围绕场景联动：
```
销售场景（K4）
    ↓
触发 客户画像（K2） + 客户需求（K3）
    ↓
调用 销售策略（K7） + 话术结构（K8） + 异议处理（K9）
    ↓
匹配 能力模型（K6） + 客户反应模式（K10）
```

### 4.3 应用层差异

| 应用 | LLM-Wiki | STKB |
|------|----------|------|
| RAG 检索 | ✓ | ✓ |
| 知识推理 | ✓ | ✓ |
| 生成增强 | ✓ | ✓ |
| AI 教练（陪练） | - | ✓ |
| AI 销售助理 | - | ✓ |
| AI 诊断分析 | - | ✓ |
| 数字人 | - | ✓ |

---

## 五、可行性评估：STKB 能否用 LLM-Wiki 实现？

### 5.1 结论：**可以，且是推荐的快速 MVP 路径**

### 5.2 理由

#### 5.2.1 架构层面
LLM-Wiki 的底层架构（ingest pipeline + wiki page 生成 + review 流程）与 STKB 的知识抽取流程**高度兼容**。STKB 的三段式文本设计直接借鉴了 LLM-Wiki 的最佳实践。

#### 5.2.2 实现成本
| 模块 | LLM-Wiki 已有 | STKB 需开发 |
|------|--------------|-------------|
| 文档解析 | ✓（file-types.ts） | 扩展支持 PPT/MP3/MP4 |
| Chunking | ✓（text-chunker.ts） | 需针对销售文档优化 |
| Embedding | ✓ | 复用 |
| 知识抽取 | 通用抽取 | **核心新增**：K1-K13 schema + extractor |
| 去重合并 | ✓（dedup.ts） | 复用 |
| Review 流程 | ✓（review-store.ts） | 复用 |
| 知识图谱 | ✓（graph-filters.ts） | 扩展场景关联 |
| i18n | ✓ | 复用 |
| LLM Provider | ✓（llm-providers.ts） | 复用 |
| Web Search | ✓ | 复用（可选） |

#### 5.2.3 建议的实现策略

**Phase 1：用 LLM-Wiki 的骨架，承载 STKB 的内容模型**
1. 复用 LLM-Wiki 的 ingest pipeline、chunking、embedding、dedup、review 机制
2. 将 STKB 的 K1-K13 定义为 LLM-Wiki 的**自定义 Wiki Page Type**
3. 将 STKB 的**领域抽取器**（Stage 1）作为 LLM-Wiki 知识抽取的垂直领域扩展

**Phase 2：添加 STKB 特有功能**
1. 销售场景驱动的知识联动
2. AI 教练/助理应用层
3. Enterprise Overlay 的权限和隔离机制

### 5.3 风险提示

1. **Schema 复杂度**：STKB 的 K1-K13 有 815 行的 schema 定义，直接迁移到 LLM-Wiki 需要较大的 adaptation 工作
2. **多模态支持**：STKB 需支持 PPT/MP3/MP4，LLM-Wiki 目前侧重文本
3. **企业级特性**：STKB 的 Enterprise Overlay 涉及权限管理，这是 LLM-Wiki 当前不具备的
4. **知识联动逻辑**：STKB 的场景驱动知识联动需要在 LLM-Wiki 知识图谱基础上额外开发

---

## 六、建议

### 6.1 短期（快速 MVP）
**直接基于 LLM-Wiki 构建 STKB MVP**：
- 复用 LLM-Wiki 的基础设施
- 优先实现 K1（产品）、K2（客户画像）、K4（销售场景）、K9（异议处理）
- 用 LLM-Wiki 的通用知识抽取 + STKB 特定的后处理规则

### 6.2 中期（完善架构）
- 将 K1-K13 schema 正式迁移为 LLM-Wiki 的自定义类型系统
- 开发 Stage 1 领域并行抽取器
- 完善 Human Review 工作流

### 6.3 长期（生态构建）
- 构建 Industry Pack 体系（保险 → 医疗 → 金融）
- 开发 Enterprise Overlay 权限系统
- 完善 AI 应用层（教练/助理/诊断/数字人）

---

## 七、附录

### 7.1 LLM-Wiki 关键文件参考
- `text-chunker.ts`：文本分块（601行）
- `dedup.ts`：去重机制（559行）
- `ingest-queue.ts`：摄入队列（540行）
- `llm-providers.ts`：LLM provider 抽象（676行）
- `lint.ts`：质量检查（299行）
- `graph-insights.ts`：知识缺口发现（193行）
- `page-merge.ts`：页面合并（237行）

### 7.2 STKB 关键文档参考
- `知识库结构设计.md`（815行）：完整 schema 定义
- `知识抽取系统设计.md`（356行）：抽取 pipeline
- `STKB产品设计报告（管理层版）.md`（633行）：产品愿景
- `太保知识库STKB框架.md`（1018行）：详细行业框架

### 7.3 两者共享的设计模式
1. **三段式文本**：canonical / retrieval / prompt
2. **治理层抽象**：审核工作流 + 状态机
3. **增量更新**：避免重复处理
4. **去重合并**：实体唯一性保证
5. **置信度打分**：质量量化指标

---

*本分析由主智能体基于 llm-wiki/ 和 docs/ 的完整内容综合判断得出。*