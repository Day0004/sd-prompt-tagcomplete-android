# SD Prompt Master (SD 提示词助手 - Android 端)

[![Android Build](https://img.shields.io/badge/Platform-Android_7.0+-brightgreen.svg)](https://github.com/Day0004/sd-prompt-tagcomplete-android)
[![Release](https://img.shields.io/github/v/release/Day0004/sd-prompt-tagcomplete-android?color=blue)](https://github.com/Day0004/sd-prompt-tagcomplete-android/releases)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个专为 Android 移动端打造的独立 Stable Diffusion / AI 绘画提示词助手应用。

参照并融合了 SD WebUI 最核心的两个提示词神级插件：
1. **[sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one)**：分类标签选择、中文对照翻译、权重可视化微调、一键复制、提示词预设收藏。
2. **[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)**：Danbooru 31,000+ 高频词库、实时输入联想补全、热度统计、别名缩写匹配 (如 `/lh` -> `long_hair`)。

针对移动端进行了深度精简与优化：
- **纯粹专注提示词**：去掉了移动端用不到的本地 checkpoint / LoRA 文件扫描；
- **100% 离线内置**：去掉了复杂的离线翻译大模型和在线翻译 API 配置，内置 31,311 标签和高质量汉化翻译，完全不需要联网，无任何广告，启动秒开；
- **完整的收藏与预设功能**：保留并强化了个人收藏夹、提示词模板组合、预设导入导出。

---

## 📱 核心功能特性

### 1. ✍️ 提示词工作台 (Prompt All In One 体验)
- **双卡片分区**：正向提示词 (Positive) 与负向提示词 (Negative) 独立管理。
- **可视化标签芯片 (Chips)**：
  - 每个标签芯片清晰展示 **英文标签** 与 **中文翻译**。
  - **权重微调**：点击 `+` / `-` 步长微调权重（支持 0.1 / 0.05 步长），或直接点击权重数值自定义输入。
  - **临时禁用 (👁️)**：可随时禁用某个标签（导出的文本中不包含，但保留在列表中方便随时开启对比效果）。
  - **星标收藏 (☆ / ★)**：一键将高频喜欢的标签加入个人收藏库。
  - **左右拖拽/排序**：轻松调换提示词前后顺序。
- **纯文本 / 卡片模式双向同步**：随时切换纯文本直接粘贴或修改，退出后自动解析为标签芯片。
- **一键快捷复制**：
  - 复制正向提示词
  - 复制负向提示词
  - 一键复制全部（输出标准 WebUI 格式：`正向提示词\nNegative prompt: 负向提示词`）
- **通用负面词一键填入 (🛡️)**：一键载入包括最差质量、糟糕人体、多指等万能负面词库。
- **整理与格式化**：一键去除重复词、标准化权重语法。

---

### 2. 🔍 实时输入联想与补全 (TagComplete 体验)
- **多维度极速搜索**：
  - **前缀与模糊搜索**：输入 `1g` 立即联想 `1girl`；
  - **中文搜索**：输入 `女孩`、`长发`、`双马尾` 立即匹配对应的英文 Danbooru 标签；
  - **别名与缩写匹配**：支持 TagComplete 经典缩写，如输入 `/lh` 联想 `long_hair`，输入 `/b` 联想 `breasts`，输入 `/lav` 联想 `looking_at_viewer`。
- **丰富的联想信息展示**：
  - 🏷️ **标签类型角标**：普通 (General)、画师 (Artist)、角色 (Character)、作品 (Series)、画质 (Quality/Meta)。
  - 🔥 **发帖热度统计**：基于 Danbooru 真实使用频率展示（如 `6.0M`、`1.5M`、`240k`），最热门的标签优先排在最前。
  - 快捷操作：每条建议均提供 `[+ 正向]` 和 `[- 负向]` 快捷按钮，轻触即可插入对应提示框。

---

### 3. 🏷️ 分类提示词库 (Prompt All in One 内置词典)
涵盖 11 大核心分类、137 个子分组、近 4,000 个高频精选词汇：
- 👤 **人物**：对象、身体、发型、发色、眼睛特征、表情、袜子、鞋子、饰品、帽子、姿势等
- 👗 **服饰**：上衣、外套、裤子、裙子、内衣、泳衣、制服、风格服饰等
- 💃 **表情动作**：常见表情、微表情、坐姿、站姿、手势、动态姿态等
- 🎨 **画面**：画质、艺术风格、媒介、笔触、光影、色彩、渲染风格等
- 🌲 **环境**：室内、室外、自然天气、天空、季节时间等
- 🏰 **场景**：城市街道、房间背景、奇幻场景、科幻未来等
- 📦 **物品**：食物、道具、武器、乐器、植物等
- 📷 **镜头**：视角构图、景深光晕、焦距特写等
- 👘 **汉服**：形制、纹理花纹、传统配饰等
- ✨ **魔法系**：元素魔法、法术特效、粒子特效等
- 🚫 **反向提示词**：负面画质、错误解剖、肢体瑕疵等

每个分组配有专属颜色色块和中英双语标签，点击即可直接添加至工作台。

---

### 4. ⭐ 收藏列表与预设组合 (Presets & Favorites)
- **预置高质量画质模板**：
  - 🌸 **二次元顶级杰作** (Anime Masterpiece)
  - 🏙️ **赛博朋克霓虹少女** (Cyberpunk Neon Girl)
  - 🛡️ **通用万能负面词** (Universal Negative)
- **保存自定义预设**：可将当前调试好的正向+负向提示词一键保存为模板，随时取用。
- **独立收藏夹**：收藏的单个常用标签独立聚合展示，点击即插。
- **备份与共享**：支持预设与收藏的 JSON 导入与导出。

---

## 📥 下载安装

前往本仓库的 [Releases 页面](https://github.com/Day0004/sd-prompt-tagcomplete-android/releases) 下载最新版本的安装包：
- **`app-release.apk`** (大小仅 ~5MB，支持 Android 7.0 及以上所有机型)

下载后在手机上直接点击安装即可使用。

---

## 🛠️ 本地构建指南

本项目使用标准 Android Gradle 架构构建：

### 环境要求
- JDK 17 或 JDK 21
- Android SDK (API 34)
- Gradle 8.7+

### 构建步骤
```bash
# 克隆仓库
git clone https://github.com/Day0004/sd-prompt-tagcomplete-android.git
cd sd-prompt-tagcomplete-android

# 编译 Release APK
./gradlew assembleRelease
```
编译产物位于：
`app/build/outputs/apk/release/app-release.apk`

---

## 📄 开源致谢与许可

本项目提示词字典与逻辑灵感来源于以下两个开源项目：
- [sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one) by @Physton
- [a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete) by @DominikDoom

本项目基于 MIT 协议开源。
