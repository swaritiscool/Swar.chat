"use client";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import styles from "./card.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/felipec.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { CopyAll } from "@mui/icons-material";
import { useState } from "react";

export const UserCard = ({ content }) => {
  return (
    <div className={styles.UserCard}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const AICard = ({ content, loaded, model }) => {
  const [open, setOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return loaded === false ? (
    <div className={styles.AICard}>
      <CircularProgress size="30px" />
      <p className={styles.model}>{model}</p>
    </div>
  ) : (
    <div className={styles.AICard}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
      <div className={styles.details}>
        <p className={styles.model}>{model}</p>
        <button className={styles.copy} onClick={handleCopy}>
          <CopyAll />
        </button>
      </div>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Copied text to clipboard
        </Alert>
      </Snackbar>
    </div>
  );
};
