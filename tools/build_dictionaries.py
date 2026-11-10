import yaml
import csv
import json
import os
import re

DATA_DIR = r'd:\antigravity workbench\data_prep'
OUTPUT_DIR = r'd:\antigravity workbench\app_assets'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Process zh_CN.yaml
with open(os.path.join(DATA_DIR, 'zh_CN.yaml'), 'r', encoding='utf-8') as f:
    zh_categories_raw = yaml.safe_load(f)

cat_icons = {
    '人物': '👤',
    '服饰': '👗',
    '表情动作': '💃',
    '画面': '🎨',
    '环境': '🌲',
    '场景': '🏰',
    '物品': '📦',
    '镜头': '📷',
    '汉服': '👘',
    '魔法系': '✨',
    '反向提示词': '🚫'
}

en_to_cn = {}
en_to_cat = {}
categories_data = []

for cat in zh_categories_raw:
    cat_name = cat.get('name', '').strip()
    cat_obj = {
        'id': cat_name,
        'name': cat_name,
        'icon': cat_icons.get(cat_name, '🏷️'),
        'groups': []
    }
    for g in cat.get('groups', []):
        g_name = (g.get('name') or '').strip()
        g_color = (g.get('color') or '').strip()
        tag_dict = g.get('tags', {})
        tag_list = []
        if isinstance(tag_dict, dict):
            for en, cn in tag_dict.items():
                en_clean = str(en).strip()
                cn_clean = str(cn).strip()
                tag_list.append({'en': en_clean, 'cn': cn_clean})
                en_key = en_clean.lower()
                en_to_cn[en_key] = cn_clean
                en_to_cat[en_key] = f'{cat_name}/{g_name}'
        cat_obj['groups'].append({
            'name': g_name,
            'color': g_color if g_color else '#4b5563',
            'tags': tag_list
        })
    categories_data.append(cat_obj)

print(f"Categories built: {len(categories_data)} categories, {len(en_to_cn)} tag translations.")

# Save categories.json
with open(os.path.join(OUTPUT_DIR, 'categories.json'), 'w', encoding='utf-8') as f:
    json.dump(categories_data, f, ensure_ascii=False, separators=(',', ':'))

# 2. Process Danbooru & Autocomplete dictionary
# We combine:
# - All tags from zh_CN.yaml (giving them high post count priority if missing in danbooru)
# - Quality tags
# - Danbooru tags (up to ~35,000 top tags by post count, plus all matched translations)

