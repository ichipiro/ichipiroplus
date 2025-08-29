import { uploadImage } from "@/features/article/actions";
import type { AnyExtension } from "@tiptap/core";
import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import DropCursor from "@tiptap/extension-dropcursor";
import GapCursor from "@tiptap/extension-gapcursor";
import HardBreak from "@tiptap/extension-hard-break";
import History from "@tiptap/extension-history";
import Italic from "@tiptap/extension-italic";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { CustomHeading } from "./customHeading";
import { DBlock } from "./dBlock";
import { Document } from "./doc";
import { DropZone } from "./dropzone/dropzone";
import { Paragraph } from "./paragraph";
import { Placeholder } from "./placeholder";
import { ResizableMedia } from "./resizableMedia";
import { Commands, suggestions } from "./slash-menu";
import { TrailingNode } from "./trailingNode";

export const getExtensions = (): AnyExtension[] => {
  return [
    // Necessary
    Document,
    DBlock,
    Paragraph,
    Text,
    DropCursor.configure({
      width: 2,
      class: "notitap-dropcursor",
      color: "skyblue",
    }),
    GapCursor,
    History,
    HardBreak,
    Commands.configure({
      suggestions,
    }),

    // marks
    Bold,
    Italic,
    Strike,
    Underline,

    // Node
    ListItem,
    BulletList,
    OrderedList,
    // Heading.configure({
    //   levels: [1, 2, 3],
    // }),
    CustomHeading.configure({ levels: [1, 2, 3] }),
    TrailingNode,
    Blockquote,

    // Resizable Media
    ResizableMedia.configure({
      uploadFn: async (file: File) => {
        // FileをBase64に変換
        const reader = new FileReader();
        const base64Promise = new Promise<string>(resolve => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

        const url = await uploadImage({
          base64,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });

        return url;
      },
    }),

    DropZone.configure({
      uploadFn: async (file: File) => {
        // FileをBase64に変換
        const reader = new FileReader();
        const base64Promise = new Promise<string>(resolve => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

        const url = await uploadImage({
          base64,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });

        return url;
      },
    }),

    Placeholder.configure({
      placeholder: "「/」でコマンドを呼び出します...",
      includeChildren: true,
    }),
  ];
};
