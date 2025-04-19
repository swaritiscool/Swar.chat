import { CircularProgress } from "@mui/material";
import styles from "./card.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const UserCard = ({ content }) => {
  return (
    <div className={styles.UserCard}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export const AICard = ({ content, loaded }) => {
  return loaded === false ? (
    <div className={styles.AICard}>
      <CircularProgress size="30px" />
    </div>
  ) : (
    <div className={styles.AICard}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};
