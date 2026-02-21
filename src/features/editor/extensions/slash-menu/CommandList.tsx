/* eslint-disable */

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Code,
  HStack,
  ScrollArea,
  Spacer,
  Text,
  VStack,
} from "@yamada-ui/react";
import { stopPrevent } from "../../utils";
import type { SlashMenuItem } from "./suggestions";

interface CommandListProps {
  items: Partial<SlashMenuItem>[];
  command: (...args: unknown[]) => unknown;
}

export const CommandList = React.forwardRef(
  ({ items, command }: CommandListProps, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    // 各アイテムへの参照を保持するための配列
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // スクロールエリアへの参照
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);

    // 選択されたアイテムまでスクロールする関数
    const scrollToItem = useCallback((index: number) => {
      // 少し遅延させてDOMが更新された後に実行する
      setTimeout(() => {
        const scrollArea = scrollAreaRef.current;
        const selectedItem = itemRefs.current[index];

        if (!scrollArea || !selectedItem) return;

        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const selectedItemRect = selectedItem.getBoundingClientRect();

        // 選択したアイテムが見えるようにスクロール位置を調整
        if (selectedItemRect.bottom > scrollAreaRect.bottom) {
          // 下にはみ出した場合
          scrollArea.scrollTop +=
            selectedItemRect.bottom - scrollAreaRect.bottom;
        } else if (selectedItemRect.top < scrollAreaRect.top) {
          // 上にはみ出した場合
          scrollArea.scrollTop -= scrollAreaRect.top - selectedItemRect.top;
        }
      }, 0);
    }, []);

    // アイテムリストが変更されたらリファレンス配列を初期化
    useEffect(() => {
      itemRefs.current = itemRefs.current.slice(0, items.length);
      setSelectedIndex(0);
      // 最初のアイテムが選択されたらスクロールを一番上に
      scrollToItem(0);
    }, [items.length, scrollToItem]);

    // 選択インデックスが変更されたらスクロール
    useEffect(() => {
      scrollToItem(selectedIndex);
    }, [selectedIndex, scrollToItem]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          stopPrevent(event);
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          stopPrevent(event);
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          stopPrevent(event);
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    const upHandler = () => {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    const selectItem = (index: number) => {
      const item = items[index];

      if (item) setTimeout(() => command(item));
    };

    return (
      <ScrollArea
        type="always"
        h="xs"
        w="xs"
        rounded="md"
        shadow="md"
        bgColor="whitesmoke"
        justifyItems="center"
        ref={scrollAreaRef}
        zIndex={10}
      >
        <VStack gap="none">
          {items.length ? (
            items.map((item, index) => {
              return (
                <Button
                  variant="unstyled"
                  onClick={() => selectItem(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onKeyDown={e => e.code === "Enter" && selectItem(index)}
                  key={item.title}
                  bgColor={index === selectedIndex ? "gray.100" : ""}
                  margin="xs"
                  ref={el => {
                    itemRefs.current[index] = el;
                  }}
                  size="sm"
                >
                  <HStack gap="sm" alignItems="baseline" marginX="md">
                    <Box fontSize="xl" color="gray.600">
                      {item.icon}
                    </Box>

                    <Text fontWeight="normal">{item.title}</Text>

                    <Spacer />

                    {item.shortcut && <Code>{item.shortcut}</Code>}
                  </HStack>
                </Button>
              );
            })
          ) : (
            <Text> No result </Text>
          )}
        </VStack>
      </ScrollArea>
    );
  },
);
