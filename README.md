# ✨ SD Prompt Master (Android)

<p align="center">
  <b>English</b> •
  <a href="README_zh.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/Day0004/sd-prompt-tagcomplete-android"><img src="https://img.shields.io/badge/Platform-Android_7.0+-brightgreen.svg" alt="Platform"></a>
  <a href="https://github.com/Day0004/sd-prompt-tagcomplete-android/releases"><img src="https://img.shields.io/github/v/release/Day0004/sd-prompt-tagcomplete-android?color=blue" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/Size-~5MB-orange.svg" alt="App Size">
  <img src="https://img.shields.io/badge/Offline-100%25-success.svg" alt="100% Offline">
</p>

A standalone, mobile-first prompt engineering workbench and tag autocomplete assistant for **Stable Diffusion & AI Art** on Android.

Craft, refine, weight, and organize your Danbooru & AI art prompts right on your phone — ready to copy and paste directly into SD WebUI (A1111), ComfyUI, Forge, or mobile generation workflows!

---

### 💡 Why SD Prompt Master?

On desktop, virtually every Stable Diffusion creator depends on two essential WebUI extensions:
1. **[sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one)**: Category tag panels, bilingual translations, interactive weight stepping, and custom presets.
2. **[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)**: Real-time autocomplete across 31,000+ Danbooru tags, popularity ranking, and shorthand aliases (e.g. `/lh` -> `long_hair`).

Until now, mobile devices lacked a clean, distraction-free prompt crafting tool that matched that desktop workflow.

**SD Prompt Master** brings the best of both extensions together into a responsive, pocket-sized Android app:
- ⚡ **100% Offline & Instant**: Bundles 31,311 Danbooru tags with high-quality bilingual translations directly in the APK. Zero internet connection required, zero API latency, zero ads, and zero privacy tracking. Starts in a split second.
- 🎯 **Laser-Focused on Prompts**: Stripped of heavy local model scanning and complex cloud translation configs that are unnecessary on a phone.
- 🪶 **Ultra Lightweight**: Only ~5MB APK footprint. Smooth and snappy on virtually any device running Android 7.0 or higher.

---

## 📱 Core Features

### 1. ✍️ Prompt Workbench (Prompt All-in-One Experience)
- 🗂️ **Dual-Card Layout**: Separate positive and negative prompt workspaces for clean, organized editing.
- 🏷️ **Interactive Tag Chips**:
  - **Bilingual Display**: View the canonical English Danbooru tag alongside its Chinese translation at a glance.
  - **Granular Weight Stepping**: Adjust weights with `+` / `-` steppers (0.1 or 0.05 step options), or tap the number directly to type a custom value.
  - **Order Fine-Tuning (◀ / ▶)**: Tap arrow buttons to shift tags forward or backward in the prompt order.
  - **Temporary Mute (👁️)**: Toggle individual tags on or off without deleting them — perfect for A/B testing prompt combinations.
  - **Favorites (☆ / ★)**: Tap the star icon to pin your favorite tags into your personal collection.
- 🔄 **Two-Way Sync**: Seamlessly toggle between visual chip mode and raw plain-text mode.
- 📋 **One-Click Quick Copy**:
  - Copy Positive prompts only
  - Copy Negative prompts only
  - Copy All in standard WebUI format (`Positive prompt\nNegative prompt: Negative prompt`)
- 🛡️ **Universal Negative Filler**: One-tap injection of common negative prompts (worst quality, bad anatomy, missing fingers, extra digits, etc.).
- 🧹 **Batch Tools**: One-tap tag deduplication, weight syntax normalization, and uniform +/- weight increment/decrement.

---

