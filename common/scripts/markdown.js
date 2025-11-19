const BLOCK_DELIMITER = "\n";

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(value) {
  return value
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
}

function closeList(listState) {
  if (!listState.type) return "";
  const closing = listState.type === "ol" ? "</ol>" : "</ul>";
  listState.type = null;
  return closing;
}

export function markdownToHtml(markdown = "") {
  const lines = markdown.replace(/\r\n/g, BLOCK_DELIMITER).split(BLOCK_DELIMITER);
  let html = "";
  let inCodeBlock = false;
  let codeFence = "";
  let listState = { type: null };

  const flushParagraph = (buffer) => {
    if (!buffer.trim()) return;
    html += `<p>${renderInline(escapeHtml(buffer.trim()))}</p>`;
  };

  let paragraphBuffer = "";

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        html += `<pre><code>${escapeHtml(codeFence)}</code></pre>`;
        codeFence = "";
        inCodeBlock = false;
      } else {
        if (paragraphBuffer) {
          flushParagraph(paragraphBuffer);
          paragraphBuffer = "";
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeFence += (codeFence ? "\n" : "") + line;
      continue;
    }

    if (!line.trim()) {
      if (paragraphBuffer) {
        flushParagraph(paragraphBuffer);
        paragraphBuffer = "";
      }
      html += closeList(listState);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      if (paragraphBuffer) {
        flushParagraph(paragraphBuffer);
        paragraphBuffer = "";
      }
      html += closeList(listState);
      const level = headingMatch[1].length;
      html += `<h${level}>${renderInline(escapeHtml(headingMatch[2]))}</h${level}>`;
      continue;
    }

    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      if (paragraphBuffer) {
        flushParagraph(paragraphBuffer);
        paragraphBuffer = "";
      }
      html += closeList(listState);
      html += `<blockquote>${renderInline(escapeHtml(blockquoteMatch[1]))}</blockquote>`;
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      if (paragraphBuffer) {
        flushParagraph(paragraphBuffer);
        paragraphBuffer = "";
      }
      if (listState.type !== "ul") {
        html += closeList(listState);
        listState.type = "ul";
        html += "<ul>";
      }
      html += `<li>${renderInline(escapeHtml(unorderedMatch[1]))}</li>`;
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (paragraphBuffer) {
        flushParagraph(paragraphBuffer);
        paragraphBuffer = "";
      }
      if (listState.type !== "ol") {
        html += closeList(listState);
        listState.type = "ol";
        html += "<ol>";
      }
      html += `<li>${renderInline(escapeHtml(orderedMatch[1]))}</li>`;
      continue;
    }

    paragraphBuffer += (paragraphBuffer ? " " : "") + line.trim();
  }

  if (paragraphBuffer) {
    flushParagraph(paragraphBuffer);
  }

  html += closeList(listState);

  if (inCodeBlock) {
    html += `<pre><code>${escapeHtml(codeFence)}</code></pre>`;
  }

  return html || "<p></p>";
}

