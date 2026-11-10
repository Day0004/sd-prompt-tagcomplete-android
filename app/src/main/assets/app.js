// SD Prompt Master - Core Application Logic
// Integrating sd-webui-prompt-all-in-one & a1111-sd-webui-tagcomplete

(function() {
  'use strict';

  // State
  let categoriesData = [];
  let dictionaryData = [];
  let presetsData = [];
  let enToCnMap = new Map();
  let enToCatMap = new Map();

  let state = {
    positiveTags: [],
    negativeTags: [],
    starredTags: new Set(),
    userPresets: [],
    weightStep: 0.1,
    weightFormat: 'colon', // 'colon' or 'bracket'
    activeTab: 'editor',
    activeCategoryIndex: 0,
    dictFilterType: 'all',
    currentFocusPrompt: 'pos', // 'pos' or 'neg'
    posRawMode: false,
    negRawMode: false
  };

  // DOM Elements
  const searchInput = document.getElementById('tag-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const autocompleteList = document.getElementById('autocomplete-list');
  const dictStatusText = document.getElementById('dict-status-text');

  const posChipsBox = document.getElementById('pos-chips-box');
  const negChipsBox = document.getElementById('neg-chips-box');
  const posCountBadge = document.getElementById('pos-count-badge');
  const negCountBadge = document.getElementById('neg-count-badge');
  const posRawText = document.getElementById('pos-raw-text');
  const negRawText = document.getElementById('neg-raw-text');

  const categoryTabs = document.getElementById('category-tabs');
  const categoryGroups = document.getElementById('category-groups');
  const dictResultsContainer = document.getElementById('dict-results-container');
  const presetsContainer = document.getElementById('presets-container');
  const starredTagsContainer = document.getElementById('starred-tags-container');

  // --- Utility Functions ---
  function showToast(msg) {
    if (window.AndroidApp && typeof window.AndroidApp.showToast === 'function') {
      window.AndroidApp.showToast(msg);
      return;
    }
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2000);
  }

  function copyText(text, label) {
    if (!text || !text.trim()) {
      showToast('提示词内容为空');
      return;
    }
    if (window.AndroidApp && typeof window.AndroidApp.copyToClipboard === 'function') {
      window.AndroidApp.copyToClipboard(text, label || 'Prompt');
      showToast(`已复制 ${label || '提示词'}`);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`已复制 ${label || '提示词'}`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(`已复制 ${label || '提示词'}`);
    } catch(e) {
      showToast('复制失败，请手动选择复制');
    }
    document.body.removeChild(ta);
  }

  function formatCount(num) {
    if (!num) return '';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return Math.round(num / 1000) + 'k';
    return num.toString();
  }

  function getTypeBadge(tp) {
    switch (tp) {
      case 0: return '<span class="sugg-badge badge-0">General</span>';
      case 1: return '<span class="sugg-badge badge-1">Artist</span>';
      case 3: return '<span class="sugg-badge badge-3">Series</span>';
      case 4: return '<span class="sugg-badge badge-4">Character</span>';
      case 5: return '<span class="sugg-badge badge-5">Quality/Meta</span>';
      default: return '<span class="sugg-badge badge-0">Tag</span>';
    }
  }

  // --- Local Storage Persistence ---
  function loadPersistedState() {
    try {
      const savedPos = localStorage.getItem('sd_pos_tags');
      if (savedPos) state.positiveTags = JSON.parse(savedPos);

      const savedNeg = localStorage.getItem('sd_neg_tags');
      if (savedNeg) state.negativeTags = JSON.parse(savedNeg);

      const savedStarred = localStorage.getItem('sd_starred_tags');
      if (savedStarred) state.starredTags = new Set(JSON.parse(savedStarred));

      const savedPresets = localStorage.getItem('sd_user_presets');
      if (savedPresets) state.userPresets = JSON.parse(savedPresets);

      const savedStep = localStorage.getItem('sd_weight_step');
      if (savedStep) state.weightStep = parseFloat(savedStep);

      const savedFmt = localStorage.getItem('sd_weight_fmt');
      if (savedFmt) state.weightFormat = savedFmt;
    } catch(e) {
      console.error('Failed to load localStorage', e);
    }
  }

  function persistPrompts() {
    try {
      localStorage.setItem('sd_pos_tags', JSON.stringify(state.positiveTags));
      localStorage.setItem('sd_neg_tags', JSON.stringify(state.negativeTags));
    } catch(e) {}
  }

  function persistStarred() {
    try {
      localStorage.setItem('sd_starred_tags', JSON.stringify(Array.from(state.starredTags)));
    } catch(e) {}
  }

  function persistPresets() {
    try {
      localStorage.setItem('sd_user_presets', JSON.stringify(state.userPresets));
    } catch(e) {}
  }

  // --- Tag Weight Formatting ---
  function formatTagString(tagObj) {
    if (tagObj.disabled) return null;
    const tag = tagObj.tag.trim();
    const w = tagObj.weight !== undefined ? Number(tagObj.weight) : 1.0;

    if (Math.abs(w - 1.0) < 0.01) {
      return tag;
    }

    if (state.weightFormat === 'colon') {
      const wFormatted = w.toFixed(2).replace(/\.?0+$/, '');
      return `(${tag}:${wFormatted})`;
    } else {
      // Bracket mode: {tag} for +10%, [tag] for -10%
      if (w > 1.0) {
        const count = Math.min(5, Math.max(1, Math.round((w - 1.0) / 0.1)));
        return '{'.repeat(count) + tag + '}'.repeat(count);
      } else {
        const count = Math.min(5, Math.max(1, Math.round((1.0 - w) / 0.1)));
        return '['.repeat(count) + tag + ']'.repeat(count);
      }
    }
  }

  function buildPromptText(tagsArray) {
    return tagsArray
      .map(t => formatTagString(t))
      .filter(t => t !== null && t.length > 0)
      .join(', ');
  }

  // Parse raw text into structured tags
  function parseRawPromptText(raw) {
    if (!raw) return [];
    const parts = raw.split(/,\s*/);
    const result = [];

    parts.forEach(p => {
      let trimmed = p.trim();
      if (!trimmed) return;

      let weight = 1.0;
      let cleanTag = trimmed;

      // Check (tag:weight)
      const colonMatch = trimmed.match(/^\((.+):([0-9.]+)\)$/);
      if (colonMatch) {
        cleanTag = colonMatch[1].trim();
        weight = parseFloat(colonMatch[2]);
      } else {
        // Check {tag} or [tag]
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          let openCount = 0;
          while (cleanTag.startsWith('{') && cleanTag.endsWith('}')) {
            openCount++;
            cleanTag = cleanTag.slice(1, -1).trim();
          }
          weight = 1.0 + (openCount * 0.1);
        } else if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          let openCount = 0;
          while (cleanTag.startsWith('[') && cleanTag.endsWith(']')) {
            openCount++;
            cleanTag = cleanTag.slice(1, -1).trim();
          }
          weight = Math.max(0.1, 1.0 - (openCount * 0.1));
        } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
          let openCount = 0;
          while (cleanTag.startsWith('(') && cleanTag.endsWith(')')) {
            openCount++;
            cleanTag = cleanTag.slice(1, -1).trim();
          }
          weight = 1.0 + (openCount * 0.1);
        }
      }

      const lookupKey = cleanTag.toLowerCase();
      const cn = enToCnMap.get(lookupKey) || '';

      result.push({
        id: 'tag_' + Math.random().toString(36).substr(2, 9),
        tag: cleanTag,
        cn: cn,
        weight: Number(weight.toFixed(2)),
        disabled: false
      });
    });

    return result;
  }

  // --- Render Prompts ---
  function renderPrompts() {
    renderChips('pos');
    renderChips('neg');
    persistPrompts();
  }

  function renderChips(type) {
    const isPos = (type === 'pos');
    const tags = isPos ? state.positiveTags : state.negativeTags;
    const container = isPos ? posChipsBox : negChipsBox;
    const badge = isPos ? posCountBadge : negCountBadge;
    const rawTextarea = isPos ? posRawText : negRawText;

    const activeCount = tags.filter(t => !t.disabled).length;
    badge.textContent = `${activeCount} / ${tags.length} 词`;

    rawTextarea.value = buildPromptText(tags);

    if (tags.length === 0) {
      container.innerHTML = isPos
        ? '<div class="empty-tip">点击下方分类或使用搜索栏添加提示词</div>'
        : '<div class="empty-tip">未添加反向提示词 (可点击右上角 🛡️ 一键填入通用负面)</div>';
      return;
    }

    container.innerHTML = '';
    tags.forEach((item, index) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip' + (item.disabled ? ' disabled' : '');

      const isStarred = state.starredTags.has(item.tag.toLowerCase());

      chip.innerHTML = `
        <div class="tag-chip-info" title="${item.tag}">
          <span class="chip-en">${escapeHtml(item.tag)}</span>
          ${item.cn ? `<span class="chip-cn">${escapeHtml(item.cn)}</span>` : ''}
        </div>
        <span class="chip-weight" title="点击调整权重">${Number(item.weight).toFixed(2).replace(/\.?0+$/, '')}</span>
        <div class="chip-btns">
          <button class="chip-btn btn-step-dec" title="降权 -0.1">-</button>
          <button class="chip-btn btn-step-inc" title="加权 +0.1">+</button>
          <button class="chip-btn btn-toggle-disable" title="${item.disabled ? '启用' : '禁用'}">${item.disabled ? '👁️‍🗨️' : '👁️'}</button>
          <button class="chip-btn btn-star" title="收藏">${isStarred ? '★' : '☆'}</button>
          <button class="chip-btn chip-remove" title="删除">✕</button>
        </div>
      `;

      // Event handlers on chip
      chip.querySelector('.btn-step-inc').addEventListener('click', (e) => {
        e.stopPropagation();
        item.weight = Number((item.weight + state.weightStep).toFixed(2));
        renderPrompts();
      });

      chip.querySelector('.btn-step-dec').addEventListener('click', (e) => {
        e.stopPropagation();
        item.weight = Math.max(0.1, Number((item.weight - state.weightStep).toFixed(2)));
        renderPrompts();
      });

      chip.querySelector('.chip-weight').addEventListener('click', (e) => {
        e.stopPropagation();
        const input = prompt(`修改 "${item.tag}" 的权重:`, item.weight);
        if (input !== null) {
          const val = parseFloat(input);
          if (!isNaN(val) && val >= 0.1 && val <= 5.0) {
            item.weight = Number(val.toFixed(2));
            renderPrompts();
          }
        }
      });

      chip.querySelector('.btn-toggle-disable').addEventListener('click', (e) => {
        e.stopPropagation();
        item.disabled = !item.disabled;
        renderPrompts();
      });

      chip.querySelector('.btn-star').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStarTag(item.tag);
        renderPrompts();
      });

      chip.querySelector('.chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        tags.splice(index, 1);
        renderPrompts();
      });

      container.appendChild(chip);
    });
  }

  function addTag(type, tag, cn, weight = 1.0) {
    const isPos = (type === 'pos');
    const tags = isPos ? state.positiveTags : state.negativeTags;
    const cleanTag = tag.trim();

    // Check if tag already exists
    const existing = tags.find(t => t.tag.toLowerCase() === cleanTag.toLowerCase());
    if (existing) {
      if (existing.disabled) {
        existing.disabled = false;
        showToast(`已重新启用: ${cleanTag}`);
      } else {
        existing.weight = Number((existing.weight + 0.1).toFixed(2));
        showToast(`权重增加: ${cleanTag} (${existing.weight})`);
      }
      renderPrompts();
      return;
    }

    const cnFinal = cn || enToCnMap.get(cleanTag.toLowerCase()) || '';
    tags.push({
      id: 'tag_' + Math.random().toString(36).substr(2, 9),
      tag: cleanTag,
      cn: cnFinal,
      weight: Number(weight.toFixed(2)),
      disabled: false
    });

    renderPrompts();
    showToast(`已添加到${isPos ? '正向' : '负向'}: ${cleanTag}`);
  }

  function toggleStarTag(tag) {
    const key = tag.toLowerCase();
    if (state.starredTags.has(key)) {
      state.starredTags.delete(key);
      showToast(`已取消收藏: ${tag}`);
    } else {
      state.starredTags.add(key);
      showToast(`已收藏: ${tag}`);
    }
    persistStarred();
    renderStarredTags();
  }

  // --- TagComplete Autocomplete Engine ---
  let searchDebounceTimer = null;

  function handleSearchInput() {
    const q = searchInput.value.trim();
    if (!q) {
      autocompleteList.classList.remove('active');
      autocompleteList.innerHTML = '';
      searchClearBtn.style.display = 'none';
      return;
    }

    searchClearBtn.style.display = 'block';

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(q);
    }, 40);
  }

  function performSearch(query) {
    const qLower = query.toLowerCase();
    const isSlashAlias = qLower.startsWith('/');

    const results = [];
    let count = 0;
    const maxResults = 30;

    for (let i = 0; i < dictionaryData.length; i++) {
      const item = dictionaryData[i];
      // [tag, cn, type, count, aliases, cat, neg]
      const tag = item[0];
      const cn = item[1];
      const tp = item[2];
      const postCount = item[3];
      const aliases = item[4];
      const cat = item[5];
      const neg = item[6];

      const tagLower = tag.toLowerCase();
      let matched = false;
      let matchAlias = '';

      if (isSlashAlias) {
        if (aliases && aliases.toLowerCase().includes(qLower)) {
          matched = true;
          matchAlias = qLower;
        }
      } else {
        if (tagLower.startsWith(qLower)) {
          matched = true;
        } else if (cn && cn.toLowerCase().includes(qLower)) {
          matched = true;
        } else if (aliases && aliases.toLowerCase().split(',').some(a => a.trim().startsWith(qLower))) {
          matched = true;
          matchAlias = qLower;
        } else if (tagLower.includes(qLower)) {
          matched = true;
        }
      }

      if (matched) {
        results.push({ tag, cn, type: tp, postCount, aliases, cat, neg, matchAlias });
        count++;
        if (count >= maxResults) break;
      }
    }

    renderAutocompleteResults(results);
  }

  function renderAutocompleteResults(results) {
    if (results.length === 0) {
      autocompleteList.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-dim); font-size:13px;">无匹配标签，按回车可直接添加为自定义标签</div>';
      autocompleteList.classList.add('active');
      return;
    }

    autocompleteList.innerHTML = '';
    results.forEach(item => {
      const row = document.createElement('div');
      row.className = 'suggestion-item';

      row.innerHTML = `
        <div class="sugg-info">
          <div class="sugg-main">
            <span class="sugg-tag">${escapeHtml(item.tag)}</span>
            ${item.cn ? `<span class="sugg-cn">${escapeHtml(item.cn)}</span>` : ''}
          </div>
          <div class="sugg-sub">
            ${getTypeBadge(item.type)}
            <span>🔥 ${formatCount(item.postCount)}</span>
            ${item.cat ? `<span>📁 ${escapeHtml(item.cat)}</span>` : ''}
            ${item.aliases ? `<span style="color:#a78bfa;">别名: ${escapeHtml(item.aliases)}</span>` : ''}
          </div>
        </div>
        <div class="sugg-actions">
          <button class="btn-add-pos">+ 正向</button>
          <button class="btn-add-neg">- 负向</button>
        </div>
      `;

      row.querySelector('.btn-add-pos').addEventListener('click', (e) => {
        e.stopPropagation();
        addTag('pos', item.tag, item.cn);
        closeAutocomplete();
      });

      row.querySelector('.btn-add-neg').addEventListener('click', (e) => {
        e.stopPropagation();
        addTag('neg', item.tag, item.cn);
        closeAutocomplete();
      });

      // Clicking row defaults to current prompt
      row.addEventListener('click', () => {
        const targetType = (item.neg === 1) ? 'neg' : state.currentFocusPrompt;
        addTag(targetType, item.tag, item.cn);
        closeAutocomplete();
      });

      autocompleteList.appendChild(row);
    });

    autocompleteList.classList.add('active');
  }

  function closeAutocomplete() {
    autocompleteList.classList.remove('active');
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
  }

  // --- Category Browser (Prompt All in One) ---
  function renderCategoryBrowser() {
    categoryTabs.innerHTML = '';
    if (!categoriesData || categoriesData.length === 0) return;

    categoriesData.forEach((cat, idx) => {
      const btn = document.createElement('button');
      btn.className = 'cat-nav-btn' + (idx === state.activeCategoryIndex ? ' active' : '');
      btn.innerHTML = `<span>${cat.icon || '🏷️'}</span><span>${cat.name}</span>`;
      btn.addEventListener('click', () => {
        state.activeCategoryIndex = idx;
        renderCategoryBrowser();
      });
      categoryTabs.appendChild(btn);
    });

    // Render active category groups
    categoryGroups.innerHTML = '';
    const activeCat = categoriesData[state.activeCategoryIndex];
    if (!activeCat) return;

    const isNegativeCat = (activeCat.name === '反向提示词');

    activeCat.groups.forEach(group => {
      const section = document.createElement('div');
      section.className = 'group-section';

      const colorBar = group.color ? group.color : '#6366f1';

      section.innerHTML = `
        <div class="group-header">
          <div class="group-name">
            <div class="group-name-bar" style="background:${colorBar};"></div>
            <span>${group.name}</span>
            <span style="font-size:11px; color:var(--text-dim);">(${group.tags.length})</span>
          </div>
        </div>
        <div class="group-tags-grid"></div>
      `;

      const grid = section.querySelector('.group-tags-grid');

      group.tags.forEach(t => {
        const tagEl = document.createElement('div');
        tagEl.className = 'browser-tag';
        tagEl.innerHTML = `
          <span class="browser-tag-cn">${escapeHtml(t.cn)}</span>
          <span class="browser-tag-en">${escapeHtml(t.en)}</span>
        `;

        tagEl.addEventListener('click', () => {
          const targetType = isNegativeCat ? 'neg' : state.currentFocusPrompt;
          addTag(targetType, t.en, t.cn);
        });

        grid.appendChild(tagEl);
      });

      categoryGroups.appendChild(section);
    });
  }

  // --- Danbooru Dictionary Explorer ---
  function renderDictionaryExplorer() {
    dictResultsContainer.innerHTML = '';
    const filter = state.dictFilterType;

    let shown = 0;
    const maxShow = 60;

    for (let i = 0; i < dictionaryData.length; i++) {
      const item = dictionaryData[i];
      // [tag, cn, type, count, aliases, cat, neg]
      const tp = item[2];

      if (filter !== 'all' && tp !== parseInt(filter)) {
        continue;
      }

      const row = document.createElement('div');
      row.className = 'dict-row';

      row.innerHTML = `
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:#fff; font-size:13px;">${escapeHtml(item[0])}</span>
            ${item[1] ? `<span class="sugg-cn">${escapeHtml(item[1])}</span>` : ''}
          </div>
          <div style="font-size:11px; color:var(--text-dim); margin-top:3px; display:flex; gap:8px; align-items:center;">
            ${getTypeBadge(tp)}
            <span>🔥 ${formatCount(item[3])}</span>
            ${item[5] ? `<span>📁 ${escapeHtml(item[5])}</span>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn-add-pos">+ 正向</button>
          <button class="btn-add-neg">- 负向</button>
        </div>
      `;

      row.querySelector('.btn-add-pos').addEventListener('click', () => {
        addTag('pos', item[0], item[1]);
      });
      row.querySelector('.btn-add-neg').addEventListener('click', () => {
        addTag('neg', item[0], item[1]);
      });

      dictResultsContainer.appendChild(row);
      shown++;
      if (shown >= maxShow) break;
    }
  }

  // --- Presets & Starred Tags ---
  function renderPresets() {
    presetsContainer.innerHTML = '';
    const allPresets = [...presetsData, ...state.userPresets];

    if (allPresets.length === 0) {
      presetsContainer.innerHTML = '<div class="empty-tip">暂无预设</div>';
      return;
    }

    allPresets.forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'preset-item';

      const posPreview = p.positive ? p.positive.map(t => t.tag).join(', ') : '';
      const negPreview = p.negative ? p.negative.map(t => t.tag).join(', ') : '';

      const isUserPreset = index >= presetsData.length;

      card.innerHTML = `
        <div class="preset-header">
          <span class="preset-name">${escapeHtml(p.name)}</span>
          <span class="preset-badge">${escapeHtml(p.category || '预设')}</span>
        </div>
        <div class="preset-preview">
          ${posPreview ? `<b>正向:</b> ${escapeHtml(posPreview)}<br>` : ''}
          ${negPreview ? `<b>负向:</b> ${escapeHtml(negPreview)}` : ''}
        </div>
        <div class="preset-actions">
          <button class="btn-sm btn-primary btn-apply-preset">⚡ 应用预设</button>
          <button class="btn-sm btn-append-preset">➕ 追加到现有</button>
          ${isUserPreset ? `<button class="btn-sm btn-del-preset" style="color:#f87171;">删除</button>` : ''}
        </div>
      `;

      card.querySelector('.btn-apply-preset').addEventListener('click', () => {
        if (p.positive) {
          state.positiveTags = p.positive.map(t => ({
            id: 'tag_' + Math.random().toString(36).substr(2, 9),
            tag: t.tag,
            cn: t.cn || enToCnMap.get(t.tag.toLowerCase()) || '',
            weight: t.weight || 1.0,
            disabled: false
          }));
        }
        if (p.negative) {
          state.negativeTags = p.negative.map(t => ({
            id: 'tag_' + Math.random().toString(36).substr(2, 9),
            tag: t.tag,
            cn: t.cn || enToCnMap.get(t.tag.toLowerCase()) || '',
            weight: t.weight || 1.0,
            disabled: false
          }));
        }
        renderPrompts();
        switchTab('editor');
        showToast(`已应用预设: ${p.name}`);
      });

      card.querySelector('.btn-append-preset').addEventListener('click', () => {
        if (p.positive) {
          p.positive.forEach(t => addTag('pos', t.tag, t.cn, t.weight || 1.0));
        }
        if (p.negative) {
          p.negative.forEach(t => addTag('neg', t.tag, t.cn, t.weight || 1.0));
        }
        renderPrompts();
        switchTab('editor');
        showToast(`已追加预设: ${p.name}`);
      });

      if (isUserPreset) {
        card.querySelector('.btn-del-preset').addEventListener('click', () => {
          if (confirm(`确定删除自定义预设 "${p.name}" 吗？`)) {
            const userIndex = index - presetsData.length;
            state.userPresets.splice(userIndex, 1);
            persistPresets();
            renderPresets();
            showToast('已删除预设');
          }
        });
      }

      presetsContainer.appendChild(card);
    });
  }

  function renderStarredTags() {
    starredTagsContainer.innerHTML = '';
    if (state.starredTags.size === 0) {
      starredTagsContainer.innerHTML = '<div style="color:var(--text-dim); font-size:12px; font-style:italic;">暂无收藏标签，在标签芯片上点击 ☆ 即可收藏</div>';
      return;
    }

    state.starredTags.forEach(tagKey => {
      const cn = enToCnMap.get(tagKey) || '';
      const chip = document.createElement('div');
      chip.className = 'browser-tag';
      chip.innerHTML = `
        <span class="browser-tag-cn">${escapeHtml(cn || tagKey)}</span>
        <span class="browser-tag-en">${escapeHtml(tagKey)}</span>
      `;

      chip.addEventListener('click', () => {
        addTag(state.currentFocusPrompt, tagKey, cn);
      });

      starredTagsContainer.appendChild(chip);
    });
  }

  // --- Navigation & Tab Switching ---
  function switchTab(tabId) {
    state.activeTab = tabId;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById(`page-${tabId}`);
    const nav = document.querySelector(`.nav-item[data-tab="${tabId}"]`);

    if (page) page.classList.add('active');
    if (nav) nav.classList.add('active');

    if (tabId === 'categories') {
      renderCategoryBrowser();
    } else if (tabId === 'dictionary') {
      renderDictionaryExplorer();
    } else if (tabId === 'favorites') {
      renderPresets();
      renderStarredTags();
    }
  }

  // --- Helper: Escape HTML ---
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return m;
      }
    });
  }

  // --- Modal Dialog ---
  const presetModal = document.getElementById('preset-modal');
  const presetTitleInput = document.getElementById('preset-title-input');
  const presetCatInput = document.getElementById('preset-cat-input');

  function openPresetModal() {
    presetTitleInput.value = '';
    presetCatInput.value = '我的收藏';
    presetModal.classList.add('active');
    presetTitleInput.focus();
  }

  function closePresetModal() {
    presetModal.classList.remove('active');
  }

  function saveCurrentAsPreset() {
    const title = presetTitleInput.value.trim();
    if (!title) {
      showToast('请输入预设名称');
      return;
    }

    const category = presetCatInput.value.trim() || '我的收藏';

    const newPreset = {
      id: 'custom_' + Date.now(),
      name: title,
      category: category,
      positive: state.positiveTags.filter(t => !t.disabled).map(t => ({
        tag: t.tag,
        weight: t.weight,
        cn: t.cn
      })),
      negative: state.negativeTags.filter(t => !t.disabled).map(t => ({
        tag: t.tag,
        weight: t.weight,
        cn: t.cn
      }))
    };

    state.userPresets.push(newPreset);
    persistPresets();
    closePresetModal();
    showToast(`已成功保存预设: ${title}`);
  }

  // --- Universal Negative Quick Insert ---
  function insertUniversalNegative() {
    const defaultNegatives = [
      { tag: 'worst quality', cn: '最差质量', weight: 1.4 },
      { tag: 'low quality', cn: '低质量', weight: 1.4 },
      { tag: 'bad anatomy', cn: '糟糕的人体', weight: 1.3 },
      { tag: 'bad hands', cn: '糟糕的手', weight: 1.3 },
      { tag: 'missing fingers', cn: '缺失手指', weight: 1.3 },
      { tag: 'extra fingers', cn: '多余手指', weight: 1.3 },
      { tag: 'poorly drawn hands', cn: '画得很差的手', weight: 1.2 },
      { tag: 'mutated hands', cn: '变异手部', weight: 1.3 },
      { tag: 'ugly', cn: '丑陋', weight: 1.2 },
      { tag: 'blurry', cn: '模糊', weight: 1.2 },
      { tag: 'watermark', cn: '水印', weight: 1.1 },
      { tag: 'signature', cn: '签名', weight: 1.1 },
      { tag: 'text', cn: '文字', weight: 1.1 }
    ];

    defaultNegatives.forEach(t => {
      addTag('neg', t.tag, t.cn, t.weight);
    });

    showToast('已填入常用通用负面词');
  }

  // --- Batch Operations & Formatting ---
  function formatAllPrompts() {
    // Deduplicate positive
    const seenPos = new Set();
    state.positiveTags = state.positiveTags.filter(t => {
      const k = t.tag.toLowerCase();
      if (seenPos.has(k)) return false;
      seenPos.add(k);
      return true;
    });

    // Deduplicate negative
    const seenNeg = new Set();
    state.negativeTags = state.negativeTags.filter(t => {
      const k = t.tag.toLowerCase();
      if (seenNeg.has(k)) return false;
      seenNeg.add(k);
      return true;
    });

    renderPrompts();
    showToast('已完成去重与格式化');
  }

  function batchAdjustPos(delta) {
    state.positiveTags.forEach(t => {
      t.weight = Math.max(0.1, Number((t.weight + delta).toFixed(2)));
    });
    renderPrompts();
    showToast(`正向提示词权重统一 ${delta > 0 ? '+' : ''}${delta}`);
  }

  function resetAllWeights() {
    state.positiveTags.forEach(t => t.weight = 1.0);
    state.negativeTags.forEach(t => t.weight = 1.0);
    renderPrompts();
    showToast('已重置所有提示词权重为 1.0');
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = searchInput.value.trim();
        if (val) {
          addTag(state.currentFocusPrompt, val, '');
          closeAutocomplete();
        }
      } else if (e.key === 'Escape') {
        closeAutocomplete();
      }
    });

    searchClearBtn.addEventListener('click', closeAutocomplete);

    // Hide dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        autocompleteList.classList.remove('active');
      }
    });

    // Copy buttons
    document.getElementById('btn-copy-pos').addEventListener('click', () => {
      copyText(buildPromptText(state.positiveTags), '正向提示词');
    });

    document.getElementById('btn-copy-neg').addEventListener('click', () => {
      copyText(buildPromptText(state.negativeTags), '反向提示词');
    });

    document.getElementById('btn-copy-all').addEventListener('click', () => {
      const pos = buildPromptText(state.positiveTags);
      const neg = buildPromptText(state.negativeTags);
      const combined = `${pos}\nNegative prompt: ${neg}`;
      copyText(combined, '完整提示词 (Positive + Negative)');
    });

    // Clear buttons
    document.getElementById('btn-clear-pos').addEventListener('click', () => {
      if (state.positiveTags.length > 0 && confirm('清空正向提示词？')) {
        state.positiveTags = [];
        renderPrompts();
      }
    });

    document.getElementById('btn-clear-neg').addEventListener('click', () => {
      if (state.negativeTags.length > 0 && confirm('清空负向提示词？')) {
        state.negativeTags = [];
        renderPrompts();
      }
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
      if ((state.positiveTags.length > 0 || state.negativeTags.length > 0) && confirm('清空正向和负向全部提示词？')) {
        state.positiveTags = [];
        state.negativeTags = [];
        renderPrompts();
      }
    });

    // Quick Negative button in header
    document.getElementById('btn-quick-negative').addEventListener('click', insertUniversalNegative);

    // Raw mode toggles
    document.getElementById('btn-toggle-pos-mode').addEventListener('click', () => {
      state.posRawMode = !state.posRawMode;
      posChipsBox.style.display = state.posRawMode ? 'none' : 'flex';
      posRawText.style.display = state.posRawMode ? 'block' : 'none';
      document.getElementById('btn-toggle-pos-mode').textContent = state.posRawMode ? '🏷️ 标签卡片' : '📝 纯文本';
      if (!state.posRawMode) {
        state.positiveTags = parseRawPromptText(posRawText.value);
        renderPrompts();
      }
    });

    document.getElementById('btn-toggle-neg-mode').addEventListener('click', () => {
      state.negRawMode = !state.negRawMode;
      negChipsBox.style.display = state.negRawMode ? 'none' : 'flex';
      negRawText.style.display = state.negRawMode ? 'block' : 'none';
      document.getElementById('btn-toggle-neg-mode').textContent = state.negRawMode ? '🏷️ 标签卡片' : '📝 纯文本';
      if (!state.negRawMode) {
        state.negativeTags = parseRawPromptText(negRawText.value);
        renderPrompts();
      }
    });

    posChipsBox.addEventListener('click', () => { state.currentFocusPrompt = 'pos'; });
    negChipsBox.addEventListener('click', () => { state.currentFocusPrompt = 'neg'; });

    // Presets modal
    document.getElementById('btn-save-as-preset').addEventListener('click', openPresetModal);
    document.getElementById('btn-preset-cancel').addEventListener('click', closePresetModal);
    document.getElementById('btn-preset-confirm').addEventListener('click', saveCurrentAsPreset);

    // Quick tools
    document.getElementById('btn-format-all').addEventListener('click', formatAllPrompts);
    document.getElementById('btn-batch-inc-pos').addEventListener('click', () => batchAdjustPos(0.1));
    document.getElementById('btn-batch-dec-pos').addEventListener('click', () => batchAdjustPos(-0.1));
    document.getElementById('btn-reset-weights').addEventListener('click', resetAllWeights);

    // Export / Import
    document.getElementById('btn-export-presets').addEventListener('click', () => {
      const data = {
        userPresets: state.userPresets,
        starredTags: Array.from(state.starredTags)
      };
      const jsonStr = JSON.stringify(data, null, 2);
      copyText(jsonStr, '收藏与预设备份 JSON');
    });

    document.getElementById('btn-import-presets').addEventListener('click', () => {
      const input = prompt('请粘贴备份的预设与收藏 JSON:');
      if (input) {
        try {
          const parsed = JSON.parse(input);
          if (parsed.userPresets && Array.isArray(parsed.userPresets)) {
            state.userPresets = [...state.userPresets, ...parsed.userPresets];
            persistPresets();
          }
          if (parsed.starredTags && Array.isArray(parsed.starredTags)) {
            parsed.starredTags.forEach(t => state.starredTags.add(t));
            persistStarred();
          }
          renderPresets();
          renderStarredTags();
          showToast('导入成功');
        } catch(e) {
          showToast('JSON 格式有误，导入失败');
        }
      }
    });

    // Dictionary type filter pills
    document.querySelectorAll('.dict-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.dict-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.dictFilterType = btn.getAttribute('data-type');
        renderDictionaryExplorer();
      });
    });

    // Settings Radio buttons
    document.querySelectorAll('input[name="weight-format"]').forEach(r => {
      r.addEventListener('change', (e) => {
        state.weightFormat = e.target.value;
        localStorage.setItem('sd_weight_fmt', state.weightFormat);
        renderPrompts();
      });
    });

    document.querySelectorAll('input[name="weight-step"]').forEach(r => {
      r.addEventListener('change', (e) => {
        state.weightStep = parseFloat(e.target.value);
        localStorage.setItem('sd_weight_step', state.weightStep.toString());
      });
    });

    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      });
    });
  }

  // --- Initialization ---
  async function init() {
    loadPersistedState();
    setupEventListeners();

    try {
      dictStatusText.textContent = '加载词典数据中...';

      const [resCat, resDict, resPresets] = await Promise.all([
        fetch('data/categories.json').then(r => r.json()),
        fetch('data/dictionary.json').then(r => r.json()),
        fetch('data/presets.json').then(r => r.json())
      ]);

      categoriesData = resCat;
      dictionaryData = resDict;
      presetsData = resPresets;

      // Build quick lookup maps
      dictionaryData.forEach(item => {
        // [tag, cn, type, count, aliases, cat, neg]
        const tag = item[0].toLowerCase();
        if (item[1]) enToCnMap.set(tag, item[1]);
        if (item[5]) enToCatMap.set(tag, item[5]);
      });

      dictStatusText.textContent = `已就绪 (${dictionaryData.length.toLocaleString()} 词条 / 11 核心分类)`;

      renderPrompts();
      renderCategoryBrowser();
      renderPresets();
      renderStarredTags();

    } catch (err) {
      console.error('Initialization error:', err);
      dictStatusText.textContent = '词典加载失败';
      showToast('数据文件读取异常，请确认 assets 目录完整');
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