danbooru_map = {}
with open(os.path.join(DATA_DIR, 'danbooru.csv'), 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for r in reader:
        if len(r) >= 3:
            tag_name = r[0].strip()
            type_code = int(r[1]) if r[1].isdigit() else 0
            post_count = int(r[2]) if r[2].isdigit() else 0
            aliases = r[3].strip() if len(r) > 3 else ""
            danbooru_map[tag_name.lower()] = {
                'tag': tag_name,
                'type': type_code,
                'count': post_count,
                'aliases': aliases
            }

# Add extra quality tags
extra_quality_path = os.path.join(DATA_DIR, 'extra-quality-tags.csv')
if os.path.exists(extra_quality_path):
    with open(extra_quality_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for r in reader:
            if r and len(r) >= 2:
                q_tag = r[0].strip()
                q_key = q_tag.lower()
                if q_key not in danbooru_map:
                    danbooru_map[q_key] = {
                        'tag': q_tag,
                        'type': 5,
                        'count': 5000000,
                        'aliases': 'quality,best'
                    }

# Build merged tags dictionary
merged_tags = {}

# First, insert all tags from zh_CN.yaml
for cat in categories_data:
    cat_name = cat['name']
    is_negative = (cat_name == '反向提示词')
    for g in cat['groups']:
        g_name = g['name']
        for t in g['tags']:
            en = t['en']
            cn = t['cn']
            en_lower = en.lower()
            dan = danbooru_map.get(en_lower)
            post_count = dan['count'] if dan else 100000
            type_code = dan['type'] if dan else (5 if is_negative else 0)
            aliases = dan['aliases'] if dan else ''
            merged_tags[en_lower] = {
                'tag': en,
                'cn': cn,
                'type': type_code,
                'count': post_count,
                'aliases': aliases,
                'cat': f"{cat_name}/{g_name}",
                'neg': 1 if is_negative else 0
            }

# Next, add Danbooru tags
# Sort danbooru tags by post_count descending
sorted_danbooru = sorted(danbooru_map.values(), key=lambda x: x['count'], reverse=True)

# Include top 30,000 Danbooru tags
for d in sorted_danbooru[:30000]:
    t_lower = d['tag'].lower()
    if t_lower not in merged_tags:
        merged_tags[t_lower] = {
            'tag': d['tag'],
            'cn': en_to_cn.get(t_lower, ''),
            'type': d['type'],
            'count': d['count'],
            'aliases': d['aliases'],
            'cat': en_to_cat.get(t_lower, ''),
            'neg': 0
        }

print(f"Total merged dictionary tags: {len(merged_tags)}")

# Convert to compact list of objects for fast client-side searching
# [tag, cn, type, count, aliases, cat, neg]
dict_list = []
for k, v in merged_tags.items():
    dict_list.append([
        v['tag'],
        v['cn'],
        v['type'],
        v['count'],
        v['aliases'],
        v['cat'],
        v['neg']
    ])

# Sort list by count descending
dict_list.sort(key=lambda x: x[3], reverse=True)

with open(os.path.join(OUTPUT_DIR, 'dictionary.json'), 'w', encoding='utf-8') as f:
    json.dump(dict_list, f, ensure_ascii=False, separators=(',', ':'))

# Generate default Presets for quick start
presets_data = [
    {
        "id": "preset_anime_masterpiece",
        "name": "二次元顶级杰作",
        "category": "画质增强",
        "positive": [
            {"tag": "masterpiece", "weight": 1.0, "cn": "杰作"},
            {"tag": "best quality", "weight": 1.0, "cn": "最佳质量"},
            {"tag": "ultra-detailed", "weight": 1.2, "cn": "超级细节"},
            {"tag": "highres", "weight": 1.0, "cn": "高分辨率"},
            {"tag": "absurdres", "weight": 1.0, "cn": "顶级分辨率"},
            {"tag": "beautiful detailed eyes", "weight": 1.1, "cn": "精致美丽的眼睛"},
            {"tag": "extremely detailed anime wallpaper", "weight": 1.0, "cn": "极其精细的动漫壁纸"}
        ],
        "negative": [
            {"tag": "worst quality", "weight": 1.4, "cn": "最差质量"},
            {"tag": "low quality", "weight": 1.4, "cn": "低质量"},
            {"tag": "normal quality", "weight": 1.0, "cn": "一般质量"},
            {"tag": "bad anatomy", "weight": 1.2, "cn": "糟糕的人体"},
            {"tag": "bad hands", "weight": 1.3, "cn": "糟糕的手"},
            {"tag": "missing fingers", "weight": 1.3, "cn": "缺失手指"},
            {"tag": "extra digits", "weight": 1.2, "cn": "多余手指"},
            {"tag": "fewer digits", "weight": 1.2, "cn": "缺少手指"},
            {"tag": "mutated hands and fingers", "weight": 1.4, "cn": "变异的手指"},
            {"tag": "watermark", "weight": 1.0, "cn": "水印"},
            {"tag": "username", "weight": 1.0, "cn": "用户名"},
            {"tag": "blurry", "weight": 1.2, "cn": "模糊"}
        ]
    },
    {
        "id": "preset_cyberpunk_girl",
        "name": "赛博朋克霓虹少女",
        "category": "风格模板",
        "positive": [
            {"tag": "1girl", "weight": 1.0, "cn": "1女孩"},
            {"tag": "solo", "weight": 1.0, "cn": "单人"},
            {"tag": "cyberpunk", "weight": 1.2, "cn": "赛博朋克"},
            {"tag": "neon lights", "weight": 1.1, "cn": "霓虹灯"},
            {"tag": "glowing visor", "weight": 1.1, "cn": "发光面罩"},
            {"tag": "futuristic city night", "weight": 1.2, "cn": "未来城市夜景"},
            {"tag": "rainy street", "weight": 1.0, "cn": "雨夜街道"},
            {"tag": "reflection", "weight": 1.0, "cn": "倒影"},
            {"tag": "jacket", "weight": 1.0, "cn": "夹克"},
            {"tag": "masterpiece", "weight": 1.0, "cn": "杰作"},
            {"tag": "best quality", "weight": 1.0, "cn": "最佳质量"}
        ],
        "negative": [
            {"tag": "worst quality, low quality", "weight": 1.4, "cn": "低质量"},
            {"tag": "bad anatomy", "weight": 1.2, "cn": "糟糕的人体"},
            {"tag": "bad hands", "weight": 1.3, "cn": "糟糕的手"}
        ]
    },
    {
        "id": "preset_standard_negative",
        "name": "通用万能负面词 (Universal Negative)",
        "category": "常用负面",
        "positive": [],
        "negative": [
            {"tag": "worst quality", "weight": 1.4, "cn": "最差质量"},
            {"tag": "low quality", "weight": 1.4, "cn": "低质量"},
            {"tag": "bad anatomy", "weight": 1.3, "cn": "糟糕的人体"},
            {"tag": "bad hands", "weight": 1.3, "cn": "糟糕的手"},
            {"tag": "missing fingers", "weight": 1.3, "cn": "缺失手指"},
            {"tag": "extra fingers", "weight": 1.3, "cn": "多余手指"},
            {"tag": "poorly drawn hands", "weight": 1.2, "cn": "拙劣的手部绘画"},
            {"tag": "mutated hands", "weight": 1.3, "cn": "变异手部"},
            {"tag": "ugly", "weight": 1.2, "cn": "丑陋"},
            {"tag": "blurry", "weight": 1.2, "cn": "模糊"},
            {"tag": "watermark", "weight": 1.1, "cn": "水印"},
            {"tag": "signature", "weight": 1.1, "cn": "签名"},
            {"tag": "text", "weight": 1.1, "cn": "文字"}
        ]
    }
]

with open(os.path.join(OUTPUT_DIR, 'presets.json'), 'w', encoding='utf-8') as f:
    json.dump(presets_data, f, ensure_ascii=False, indent=2)

print("Presets generated successfully.")
