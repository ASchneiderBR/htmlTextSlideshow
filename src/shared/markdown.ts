import DOMPurify from "dompurify";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true
});

export function renderMarkdown(markdown: string) {
  const unsafeHtml = marked.parse(markdown || "") as string;
  return DOMPurify.sanitize(unsafeHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"]
  });
}
