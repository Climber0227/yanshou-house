# Dev Docs Truth Index

这个目录是项目内部开发真源。它给 AI 和项目维护者使用，不默认等同于公开文档。

## 当前真源索引

- 项目立项和边界：[project-brief.md](project-brief.md)
- 功能清单和完成度：[function-list.md](function-list.md)
- 架构和 owner map：[architecture.md](architecture.md)
- 验收和停止条件：[acceptance.md](acceptance.md)
- 前后端 API 合同：[api-contract.md](api-contract.md)

## 文档职责

- `project-brief.md`：项目是什么、不是什么、第一闭环、MVP、功能边界和不做什么。
- `architecture.md`：技术路线、前端/小程序架构、owner map、禁止路径和验证方式。
- `acceptance.md`：每个阶段怎么证明完成、哪些证据缺失、什么时候不能继续。
- `api-contract.md`：前后端 API 接口定义，请求/响应格式，便于前后端并行开发。

## 更新规则

- 聊天里的决定不算真源，必须写回对应文档。
- 需求、技术栈、架构、权限、API 合同或验收方式变化时，先更新文档再开发。
- 过期文档要标记为过期或归档，不能和当前真源并列。
- 内部真源默认私有。推送远程前必须确认这些文件是否允许公开。

## 当前状态

- 项目阶段：立项完成，准备进入第一阶段开发
- 当前主路线：核心链路（扫码→上报→整改→闭环）+ 管理后台
- 第一闭环：查验员扫码 → 上报问题 → 整改员接收 → 上传整改证明 → 查验员复查确认 → 闭环
- - 交接文档：[handoff-20260712.md](handoff-20260712.md)
- 需求审计：[requirements-audit.md](requirements-audit.md)

下一步：管理后台开发 + 数据导出 + 后端联调
- 未验证项：后端技术栈（由后端老师决定）、微信小程序认证状态
