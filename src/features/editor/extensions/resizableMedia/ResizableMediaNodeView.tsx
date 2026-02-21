import { NodeSelection } from "@tiptap/pm/state";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  Trash2Icon,
} from "@yamada-ui/lucide";
import {
  Box,
  HStack,
  IconButton,
  Image,
  Tooltip,
  useBoolean,
} from "@yamada-ui/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export const ResizableMediaNodeView = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
  getPos,
}: NodeViewProps) => {
  const [mediaType, setMediaType] = useState<"img" | "video">();
  const [aspectRatio, setAspectRatio] = useState(1);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useBoolean(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStateRef = useRef({
    startX: 0,
    startWidth: 0,
    containerWidth: 0,
    naturalWidth: 0,
  });

  // 初期化
  useEffect(() => {
    setMediaType(node.attrs["media-type"]);
  }, [node.attrs]);

  // アスペクト比の設定とコンテナ幅の取得
  const setMediaAspectRatio = useCallback(() => {
    if (!mediaRef.current) return;

    // コンテナの幅を取得
    const container = document.querySelector(".ProseMirror");
    const containerWidth = container?.clientWidth || window.innerWidth;
    resizeStateRef.current.containerWidth = containerWidth;

    if (mediaType === "img") {
      const img = mediaRef.current as HTMLImageElement;
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        resizeStateRef.current.naturalWidth = img.naturalWidth;

        // 初期幅をパーセンテージで設定（初回のみ）
        if (!node.attrs.widthPercent) {
          const initialPercent = Math.min(
            100,
            (img.naturalWidth / containerWidth) * 100,
          );
          updateAttributes({ widthPercent: initialPercent });
        }
      }
    } else if (mediaType === "video") {
      const video = mediaRef.current as HTMLVideoElement;
      if (video.videoWidth && video.videoHeight) {
        setAspectRatio(video.videoWidth / video.videoHeight);
        resizeStateRef.current.naturalWidth = video.videoWidth;

        // 初期幅をパーセンテージで設定（初回のみ）
        if (!node.attrs.widthPercent) {
          const initialPercent = Math.min(
            100,
            (video.videoWidth / containerWidth) * 100,
          );
          updateAttributes({ widthPercent: initialPercent });
        }
      }
    }
  }, [mediaType, node.attrs.widthPercent, updateAttributes]);

  // メディアロード時の処理
  // biome-ignore lint/correctness/useExhaustiveDependencies: legacy reason
  useEffect(() => {
    if (!mediaRef.current) return;

    const handleLoad = () => {
      setMediaAspectRatio();
    };

    if (mediaType === "img") {
      if ((mediaRef.current as HTMLImageElement).complete) {
        handleLoad();
      } else {
        mediaRef.current.addEventListener("load", handleLoad);
      }
    } else if (mediaType === "video") {
      mediaRef.current.addEventListener("loadedmetadata", handleLoad);
    }

    return () => {
      if (mediaRef.current) {
        if (mediaType === "img") {
          mediaRef.current.removeEventListener("load", handleLoad);
        } else if (mediaType === "video") {
          mediaRef.current.removeEventListener("loadedmetadata", handleLoad);
        }
      }
    };
  }, [mediaRef, mediaType, setMediaAspectRatio]);

  // ウィンドウリサイズ時の処理
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".ProseMirror");
      const containerWidth = container?.clientWidth || window.innerWidth;
      resizeStateRef.current.containerWidth = containerWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // リサイズ開始処理
  const handleResizeStart = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mediaRef.current) return;

    const container = document.querySelector(".ProseMirror");
    const containerWidth = container?.clientWidth || window.innerWidth;

    // リサイズ状態を初期化
    resizeStateRef.current = {
      startX: e.clientX,
      startWidth: mediaRef.current.offsetWidth,
      containerWidth: containerWidth,
      naturalWidth: resizeStateRef.current.naturalWidth,
    };

    setIsResizing(true);
  }, []);

  // リサイズ中処理
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !mediaRef.current) return;

      const { startX, startWidth, containerWidth } = resizeStateRef.current;
      const delta = e.clientX - startX;
      let newWidth = startWidth + delta;

      // 最小サイズを制限（コンテナ幅の20%）
      const minWidth = containerWidth * 0.2;
      newWidth = Math.max(minWidth, newWidth);

      // 最大サイズを制限（コンテナの幅）
      newWidth = Math.min(newWidth, containerWidth);

      // 幅をパーセンテージに変換
      const widthPercent = (newWidth / containerWidth) * 100;

      // 更新
      updateAttributes({
        widthPercent,
      });
    },
    [isResizing, updateAttributes],
  );

  // リサイズ終了処理
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // グローバルイベントリスナーの管理
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // ドラッグハンドラー
  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    if (typeof getPos === "function") {
      const { state } = editor;
      const pos = getPos();
      const nodeSelection = NodeSelection.create(state.doc, pos);
      editor.view.dispatch(state.tr.setSelection(nodeSelection));
    }
  };

  // メディアアクションボタン
  const mediaActions = [
    {
      tooltip: "左寄せ",
      icon: <AlignLeftIcon boxSize={4} />,
      action: () => updateAttributes({ dataAlign: "start", dataFloat: null }),
      isActive: node.attrs.dataAlign === "start" && !node.attrs.dataFloat,
    },
    {
      tooltip: "中央寄せ",
      icon: <AlignCenterIcon boxSize={4} />,
      action: () => updateAttributes({ dataAlign: "center", dataFloat: null }),
      isActive: node.attrs.dataAlign === "center",
    },
    {
      tooltip: "右寄せ",
      icon: <AlignRightIcon boxSize={4} />,
      action: () => updateAttributes({ dataAlign: "end", dataFloat: null }),
      isActive: node.attrs.dataAlign === "end" && !node.attrs.dataFloat,
    },
    {
      tooltip: "削除",
      icon: <Trash2Icon boxSize={4} />,
      action: () => deleteNode(),
      isActive: false,
    },
  ];

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper>
      <Box
        ref={wrapperRef}
        position="relative"
        onMouseEnter={setIsHovered.on}
        onMouseLeave={setIsHovered.off}
        w="100%"
        textAlign={
          node.attrs.dataAlign === "center"
            ? "center"
            : node.attrs.dataAlign === "end"
              ? "right"
              : "left"
        }
      >
        <Box
          display="inline-block"
          position="relative"
          w={`${node.attrs.widthPercent}%`}
          maxW="100%"
        >
          {mediaType === "img" && (
            <Image
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={node.attrs.src}
              alt={node.attrs.alt || ""}
              w="100%"
              maxW="100%"
              borderRadius="md"
              draggable={isEditable && !isResizing}
              onDragStart={handleDragStart}
              display="block"
              style={{ aspectRatio: aspectRatio }}
            />
          )}

          {mediaType === "video" && (
            <Box
              as="video"
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              controls
              w="100%"
              maxW="100%"
              borderRadius="md"
              draggable={isEditable && !isResizing}
              onDragStart={handleDragStart}
              style={{ aspectRatio: aspectRatio }}
            >
              <source src={node.attrs.src} />
            </Box>
          )}

          {isEditable && (
            <>
              {/* リサイズハンドル */}
              <Box
                ref={resizeHandleRef}
                position="absolute"
                right="-16px"
                top="0"
                h="100%"
                w="32px"
                cursor="ew-resize"
                zIndex={10}
                onMouseDown={handleResizeStart}
                _hover={{
                  bg: "rgba(59, 130, 246, 0.1)",
                }}
                onClick={e => e.stopPropagation()}
              >
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  w="4px"
                  h="40px"
                  bg="blue.500"
                  borderRadius="full"
                  opacity={isHovered || isResizing ? 0.8 : 0.2}
                  transition="opacity 0.2s"
                />
              </Box>

              {/* メディアコントロール */}
              <HStack
                position="absolute"
                top={2}
                right={2}
                bg="white"
                rounded="md"
                shadow="md"
                p={1}
                opacity={isHovered ? 1 : 0}
                transition="all 0.2s ease"
                zIndex={20}
              >
                {mediaActions.map(action => (
                  <Tooltip key={action.tooltip} label={action.tooltip}>
                    <IconButton
                      aria-label={action.tooltip}
                      icon={action.icon}
                      size="xs"
                      variant={action.isActive ? "solid" : "ghost"}
                      colorScheme={action.isActive ? "blue" : "gray"}
                      onClick={action.action}
                    />
                  </Tooltip>
                ))}
              </HStack>
            </>
          )}
        </Box>
      </Box>
    </NodeViewWrapper>
  );
};
