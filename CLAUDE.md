# CLAUDE.md

给 Claude Code 看的项目速览。完整产品构想、模型选型、隐私原则、0.1–0.4 开发计划都在 [README.md](README.md)，本文件只保留「现在开工需要知道的」，不重复展开。

## 项目

拍摄参考生成 Agent：上传场景照片 → 多模态模型出姿势/构图方案 → 图生图出参考图。前端 H5 + 后端 TypeScript。

当前在**技术攻坚阶段**，按 README 第十五节的里程碑 0.1 → 0.4 逐版打通链路。

## 当前目标：里程碑 0.1

打通前端 ↔ 后端最小闭环。

**验收**：页面上一个按钮 + 一个 label；点按钮，label 从初始文字变成 "hello world"。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 前端 | React 18 + Vite + TypeScript |
| 移动 UI | antd-mobile（0.1 不引入，0.2 做上传界面时再加） |
| 后端 | Node.js + Express + TypeScript |
| 后端 dev | tsx（watch 热重载），tsc 做类型检查/构建 |
| 包管理 | npm |

Node 18+（建议 LTS）。

## 目录结构（monorepo）

```
frontend/   # React + Vite；dev proxy 把 /api 转发到 localhost:3000
backend/    # Express + TS；监听 3000
```

## 常用命令

```bash
# 后端（先起）
cd backend && npm install && npm run dev     # tsx watch，端口 3000

# 前端
cd frontend && npm install && npm run dev    # Vite，默认 5173
```

scaffold 参考：前端 `npm create vite@latest frontend -- --template react-ts`；后端手动 `npm init` 后装 express / tsx / typescript / @types/express / @types/node。

关键配置：`vite.config.ts` 里 `server.proxy = { '/api': 'http://localhost:3000' }`。

## 0.1 规格

- 前端 `frontend/src/App.tsx`：竖屏居中页面（viewport `width=device-width`，容器限宽居中），一个按钮 + 一个 label；点按钮 `fetch POST /api/hello`，把返回的 `message` 写进 label。
- 后端 `backend/src/routes/hello.ts`：`POST /api/hello` 返回 `{ "message": "hello world" }`。

| 方法 | 路径 | 返回 |
| --- | --- | --- |
| POST | /api/hello | { "message": "hello world" } |

## 贯穿全程的约定

1. 前端请求都走 `/api/*`，Vite proxy 转发到 3000，浏览器始终同源（不用配 CORS）。
2. 每版独立跑通、有明确验收，上一版地基不推倒。
3. 选型落地后小版本验证、之后尽量不改：流式用 `fetch` + `ReadableStream`，图片存「内存 + 可选落盘」——详见 README 第十五节。

## 后面会用到（0.2 – 0.4，勿提前实现）

- 0.2 图片上传：multer memoryStorage + `SAVE_UPLOAD_COPY` 可选落盘
- 0.3 LLM 通信：DMXAPI（OpenAI 兼容）+ fetch/ReadableStream 流式
- 0.4 图片 + 多模态：base64 图片 + 流式返回

密钥放 `backend/.env`（gitignore）；图片不上生产落盘（README 第十一节）。
