# Git 版本控制使用指南

## 当前状态

✅ Git 仓库已初始化
✅ 已完成初始提交（93个文件，31365行代码）
✅ 已配置用户信息

## 常用 Git 命令

### 查看状态
```bash
git status                    # 查看当前工作区状态
git log --oneline            # 查看提交历史（简洁版）
git log                      # 查看详细提交历史
```

### 提交更改
```bash
git add .                     # 添加所有更改的文件
git add <文件路径>            # 添加特定文件
git commit -m "提交说明"      # 提交更改
```

### 查看差异
```bash
git diff                     # 查看工作区与暂存区的差异
git diff --staged            # 查看暂存区与上次提交的差异
git diff HEAD                # 查看工作区与上次提交的差异
```

### 撤销操作
```bash
git restore <文件>           # 撤销工作区的更改（未add的文件）
git restore --staged <文件>  # 撤销暂存区的更改（已add但未commit）
git reset --soft HEAD~1      # 撤销最后一次提交，保留更改在暂存区
```

### 分支操作
```bash
git branch                    # 查看所有分支
git branch <分支名>           # 创建新分支
git checkout <分支名>        # 切换到分支
git checkout -b <分支名>     # 创建并切换到新分支
git merge <分支名>           # 合并分支
```

### 远程仓库（如果配置了）
```bash
git remote -v                 # 查看远程仓库
git remote add origin <URL>  # 添加远程仓库
git push -u origin master     # 推送到远程仓库
git pull                      # 从远程仓库拉取更新
```

## 推荐工作流程

### 日常开发
1. 修改代码
2. `git status` 查看更改
3. `git add .` 添加更改
4. `git commit -m "描述你的更改"` 提交
5. 定期提交，保持提交信息清晰

### 提交信息规范
- 使用中文或英文描述
- 简洁明了，说明做了什么
- 示例：
  - "添加Live图上传支持"
  - "修复朋友圈显示问题"
  - "优化移动端响应式布局"

## 注意事项

⚠️ **重要文件已排除**（通过.gitignore）：
- `node_modules/` - Node.js依赖
- `venv/` - Python虚拟环境
- `__pycache__/` - Python缓存
- `*.log` - 日志文件
- `.env` - 环境变量文件

✅ **已纳入版本控制**：
- 所有源代码文件
- 配置文件
- 文档文件

## 恢复文件

如果文件被误删，可以使用：
```bash
git checkout HEAD -- <文件路径>  # 恢复单个文件
git checkout HEAD -- .           # 恢复所有文件
```

## 查看历史版本

```bash
git log --oneline -- <文件路径>  # 查看文件历史
git show <提交ID>:<文件路径>      # 查看文件在某个提交时的内容
```

## 当前提交信息

- **提交ID**: 2679411
- **提交说明**: 初始提交：完整的追光小慢侠项目
- **文件数**: 93个文件
- **代码行数**: 31365行
