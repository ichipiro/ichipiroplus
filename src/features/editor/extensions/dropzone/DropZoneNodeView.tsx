import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { UploadIcon } from "@yamada-ui/lucide";
import { Box, Center, Input, Text } from "@yamada-ui/react";
import type React from "react";
import { useCallback, useRef, useState } from "react";

export const DropZoneNodeView: React.FC<NodeViewProps> = ({
  editor,
  node,
  getPos,
}) => {
  // Properly access the upload function from extension storage
  const dropZoneStorage = editor.storage.dropZone;
  const uploadFn = dropZoneStorage?.uploadFn;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) {
        setIsDragActive(true);
      }
    },
    [isDragActive],
  );

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Process only images
      const imageFiles = Array.from(files).filter(file =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length === 0) return;

      // Debug information
      console.log("Processing files:", imageFiles);
      console.log("Upload function available:", !!uploadFn);

      try {
        setIsUploading(true);

        // Get current position
        const pos = typeof getPos === "function" ? getPos() : 0;

        // Delete the drop zone node first
        const tr = editor.state.tr.delete(pos, pos + node.nodeSize);
        editor.view.dispatch(tr);

        // Upload each file and insert as ResizableMedia
        for (const file of imageFiles) {
          // biome-ignore lint/suspicious/noImplicitAnyLet: legacy reason
          let src;

          if (uploadFn) {
            // Use the configured upload function
            src = await uploadFn(file);
            console.log("Uploaded image, received src:", src);
          } else {
            // Fallback to using ResizableMedia's upload function as a workaround
            console.log(
              "No uploadFn found in dropZone storage, trying to use ResizableMedia upload function",
            );

            // Try to access ResizableMedia's upload function
            const resizableMediaStorage = editor.storage.resizableMedia;
            const resizableMediaUploadFn = resizableMediaStorage?.uploadFn;

            if (resizableMediaUploadFn) {
              src = await resizableMediaUploadFn(file);
            } else {
              // Last resort fallback
              console.error(
                "No upload function available, using placeholder image",
              );
              src = "https://source.unsplash.com/8xznAGy4HcY/800x400";
            }
          }

          // Insert ResizableMedia at the position where the dropZone was
          editor.commands.insertContentAt(pos, {
            type: "resizableMedia",
            attrs: {
              src,
              "media-type": "img",
              width: 400,
              height: "auto",
            },
          });
        }

        editor.commands.focus();
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [editor, getPos, node.nodeSize, uploadFn],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const { files } = e.dataTransfer;
      processFiles(files);
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      processFiles(files);
    },
    [processFiles],
  );

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <NodeViewWrapper>
      <Box
        p={6}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor={isDragActive ? "blue.400" : "gray.200"}
        borderRadius="md"
        bg={isDragActive ? "blue.50" : "gray.50"}
        transition="all 0.2s"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        cursor="pointer"
        position="relative"
      >
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          display="none"
        />
        <Center flexDir="column" h="150px">
          <UploadIcon fontSize="3xl" color="gray.500" mb={2} />
          <Text fontWeight="medium" mb={1}>
            {isUploading
              ? "アップロード中..."
              : "ドラッグ＆ドロップまたはクリックして画像をアップロード"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            PNG, JPG, GIF (最大 10MB)
          </Text>
        </Center>
      </Box>
    </NodeViewWrapper>
  );
};
