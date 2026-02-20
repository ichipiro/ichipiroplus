/* eslint-disable */

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

export const Commands = Extension.create({
  name: "slash-commands",

  addOptions() {
    return {
      suggestions: {
        char: "/",
        // biome-ignore lint/suspicious/noExplicitAny: legacy reason
        command: ({ editor, range, props }: any) =>
          props.command({ editor, range, props }),
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestions,
      }),
    ];
  },
});
