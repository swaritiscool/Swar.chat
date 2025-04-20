import { CircularProgress } from "@mui/material";
import styles from "./card.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/felipec.css";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
      <p className={styles.model}>{model}</p>
    </div>
  );
};
