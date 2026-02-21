import { type CommandProps, mergeAttributes } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import { Plugin, PluginKey } from "prosemirror-state";

const idCounter: Record<string, number> = {};

function slugify(text: string): string {
  return text.trim().replace(/\s+/g, "-");
}

function uniqueId(baseId: string): string {
  if (idCounter[baseId] === undefined) {
    idCounter[baseId] = 0;
  } else {
    idCounter[baseId] += 1;
  }
  return idCounter[baseId] === 0 ? baseId : `${baseId}-${idCounter[baseId]}`;
}

const compositionPluginKey = new PluginKey("compositionState");

const compositionPlugin = new Plugin({
  key: compositionPluginKey,
  state: {
    init() {
      return { composing: false };
    },
    apply(tr, value) {
      const meta = tr.getMeta(compositionPluginKey);
      if (typeof meta?.composing === "boolean") {
        return { composing: meta.composing };
      }
      return value;
    },
  },
  props: {
    handleDOMEvents: {
      compositionstart(view) {
        view.dispatch(
          view.state.tr.setMeta(compositionPluginKey, { composing: true }),
        );
        return false;
      },
      compositionend(view) {
        view.dispatch(
          view.state.tr.setMeta(compositionPluginKey, { composing: false }),
        );
        return false;
      },
    },
  },
});

export const CustomHeading = Heading.extend({
  name: "heading",

  addAttributes() {
    return {
      ...this.parent?.(),

      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("id"),
        renderHTML: (attributes: { id?: string | null }) =>
          attributes.id ? { id: attributes.id } : {},
      },

      baseText: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-base-text"),
        renderHTML: (attributes: { baseText?: string | null }) =>
          attributes.baseText ? { "data-base-text": attributes.baseText } : {},
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs;
    return [
      `h${attrs.level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        id: attrs.id || undefined,
        "data-base-text": attrs.baseText || undefined,
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    return [
      compositionPlugin,
      new Plugin({
        appendTransaction: (_transactions, _oldState, newState) => {
          const compState = compositionPluginKey.getState(newState);
          if (compState?.composing) {
            return null;
          }
          let tr = newState.tr;
          let updated = false;
          newState.doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              const currentText = node.textContent || "";

              if (node.attrs.baseText !== currentText) {
                const baseId = slugify(currentText);
                const newId = uniqueId(baseId);
                tr = tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  id: newId,
                  baseText: currentText,
                });
                updated = true;
              }
            }
          });
          return updated ? tr : null;
        },
      }),
    ];
  },

  addCommands() {
    return {
      setHeading:
        (attributes: { level: number }) =>
        ({ commands }: CommandProps) => {
          return commands.setNode(this.name, attributes);
        },
      toggleHeading:
        (attributes: { level: number }) =>
        ({ commands }: CommandProps) => {
          return commands.toggleNode(this.name, "paragraph", attributes);
        },
    };
  },
});
