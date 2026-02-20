/* eslint-disable consistent-return */
import type React from "react";
import { useEffect, useState } from "react";

import {
  BubbleMenuPlugin,
  type BubbleMenuPluginProps,
} from "./bubble-menu-plugin";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type BubbleMenuProps = Omit<
  Optional<BubbleMenuPluginProps, "pluginKey">,
  "element"
> & {
  className?: string;
  children: React.ReactNode;
};

const DEFAULT_TIPPY_OPTIONS = {};

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  pluginKey = "bubbleMenu",
  tippyOptions = DEFAULT_TIPPY_OPTIONS,
  shouldShow = null,
  className,
  children,
}) => {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    if (editor.isDestroyed) {
      return;
    }

    const plugin = BubbleMenuPlugin({
      pluginKey,
      editor,
      element,
      tippyOptions,
      shouldShow,
    });

    editor.registerPlugin(plugin);

    return () => {
      editor.unregisterPlugin(pluginKey);
    };
  }, [editor, element, pluginKey, shouldShow, tippyOptions]);

  return (
    <div
      ref={setElement}
      className={className}
      style={{ visibility: "hidden" }}
    >
      {children}
    </div>
  );
};