### 2. 🔍 Real-Time Input Autocomplete (TagComplete Experience)
- ⚡ **Sub-millisecond Search**: Blazing fast prefix and fuzzy matching — type `1g` to instantly suggest `1girl`.
- 🇨🇳 **Bilingual Keyword Lookup**: Search using Chinese keywords (e.g. `女孩`, `长发`, `双马尾`) to find matching Danbooru tags.
- ⌨️ **Classic Shorthand Aliases**: Full support for familiar TagComplete abbreviations like `/lh` for `long_hair`, `/b` for `breasts`, and `/lav` for `looking_at_viewer`.
- 📊 **Rich Tag Metadata**:
  - **Category Badges**: General, Artist, Character, Series, and Meta/Quality.
  - **Danbooru Popularity Counts**: Real-world usage frequency stats (e.g. `6.0M`, `1.5M`, `240k`) ensure top-tier tags rank first.
- ➕ **Direct Insertion Buttons**: Every suggestion offers dedicated `[+ Pos]` and `[- Neg]` quick-insert buttons.

---

### 3. 🏷️ 11 Built-in Tag Categories (Curated Dictionary)
Over 137 sub-groups and ~4,000 curated high-frequency bilingual tags ready to browse and click:
- 👤 **Characters**: Subject count, body features, hair styles, hair colors, eye characteristics, expressions, socks, shoes, accessories, poses, etc.
- 👗 **Clothing**: Tops, outerwear, pants, skirts, underwear, swimwear, uniforms, fashion styles, etc.
- 💃 **Actions & Expressions**: Core actions, micro-expressions, sitting, standing, hand gestures, dynamic action poses, etc.
- 🎨 **Visual Styles**: Quality modifiers, artistic styles, mediums, brushwork, lighting, color tones, rendering styles, etc.
- 🌲 **Environments**: Indoors, outdoors, natural weather, sky, seasons, time of day, etc.
- 🏰 **Scenes**: Urban streets, room interiors, fantasy landscapes, sci-fi/cyberpunk settings, etc.
- 📦 **Objects**: Food, props, weapons, musical instruments, plants, etc.
- 📷 **Camera & Shot**: Perspective framing, depth of field, bokeh, focal length close-ups, etc.
- 👘 **Traditional Outfits**: Hanfu, kimono, fabrics, patterns, cultural accessories, etc.
- ✨ **Magic & VFX**: Elemental magic, spell effects, glowing particles, aura, etc.
- 🚫 **Negative Masterlist**: Quality defects, anatomical flaws, limb mutations, artifacts, etc.

Each category features distinct color-coded chips for effortless visual discovery.

---

### 4. ⭐ Presets & Favorites Management
- 🎨 **Pre-packaged Style Templates**:
  - 🌸 **Anime Masterpiece**
  - 🏙️ **Cyberpunk Neon Girl**
  - 🛡️ **Universal Negative**
- 💾 **Custom Presets**: Save your dialed-in positive + negative prompt set as a reusable template with a single tap.
- 📌 **Standalone Tag Favorites**: A dedicated collection tab for frequently used tags.
- 📦 **Import & Export**: Backup and restore your custom presets and starred tags via JSON format.

---

## 📥 Download & Installation

Grab the latest pre-built APK from the [Releases Page](https://github.com/Day0004/sd-prompt-tagcomplete-android/releases):
- **`app-release.apk`** (~5MB download)

> 💡 **Installation Note**: If your Android system shows an "Install from unknown sources" security prompt, simply approve it. The app is completely self-contained and operates 100% offline without network permissions.

---

## 🛠️ Building from Source

This project builds with standard Android Gradle tooling:

### Prerequisites
- JDK 17 or JDK 21
- Android SDK (API level 34)
- Gradle 8.7+

### Build Steps
```bash
# 1. Clone the repository
git clone https://github.com/Day0004/sd-prompt-tagcomplete-android.git
cd sd-prompt-tagcomplete-android

# 2. Build the release APK
./gradlew assembleRelease
```

The compiled APK will be generated at:
```
app/build/outputs/apk/release/app-release.apk
```

---

## 📄 Credits & License

The prompt vocabulary and UX workflows are inspired by two gold-standard open-source projects in the SD community:
- **[sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one)** by @Physton
- **[a1111-sd-webui-tagcomplete](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)** by @DominikDoom

Released under the **MIT License**. Contributions, bug reports, and suggestions are welcome!
