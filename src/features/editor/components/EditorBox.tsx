import type { Editor } from "@tiptap/react";
import { Box, type BoxProps } from "@yamada-ui/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";

interface EditorBoxProps extends BoxProps {
  editor: Editor | null;
  children: React.ReactNode;
}

const EditorBox = ({ editor, children, ...props }: EditorBoxProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const getEditorView = useCallback(() => {
    if (!editor || editor.isDestroyed) return null;
    return editor.view;
  }, [editor]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    const hasFiles = e.dataTransfer.types.includes("Files");

    if (!hasFiles) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const hasFiles = e.dataTransfer.types.includes("Files");
    if (!hasFiles) return;

    e.preventDefault();
    e.stopPropagation();

    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setIsDragActive(false);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    const hasFiles = e.dataTransfer.types.includes("Files");
    if (!hasFiles) return;

    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const hasFiles =
        e.dataTransfer.types.includes("Files") &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0;
      if (!hasFiles) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const view = getEditorView();
      if (!view || !editor) return;

      const imagesAndVideos = Array.from(e.dataTransfer.files).filter(
        ({ type }) => /image|video/i.test(type),
      );

      if (imagesAndVideos.length === 0) return;

      const editorRect = view.dom.getBoundingClientRect();

      const relativeX = e.clientX - editorRect.left;
      const relativeY = e.clientY - editorRect.top;

      const pos = view.posAtCoords({ left: relativeX, top: relativeY });

      if (!pos) {
        const endPos = editor.state.doc.content.size;

        imagesAndVideos.forEach(async file => {
          const uploadFn = editor.storage.resizableMedia?.uploadFn;

          if (uploadFn) {
            try {
              const src = await uploadFn(file);

              editor
                .chain()
                .focus()
                .insertContentAt(endPos, {
                  type: "resizableMedia",
                  attrs: {
                    src,
                    "media-type": file.type.includes("image") ? "img" : "video",
                    width: 400,
                    height: "auto",
                  },
                })
                .run();
            } catch (error) {
              console.error("Failed to upload media:", error);
            }
          }
        });
      } else {
        imagesAndVideos.forEach(async file => {
          const uploadFn = editor.storage.resizableMedia?.uploadFn;

          if (uploadFn) {
            try {
              const src = await uploadFn(file);

              editor
                .chain()
                .focus()
                .insertContentAt(pos.pos, {
                  type: "resizableMedia",
                  attrs: {
                    src,
                    "media-type": file.type.includes("image") ? "img" : "video",
                    width: 400,
                    height: "auto",
                  },
                })
                .run();
            } catch (error) {
              console.error("Failed to upload media:", error);
            }
          }
        });
      }
    },
    [editor, getEditorView],
  );

  const borderStyle = isDragActive
    ? {
        border: "2px dashed #3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
      }
    : {};

  return (
    <Box
      ref={boxRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      transition="all 0.3s ease"
      {...props}
      style={{ ...props.style, ...borderStyle }}
    >
      {children}
    </Box>
  );
};

export default EditorBox;
