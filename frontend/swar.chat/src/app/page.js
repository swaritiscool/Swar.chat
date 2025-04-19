"use client";

import styles from "./page.module.css";
import { Poppins } from "next/font/google";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Snackbar from "@mui/material/Snackbar";
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { UserCard, AICard } from "@/components/card";
import { useInView } from "react-intersection-observer";

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState([]);
  const [model, setModel] = useState("granite3-moe");
  const [ref, inView, entry] = useInView({ threshold: 0.5 });
  const scroll_ref = useRef();

  console.log(inView);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (!inView) {
      scroll_ref.current?.scrollTo({
        top: scroll_ref.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [thread]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt.trim() === "") {
      setOpen(true);
      return;
    }

    const newMessage = {
      id: uuidv4(),
      role: "user",
      content: prompt,
      isLoaded: true,
    };

    const aiMsg = {
      id: uuidv4(),
      role: "bot",
      content: "",
      isLoaded: false,
    };

    setThread((prev) => [...prev, newMessage, aiMsg]);
    setPrompt("");

    try {
      const response = await fetch(
        "https://4ddc-2401-4900-1c64-df59-2055-69b-10c4-4c2c.ngrok-free.app/chat/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
            history: [...thread.slice(-2), newMessage],
            model: model,
          }),
        }
      );

      if (!response.ok) throw new Error("Request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      const readChunk = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;

          setThread((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: fullText,
              isLoaded: true,
            };
            return updated;
          });
        }

        // Final update to mark complete
        setThread((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex].isLoaded = true;
          return updated;
        });
      };

      readChunk();
    } catch (error) {
      console.error("Stream error:", error.message);
    }
  };

  const handleChange = (event) => {
    setModel(event.target.value);
  };

  return (
    <div className={poppins.className}>
      <div className={styles.page}>
        <div className={styles.banner}>
          <FormControl fullWidth>
            <InputLabel>Age</InputLabel>
            <Select value={model} label="Model" onChange={handleChange}>
              <MenuItem value={"granite3-moe"}>Granite 3 MOE</MenuItem>
              <MenuItem value={"gemma3:1b"}>Gemma 3 1B</MenuItem>
              <MenuItem value={"llama3.1"}>Llama 3.1 8B</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div className={styles.main} ref={scroll_ref}>
          {thread ? (
            thread.map((m, index) => (
              <div key={m.id} className={styles.cards} ref={ref}>
                {m.role === "user" ? (
                  <UserCard content={m.content} />
                ) : m.isLoaded === true ? (
                  <AICard content={m.content} />
                ) : (
                  <AICard content={m.content} loaded={false} />
                )}
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
        <form className={styles.messageBox} onSubmit={handleSubmit}>
          <textarea
            id="w3review"
            name="w3review"
            rows="2"
            cols="50"
            className={styles.input}
            onChange={(x) => setPrompt(x.target.value)}
            value={prompt}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent newline
                handleSubmit(e); // Submit form
              }
            }}
            autoFocus
            placeholder={`Chat with ${model}`}
          />
          <button
            disabled={
              thread.length !== 0 ? !thread[thread.length - 1].isLoaded : false
            }
          >
            <ArrowCircleUpIcon fontSize="large" />
          </button>
        </form>
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Please enter a prompt!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
