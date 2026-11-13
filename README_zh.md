# ✨ SD Prompt Master (SD 提示词助手 - Android 端)

<p align="center">
  <a href="README.md">English</a> •
  <b>简体中文</b>
</p>

<p align="center">
  <a href="https://github.com/Day0004/sd-prompt-tagcomplete-android"><img src="https://img.shields.io/badge/Platform-Android_7.0+-brightgreen.svg" alt="Platform"></a>
  <a href="https://github.com/Day0004/sd-prompt-tagcomplete-android/releases"><img src="https://img.shields.io/github/v/release/Day0004/sd-prompt-tagcomplete-android?color=blue" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/Size-~5MB-orange.svg" alt="App Size">
  <img src="https://img.shields.io/badge/Offline-100%25-success.svg" alt="100% Offline">
</p>

专为 Android 手机端打造的独立 **Stable Diffusion / AI 绘画提示词助手**。

随时随地在手机上构思、微调并管理你的高质量提示词，复制后直接粘贴到 SD WebUI、ComfyUI 或各种生图应用中使用！

---

### 💡 为什么做这个？

在电脑端，我们离不开 SD WebUI 的两款核心神器插件：
1. **[sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one)**：分类标签面板、中文对照、可视化权重微调、常用预设。
2. **[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)**：Danbooru 31,000+ 高频词库实时联想、热度排行、常用别名缩写匹配 (例如输入 `/lh` 自动补全 `long_hair`)。

但在移动端上，一直缺少一款干净轻巧、体验对标的提示词工具。

**SD Prompt Master** 将这两大神级插件的核心体验深度融合并带到了 Android 平台：
- ⚡ **100% 离线内置**：内置完整 31,311 条 Danbooru 标签及高质量汉化翻译。无需联网、零延迟、无广告、无隐私追踪，启动秒开；
- 🎯 **专注提示词本身**：摒弃了手机端不需要的几百 MB 本地模型扫描和冗余在线翻译接口；
- 🪶 **超轻体积**：安装包仅约 5MB，系统占用极低，Android 7.0 及以上机型均可流畅运行。

---

## 📱 核心功能特性

### 1. ✍️ 提示词工作台 (Prompt All In One 体验)
- 🗂️ **正反向双卡片分区**：正向提示词 (Positive) 与负向提示词 (Negative) 独立管理，互不干扰。
- 🏷️ **交互式标签芯片 (Chips)**：
  - **双语对照**：每个标签清晰展示英文 Tag 与中文释义。
  - **步长微调**：点击 `+` / `-` 步长微调权重（支持 0.1 / 0.05 步长切换），或直接点击权重数值自定义输入。
  - **顺序微调 (◀ / ▶)**：轻触方向箭头即可快速调换提示词在序列中的前后权重顺序。
  - **临时禁用 (👁️)**：一键临时屏蔽某个提示词，导出的文本中不包含，方便对比开/关效果。
  - **星标收藏 (☆ / ★)**：轻触五角星，高频喜欢的标签一键存入个人收藏库。
- 🔄 **卡片 / 纯文本双向实时同步**：随时切换纯文本直接粘贴或修改，退出后自动解析为标签芯片。
- 📋 **一键快捷复制**：
  - 复制正向提示词
  - 复制负向提示词
  - 一键复制全部（输出标准 WebUI 格式：`正向提示词\nNegative prompt: 负向提示词`）
- 🛡️ **万能负面词一键填入**：一键注入最差质量、糟糕肢体、多指等常用通用负向词。
- 🧹 **批量工具**：一键去除重复词、标准化权重语法、一键权重递增/递减或重置。

---

