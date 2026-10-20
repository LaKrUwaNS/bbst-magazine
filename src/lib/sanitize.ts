import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich-text HTML on the server before storing or rendering publicly.
 * Prevents stored XSS attacks while permitting standard editorial formatting.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "code",
      "hr",
      "br",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "span",
      "div",
      "pre",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: [
      "href",
      "name",
      "target",
      "src",
      "alt",
      "title",
      "class",
      "style",
      "rel",
      "width",
      "height",
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}
