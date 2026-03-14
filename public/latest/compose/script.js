function parseMarkup(text) {
  if (!text || typeof text !== 'string') return '';

  function esc(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function slugify(s) {
    return s
      .toLowerCase()
      .replace(/[*_~`[\]^]/g, '')   

      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .trim();
  }

  const _store = [];
  function protect(html) {
    _store.push(html);
    return `\x02${_store.length - 1}\x03`;
  }
  function restore(s) {

    let out = s;
    let prev;
    do {
      prev = out;
      out = out.replace(/\x02(\d+)\x03/g, (_, i) => _store[+i]);
    } while (out !== prev);
    return out;
  }

  const escaped = esc(text);
  const rawLines = escaped.split('\n');

  const footnoteDefs = new Map();
  const srcLines = rawLines.filter(line => {
    const m = line.match(/^\[\^([^\]]+)\]:\s+(.*)/);
    if (m) { footnoteDefs.set(m[1], m[2]); return false; }
    return true;
  });

  function inline(s) {

    s = s.replace(/`([^`\n]+)`/g, (_, c) =>
      protect(`<code class="inline-code">${c}</code>`)
    );

    s = s.replace(/!\[([^\]]*)\]\(([^)\s"]+)(?:\s"([^"]*)")?\)/g,
      (_, alt, src, title) =>
        protect(`<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ''} loading="lazy">`)
    );

    s = s.replace(/\*\*\*(.+?)\*\*\*/gs, '<strong><em>$1</em></strong>');
    s = s.replace(/\*\*(.+?)\*\*/gs,      '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/gs,           '<em>$1</em>');
    s = s.replace(/(\+\+|__)(.+?)\1/gs, '<ins>$2</ins>');
    s = s.replace(/~~(.+?)~~/gs,           '<del>$1</del>');
    s = s.replace(/==(.+?)==/gs,           '<mark>$1</mark>');
    s = s.replace(/\^(.+?)\^/g,           '<sup>$1</sup>');
    s = s.replace(/~(.+?)~/g,             '<sub>$1</sub>');

    s = s.replace(/\[\[([^\]\n]+)\]\]/g, (_, key) =>
      protect(key.split('+').map(k => `<kbd>${k.trim()}</kbd>`).join('<span class="kbd-plus">+</span>'))
    );

    s = s.replace(/\[([^\]\n]*)\]\(([^)\s"]+)(?:\s"([^"]*)")?\)/g,
      (_, text, href, title) =>
        `<a href="${href}"${title ? ` title="${title}"` : ''} target="_blank" rel="noopener noreferrer">${text}</a>`
    );

    s = s.replace(/(?<![="'(])https?:\/\/[^\s<>"')]+/g,
      url => protect(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
    );

    s = s.replace(/\[\^([^\]\n]+)\]/g, (_, id) =>
      `<sup class="footnote-ref"><a href="#fn-${id}" id="fnref-${id}">[${id}]</a></sup>`
    );

    s = s.replace(/  +\n/g, '<br>\n');

    return restore(s);
  }

  function renderList(lines) {

    const items = lines.flatMap(line => {
      const ul = line.match(/^(\s*)[-*+]\s+(\[[ xX]\]\s+)?([\s\S]*)/);
      const ol = line.match(/^(\s*)\d+[.)]\s+([\s\S]*)/);
      if (ul) return [{ tag: 'ul', depth: ul[1].length, checked: ul[2] ? /[xX]/.test(ul[2]) : null, content: ul[3] }];
      if (ol) return [{ tag: 'ol', depth: ol[1].length, checked: null, content: ol[2] }];
      return [];
    });

    if (!items.length) return '';

    function build(arr, startDepth) {
      if (!arr.length) return '';
      const tag = arr[0].tag;
      const isTask = arr[0].checked !== null;
      let html = `<${tag}${isTask ? ' class="task-list"' : ''}>`;
      let j = 0;
      while (j < arr.length) {
        const item = arr[j];
        let content = inline(item.content);
        if (item.checked !== null) {
          content = `<input type="checkbox"${item.checked ? ' checked' : ''} disabled aria-label="Task item"> ` + content;
        }
        j++;

        const children = [];
        while (j < arr.length && arr[j].depth > item.depth) {
          children.push(arr[j]);
          j++;
        }
        const nested = children.length ? build(children, children[0].depth) : '';
        const classes = item.checked !== null ? ` class="task-item${item.checked ? ' task-done' : ''}"` : '';
        html += `<li${classes}>${content}${nested}</li>`;
      }
      html += `</${tag}>`;
      return html;
    }

    return build(items, items[0].depth);
  }

  function renderTable(lines) {

    const parseRow = l => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

    const header = parseRow(lines[0]);
    const sepRow  = lines[1] ? parseRow(lines[1]) : [];
    const body    = lines.slice(2);

    const align = sepRow.map(s => {
      if (/^:-+:$/.test(s)) return 'center';
      if (/^-+:$/.test(s))  return 'right';
      if (/^:-+$/.test(s))  return 'left';
      return null;
    });

    const style = i => align[i] ? ` style="text-align:${align[i]}"` : '';

    const thead = `<thead><tr>${header.map((c, i) =>
      `<th${style(i)}>${inline(c)}</th>`).join('')}</tr></thead>`;

    const tbody = body.length
      ? `<tbody>${body.map(row =>
          `<tr>${parseRow(row).map((c, i) =>
            `<td${style(i)}>${inline(c)}</td>`).join('')}</tr>`
        ).join('')}</tbody>`
      : '';

    return `<table>${thead}${tbody}</table>`;
  }

  function renderInner(innerText) {
    if (!innerText.trim()) return '';
    const innerLines = innerText.split('\n');
    const out = [];
    let i = 0;

    while (i < innerLines.length) {
      const line = innerLines[i];
      if (!line.trim()) { i++; continue; }

      if (line.trim().startsWith('```')) {
        const lang = (line.trim().match(/^```(\w*)/) || [])[1] || '';
        i++;
        const cLines = [];
        while (i < innerLines.length && !innerLines[i].trim().startsWith('```')) {
          cLines.push(innerLines[i]); i++;
        }
        i++;
        out.push(protect(`<pre class="code-block"${lang ? ` data-lang="${lang}"` : ''}><code>${cLines.join('\n')}</code></pre>`));
        continue;
      }

      if (/^\s*[-*+]\s/.test(line) || /^\s*\d+[.)]\s/.test(line)) {
        const lLines = [];
        while (i < innerLines.length &&
               (/^\s*[-*+]\s/.test(innerLines[i]) || /^\s*\d+[.)]\s/.test(innerLines[i]) || /^\s{2,}\S/.test(innerLines[i]))) {
          lLines.push(innerLines[i]); i++;
        }
        out.push(renderList(lLines));
        continue;
      }

      if (line.startsWith('&gt;')) {
        const qLines = [];
        while (i < innerLines.length && innerLines[i].startsWith('&gt;')) {
          qLines.push(innerLines[i].replace(/^&gt;\s?/, '')); i++;
        }
        out.push(`<blockquote>${renderInner(qLines.join('\n'))}</blockquote>`);
        continue;
      }

      const pLines = [];
      while (i < innerLines.length && innerLines[i].trim() &&
             !innerLines[i].trim().startsWith('```') &&
             !innerLines[i].startsWith('&gt;') &&
             !/^\s*[-*+]\s/.test(innerLines[i]) &&
             !/^\s*\d+[.)]\s/.test(innerLines[i])) {
        pLines.push(innerLines[i]); i++;
      }
      if (pLines.length) out.push(`<p>${inline(pLines.join('\n').replace(/\n/g, ' '))}</p>`);
    }

    return out.join('\n');
  }

  const tokens   = [];   

  const headings = [];   

  const ADMON_TYPES = new Set(['info', 'tip', 'warning', 'danger', 'note', 'success', 'caution']);

  let idx = 0;

  while (idx < srcLines.length) {
    const line    = srcLines[idx];
    const trimmed = line.trim();

    if (!trimmed) { idx++; continue; }

    if (trimmed.startsWith('```')) {
      const lang = (trimmed.match(/^```(\w*)/) || [])[1] || '';
      idx++;
      const codeLines = [];
      while (idx < srcLines.length && !srcLines[idx].trim().startsWith('```')) {
        codeLines.push(srcLines[idx]); idx++;
      }
      idx++; 

      tokens.push({
        type: 'raw',
        html: protect(
          `<pre class="code-block"${lang ? ` data-lang="${lang}"` : ''}><code>${codeLines.join('\n')}</code></pre>`
        )
      });
      continue;
    }

    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      const level   = hm[1].length;
      const content = hm[2];
      const id      = slugify(content);
      headings.push({ level, content, id });
      tokens.push({ type: 'heading', level, content, id });
      idx++;
      continue;
    }

    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(trimmed)) {
      tokens.push({ type: 'hr' });
      idx++;
      continue;
    }

    if (trimmed === '[[TOC]]') {
      tokens.push({ type: 'toc' });
      idx++;
      continue;
    }

    const adm = trimmed.match(/^:::(info|tip|warning|danger|note|success|caution|details)(?:\[([^\]]*)\])?/);
    if (adm) {
      const adType = adm[1];
      const title  = adm[2] || '';
      idx++;
      const bodyLines = [];
      while (idx < srcLines.length && srcLines[idx].trim() !== ':::') {
        bodyLines.push(srcLines[idx]); idx++;
      }
      idx++; 

      tokens.push({ type: adType === 'details' ? 'details' : 'admonition', adType, title, body: bodyLines.join('\n') });
      continue;
    }

    if (line.startsWith('&gt;')) {
      const qLines = [];
      while (idx < srcLines.length && srcLines[idx].startsWith('&gt;')) {
        qLines.push(srcLines[idx].replace(/^&gt;\s?/, '')); idx++;
      }
      tokens.push({ type: 'blockquote', body: qLines.join('\n') });
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (idx < srcLines.length && srcLines[idx].trim().startsWith('|')) {
        tableLines.push(srcLines[idx]); idx++;
      }
      tokens.push({ type: 'table', lines: tableLines });
      continue;
    }

    if (/^\s*[-*+]\s/.test(line) || /^\s*\d+[.)]\s/.test(line)) {
      const listLines = [];
      while (idx < srcLines.length) {
        const l = srcLines[idx];
        if (/^\s*[-*+]\s/.test(l) || /^\s*\d+[.)]\s/.test(l) || (listLines.length && /^\s{2,}\S/.test(l))) {
          listLines.push(l); idx++;
        } else break;
      }
      tokens.push({ type: 'list', lines: listLines });
      continue;
    }

    if (idx + 1 < srcLines.length && srcLines[idx + 1].match(/^:\s+/)) {
      const dlItems = [];
      while (idx < srcLines.length && srcLines[idx + 1]?.match(/^:\s+/)) {
        const term = srcLines[idx]; idx++;
        const defs = [];
        while (idx < srcLines.length && srcLines[idx].match(/^:\s+/)) {
          defs.push(srcLines[idx].replace(/^:\s+/, '')); idx++;
        }
        dlItems.push({ term, defs });
      }
      tokens.push({ type: 'dl', items: dlItems });
      continue;
    }

    const paraLines = [];
    while (idx < srcLines.length) {
      const l  = srcLines[idx];
      const tr = l.trim();
      if (!tr) break;                                

      if (/^#{1,6}\s/.test(l))        break;         

      if (tr.startsWith('|'))         break;         

      if (tr.startsWith('&gt;'))      break;         

      if (tr.startsWith(':::'))       break;         

      if (tr.startsWith('```'))       break;         

      if (/^(\*{3,}|-{3,}|_{3,})$/.test(tr)) break; 

      if (tr === '[[TOC]]')           break;
      if (/^\s*[-*+]\s/.test(l))      break;         

      if (/^\s*\d+[.)]\s/.test(l))    break;         

      paraLines.push(l); idx++;
    }
    if (paraLines.length) tokens.push({ type: 'paragraph', content: paraLines.join('\n') });
  }

  const ADMON_META = {
    info:    { icon: 'ℹ',  label: 'Info'    },
    tip:     { icon: '💡', label: 'Tip'     },
    note:    { icon: '📝', label: 'Note'    },
    warning: { icon: '⚠',  label: 'Warning' },
    danger:  { icon: '🚫', label: 'Danger'  },
    success: { icon: '✅', label: 'Success' },
    caution: { icon: '🔶', label: 'Caution' },
  };

  function renderToken(token) {
    switch (token.type) {

      case 'raw':
        return restore(token.html);

      case 'heading': {
        const rendered = inline(token.content);
        return (
          `<h${token.level} id="${token.id}">` +
            `<a class="heading-anchor" href="#${token.id}" aria-hidden="true">#</a>` +
            rendered +
          `</h${token.level}>`
        );
      }

      case 'hr':
        return '<hr>';

      case 'toc': {
        if (!headings.length) return '';
        const items = headings.map(h =>
          `<li class="toc-item toc-h${h.level}" style="padding-left:${(h.level - 1) * 1.2}em">` +
            `<a href="#${h.id}">${esc(h.content)}</a>` +
          `</li>`
        ).join('');
        return (
          `<nav class="toc" aria-label="Table of Contents">` +
            `<p class="toc-title">Table of Contents</p>` +
            `<ul>${items}</ul>` +
          `</nav>`
        );
      }

      case 'blockquote':
        return `<blockquote>${renderInner(token.body)}</blockquote>`;

      case 'admonition': {
        const meta = ADMON_META[token.adType] || { icon: '📌', label: token.adType.toUpperCase() };
        const customTitle = token.title || meta.label;
        return (
          `<div class="admonition admonition-${token.adType}" role="note">` +
            `<div class="admonition-title">${meta.icon} ${esc(customTitle)}</div>` +
            `<div class="admonition-body">${renderInner(token.body)}</div>` +
          `</div>`
        );
      }

      case 'details':
        return (
          `<details class="details-block">` +
            `<summary>${inline(token.title || 'Details')}</summary>` +
            `<div class="details-body">${renderInner(token.body)}</div>` +
          `</details>`
        );

      case 'table':
        return renderTable(token.lines);

      case 'list':
        return renderList(token.lines);

      case 'dl': {
        const items = token.items.map(({ term, defs }) =>
          `<dt>${inline(term)}</dt>` +
          defs.map(d => `<dd>${inline(d)}</dd>`).join('')
        ).join('');
        return `<dl>${items}</dl>`;
      }

      case 'paragraph': {
        const html = inline(token.content).replace(/\n/g, ' ');
        return `<p>${html}</p>`;
      }

      default:
        return '';
    }
  }

  let html = tokens.map(renderToken).join('\n');

  if (footnoteDefs.size) {
    const listItems = [...footnoteDefs.entries()].map(([id, def]) =>
      `<li id="fn-${id}">${inline(def)} <a href="#fnref-${id}" class="footnote-back" aria-label="Back to reference">↩</a></li>`
    ).join('');
    html += `<section class="footnotes" aria-label="Footnotes"><hr><ol>${listItems}</ol></section>`;
  }

  return html;
}


document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  const previewTitle = document.getElementById('preview-title');
  const previewBody = document.getElementById('article-body');
  const previewHr = document.getElementById('preview-hr');
  const submitBtn = document.getElementById('submit-btn');

  function updatePreview() {
    const rawTitle = titleInput.value.trim();
    const rawContent = contentInput.value;

    previewTitle.textContent = rawTitle;
    previewHr.style.display = rawTitle || rawContent ? 'block' : 'none';

    previewBody.innerHTML = parseMarkup(rawContent);
  }

  titleInput.addEventListener('input', updatePreview);
  contentInput.addEventListener('input', updatePreview);

  submitBtn.addEventListener('click', () => {
    const postData = {
      title: titleInput.value,
      category: document.getElementById('category').value,
      content: contentInput.value,
      date: new Date().toISOString()
    };
    
    console.log('Publishing Post:', postData);
    alert('Post data logged to console! (Integration with backend goes here)');
  });

  updatePreview();
});