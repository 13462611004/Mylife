# 项目空间优化指南

## 📊 当前空间占用分析

| 目录/文件 | 大小 | 说明 | 是否可优化 |
|---------|------|------|----------|
| `frontend/node_modules` | 1.1GB | 前端依赖包 | ⚠️ 可删除重建 |
| `frontend/node_modules/.cache` | **544MB** | npm缓存 | ✅ **立即清理** |
| `frontend/build` | 30MB | 构建产物 | ⚠️ 开发时可清理 |
| `frontend/public` | 27MB | 静态资源 | ❌ 需要保留 |
| `backend/venv` | 86MB | Python虚拟环境 | ⚠️ 可删除重建 |
| `backend/media` | 27MB | 用户上传文件 | ❌ 生产数据需保留 |
| `.git` | 33MB | Git仓库 | ✅ 正常大小 |

**总计：~1.17GB**

---

## ✅ 已完成的优化

1. **优化 `package.json`**
   - 将测试相关依赖移到 `devDependencies`
   - 这不会立即减少空间，但能更好地组织依赖

2. **创建优化脚本**
   - `optimize_project.sh` - 一键清理缓存和临时文件

---

## 🚀 快速优化（推荐）

### 方法1: 使用优化脚本（最简单）

```bash
./optimize_project.sh
```

这个脚本会：
- ✅ 清理 `node_modules/.cache` (544MB)
- ✅ 清理 Python 缓存文件
- ⚠️ 可选清理 `build` 目录

**预计节省：~544MB**

---

### 方法2: 手动清理缓存

```bash
# 清理 npm 缓存（不影响项目功能）
rm -rf frontend/node_modules/.cache

# 清理 Python 缓存
find backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find backend -type f -name "*.pyc" -delete 2>/dev/null

# 清理构建产物（开发环境）
rm -rf frontend/build
```

---

## ⚠️ 高级优化（需谨慎）

### 1. 重建 node_modules（节省不明显，但可清理冗余）

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**注意**：这只会重新安装依赖，空间不会明显减少。但如果依赖有更新或冲突，重建可能有帮助。

### 2. 重建 Python 虚拟环境（节省不明显）

```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## 📝 优化建议总结

### ✅ 可以立即做的（安全）

1. **清理缓存文件** ⭐ **推荐**
   - `node_modules/.cache` (544MB)
   - Python `__pycache__` 和 `.pyc` 文件

2. **开发环境清理 `build` 目录**（生产环境需保留）
   - 节省约 30MB

### ⚠️ 谨慎操作

1. **删除 `node_modules` 重建**
   - 可以修复依赖问题，但空间节省不明显
   - 需要重新 `npm install`（可能较慢）

2. **删除 `venv` 重建**
   - 空间节省不明显（86MB）
   - 需要重新安装依赖

### ❌ 不建议删除

1. **`backend/media/`** - 包含用户上传的数据
2. **`frontend/public/`** - 包含必要的静态资源
3. **`.git/`** - Git 历史记录（已优化）

---

## 💡 长期优化建议

1. **使用 `.gitignore`** ✅ 已完成
   - 确保大目录不会被提交到 Git

2. **定期清理缓存**
   - 定期运行 `optimize_project.sh`

3. **监控 `media/` 目录**
   - 如果用户上传的文件过多，考虑定期归档

4. **使用 Docker（可选）**
   - 如果需要更好的依赖管理，可以考虑容器化

---

## 🔍 验证优化效果

运行以下命令查看优化后的空间占用：

```bash
du -sh * | sort -hr
```

---

## ❓ 常见问题

**Q: 清理 `node_modules/.cache` 会影响项目吗？**  
A: 不会。这是 npm 的缓存，删除后会在需要时自动重建。

**Q: 两个图表库（chart.js 和 echarts）都需要吗？**  
A: 是的。`chart.js` 用于折线图，`echarts` 用于地图可视化，两者都在使用中。

**Q: 优化后如何恢复？**  
A: 
- 缓存文件会自动重建（不需要手动恢复）
- 如果删除了 `node_modules`，运行 `npm install` 即可
- 如果删除了 `venv`，按文档重新创建虚拟环境

---

**最后更新：** 2026-01-11
