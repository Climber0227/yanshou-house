# Dev Docs Truth Index

这个目录是项目内部开发真源。它给 AI 和项目维护者使用，不默认等同于公开文档。

## 当前真源索引

- **项目边界**：[project-brief.md](project-brief.md) — 项目是什么/不是什么、MVP、关键风险、验收标准
- **架构真源**：[architecture.md](architecture.md) — 技术路线、Owner Map、API 调用链、禁止路径
- **验收门禁**：[acceptance.md](acceptance.md) — 各阶段验收条件、证据要求、漂移检测
- **API 合同**：[api-contract.md](api-contract.md) — 前后端 API 接口定义（27 个接口）
- **功能清单**：[function-checklist.md](function-checklist.md) — 106 项功能逐一跟踪完成度
- **Mock API 映射**：[api-data-mapping.md](api-data-mapping.md) — 27 个 API 数据流向审计

## 参考文档

- [原始需求](references/requirements.md) — 从 .doc 转换的需求原文（含附件 1-5 表格格式）
- [项目交接](references/handoff-20260712.md) — 当前状态快照、关键决策记录、技术债

## 当前项目状态

- 阶段：**前端主体已完成（92/106 项）**，全部 Mock 数据驱动
- 后端：未开始（等后端老师）
- 下一步：管理后台开发 + 后端联调 + 真机测试

## 更新规则

- 聊天里的决定不算真源，必须写回对应文档。
- 需求、技术栈、架构、权限、API 合同或验收方式变化时，先更新文档再开发。
- 过期文档要标记为过期或归档，不能和当前真源并列。
- 内部真源默认私有。推送远程前必须确认这些文件是否允许公开。