### 2. 🔍 实时输入联想与补全 (TagComplete 体验)
- ⚡ **毫秒级模糊与前缀搜索**：输入 `1g` 立即联想 `1girl`；
- 🇨🇳 **中文反向联想**：输入 `女孩`、`长发`、`双马尾` 立即匹配对应的英文 Danbooru 标签；
- ⌨️ **经典缩写别名匹配**：继承 TagComplete 经典别名，如输入 `/lh` 匹配 `long_hair`，输入 `/b` 匹配 `breasts`，输入 `/lav` 匹配 `looking_at_viewer`；
- 📊 **丰富的标签元数据展示**：
  - **分类角标**：普通 (General)、画师 (Artist)、角色 (Character)、作品 (Series)、画质/元数据 (Meta)。
  - **Danbooru 热度统计**：基于真实发帖频率展示计数（如 `6.0M`、`1.5M`、`240k`），热门词条优先靠前。
- ➕ **极速插入按钮**：每条补全建议均带有 `[+ 正向]` 和 `[- 负向]` 快捷键，轻点直达对应编辑区。

---

### 3. 🏷️ 11 大核心分类词库 (离线内置词典)
涵盖 11 大核心分类、137 个精细分组、近 4,000 个高频精选词汇：
- 👤 **人物**：角色对象、身体特征、发型、发色、眼睛特征、表情、袜子、鞋子、饰品、帽子、姿势等
- 👗 **服饰**：上衣、外套、裤子、裙子、内衣、泳衣、制服、风格服饰等
- 💃 **表情动作**：基础动作、微表情、坐姿、站姿、手势、动态姿态等
- 🎨 **画面**：画质、艺术风格、媒介、笔触、光影效果、色彩、渲染风格等
- 🌲 **环境**：室内、室外、自然天气、天空、季节时间等
- 🏰 **场景**：城市街道、房间背景、奇幻场景、科幻未来等
- 📦 **物品**：食物、道具、武器、乐器、植物等
- 📷 **镜头**：视角构图、景深光晕、焦距特写等
- 👘 **汉服**：形制、纹理花纹、传统配饰等
- ✨ **魔法特效**：元素魔法、法术特效、粒子特效等
- 🚫 **反向提示词**：负面画质、错误解剖、肢体瑕疵等

每个分组配有专属颜色色块与中英双语标签，点击即可直接加入工作台。

---

### 4. ⭐ 收藏列表与预设组合 (Presets & Favorites)
- 🎨 **内置高品质预设模板**：
  - 🌸 **二次元顶级杰作** (Anime Masterpiece)
  - 🏙️ **赛博朋克霓虹少女** (Cyberpunk Neon Girl)
  - 🛡️ **通用万能负面词** (Universal Negative)
- 💾 **自定义预设保存**：将当前满意的正向+反向提示词一键存为专属模板，随时调用。
- 📌 **独立单词收藏夹**：星标收藏的常用单个标签聚合展示，随手一点即可插入。
- 📦 **配置备份与共享**：支持预设与收藏夹的 JSON 一键导出与导入备份。

---

## 📥 下载安装

前往本仓库的 [Releases 页面](https://github.com/Day0004/sd-prompt-tagcomplete-android/releases) 下载最新 APK 安装包：
- **`app-release.apk`** (安装包大小约 ~5MB)

> 💡 **提示**：安装时若系统提示“来自未知来源”，允许安装即可放心使用。应用完全离线运行，无任何网络请求权限。

---

## 🛠️ 本地编译构建

本项目基于标准的 Android Gradle 架构：

### 环境要求
- JDK 17 或 JDK 21
- Android SDK (API 34)
- Gradle 8.7+

### 构建步骤
```bash
# 1. 克隆代码仓库
git clone https://github.com/Day0004/sd-prompt-tagcomplete-android.git
cd sd-prompt-tagcomplete-android

# 2. 编译 Release APK
./gradlew assembleRelease
```

编译生成的 APK 位于：
```
app/build/outputs/apk/release/app-release.apk
```

---

## 📄 开源致谢与许可

本项目提示词字典与逻辑灵感来源于以下两个卓越的开源项目：
- **[sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one)** by @Physton
- **[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)** by @DominikDoom

本项目基于 **MIT** 许可证开源。欢迎提交 Issue 或 Pull Request！
