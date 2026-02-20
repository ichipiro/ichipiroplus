import type { Editor } from "@tiptap/react";
import { Box, HStack, Heading, Text, VStack } from "@yamada-ui/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  level: number;
  text: string;
}

interface TableOfContentsProps {
  editor: Editor;
}

const debounce = <Args extends unknown[]>(
  func: (...args: Args) => void,
  wait: number,
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const updateToc = useCallback(() => {
    if (!editor) return;

    const items: TocItem[] = [];

    editor.view.state.doc.descendants(node => {
      if (node.type.name === "heading") {
        items.push({
          id: node.attrs.id || "",
          level: node.attrs.level,
          text: node.textContent,
        });
      }
    });

    setTocItems(items);
  }, [editor]);

  const setupIntersectionObserver = useCallback(() => {
    if (!editor || typeof window === "undefined") return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);

      if (intersectingEntries.length > 0) {
        const newActiveId = intersectingEntries[0].target.id;
        setActiveId(newActiveId);
      }
    };

    const options = {
      root: null,
      rootMargin: "-80px 0px -80% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    setTimeout(() => {
      tocItems.forEach(item => {
        if (item.id) {
          const element = document.getElementById(item.id);
          if (element) {
            observerRef.current?.observe(element);
          }
        }
      });
    }, 100);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [editor, tocItems]);

  useEffect(() => {
    if (!editor) return;

    const debouncedUpdateToc = debounce(updateToc, 300);

    editor.on("transaction", debouncedUpdateToc);
    editor.on("update", debouncedUpdateToc);

    updateToc();

    return () => {
      editor.off("transaction", debouncedUpdateToc);
      editor.off("update", debouncedUpdateToc);
    };
  }, [editor, updateToc]);

  useEffect(() => {
    setupIntersectionObserver();

    return () => {
      observerRef.current?.disconnect();
    };
  }, [setupIntersectionObserver]);

  const handleItemClick = (id: string) => {
    if (!id) {
      console.warn("アイテムにIDがありません");
      return;
    }

    const targetId = id.startsWith("#") ? id.substring(1) : id;

    const element = document.getElementById(targetId);
    if (element) {
      setActiveId(targetId);

      const newUrl = `${window.location.pathname + window.location.search}#${targetId}`;
      window.history.pushState(null, "", newUrl);

      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn(`ID: ${targetId} の要素が見つかりません`);
    }
  };

  const getMarkerSize = (level: number): number => {
    switch (level) {
      case 1:
        return 10; // h1
      case 2:
        return 8; // h2
      default:
        return 6; // h3以下
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <Box
      p={4}
      borderRadius="md"
      bg={["white", "black"]}
      borderColor="gray.100"
      borderWidth="1px"
      boxShadow="sm"
      position="sticky"
      top="16px"
      maxHeight="calc(100vh - 150px)"
      overflowY="auto"
    >
      <Heading size="md" mb={4} fontWeight="bold" fontSize="md">
        目次
      </Heading>

      <VStack align="start" position="relative">
        {tocItems.map(item => {
          const isActive = item.id === activeId;
          const markerSize = getMarkerSize(item.level);

          return (
            <HStack
              key={item.id || `${item.level}-${item.text}`}
              gap="sm"
              pl={(item.level - 1) * 3}
            >
              {/* マーカー（アクティブな項目のみ青色） */}
              <Box
                width={`${markerSize}px`}
                height={`${markerSize}px`}
                borderRadius="full"
                bg={isActive ? "blue.400" : "blue.100"}
                zIndex={1}
              />

              <Text
                fontSize="sm"
                fontWeight={isActive ? "bold" : "normal"}
                color={isActive ? ["gray.900", "gray.50"] : "gray.500"}
                transition="all 0.2s ease"
                cursor={item.id ? "pointer" : "not-allowed"}
                onClick={() => item.id && handleItemClick(item.id)}
              >
                {item.text}
                {!item.id && (
                  <Text as="span" ml={1} fontSize="xs" color="gray.400">
                    (ID未設定)
                  </Text>
                )}
              </Text>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
};
