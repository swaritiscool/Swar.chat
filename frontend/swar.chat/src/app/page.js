"use client";

import styles from "./page.module.css";
import { Poppins, Space_Mono } from "next/font/google";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Snackbar from "@mui/material/Snackbar";
import { UserCard, AICard } from "@/components/card";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import { Alert, Input } from "@mui/material";
import {
  ArrowCircleDown,
  ArrowDownward,
  ArrowDownwardOutlined,
  ArrowDownwardRounded,
  KeyboardDoubleArrowDown,
  KeyboardReturn,
  Send,
} from "@mui/icons-material";
// const fs = require("fs");

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [thread, setThread] = useState([]);
  const [threadName, setThreadName] = useState("");
  const [model, setModel] = useState("gemma3:1b");
  const [api, setApi] = useState("http://localhost:8000/");
  const [modelList, setModelList] = useState([]);
  const scroll_ref = useRef(null);

  useEffect(() => {
    console.log("doing");
    const get = async () => {
      const response = await fetch(api, {
        method: "GET",
      });
      const data = await response.json();
      console.log(data);
      setModelList(data);
    };
    get();
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    setOpen2(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (prompt.trim() === "") {
      setOpen(true);
      return;
    }

    const newMessage = {
      id: uuidv4().slice(-8),
      role: "user",
      content: prompt,
      isLoaded: true,
    };

    const aiMsg = {
      id: uuidv4().slice(-8),
      role: "bot",
      content: "",
      isLoaded: false,
      model: model,
    };

    setThread((prev) => [...prev, newMessage, aiMsg]);
    setPrompt("");

    const hist = [...thread];

    console.log(hist);

    try {
      const response = await fetch(`${api}chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          history: [...hist, newMessage],
          model: model,
        }),
      });

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

  useEffect(() => {
    scroll_ref.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
      // inline: "nearest",
    });
  }, [thread]);

  const handleSave = (e) => {
    e.preventDefault();

    if (thread.length > 0 && threadName.length > 0) {
      const threadData = JSON.stringify(thread, null, 2); // Pretty print
      const blob = new Blob([threadData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${threadName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      setOpen2(true);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) {
          setThread(data);
        } else {
          setOpen2(true); // You can customize this error for "Invalid format"
          console.error("Invalid thread format");
        }
      } catch (err) {
        setOpen2(true);
        console.error("Error parsing JSON:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={spaceMono.className}>
      <div className={styles.page}>
        <div className={styles.banner} onSubmit={handleSave}>
          <form>
            <Input
              type="text"
              placeholder="Name of Thread..."
              value={threadName}
              onChange={(e) => {
                e.target.value.length <= 20
                  ? setThreadName(e.target.value)
                  : null;
              }}
              color="secondary"
            />
            <button type="submit">
              <div className={styles.buttondiv}>
                <ArrowDownwardRounded /> Save Thread
              </div>
            </button>
          </form>
          <input
            value={api}
            onChange={(e) => {
              setApi(e.target.value);
            }}
            style={{ width: "40%" }}
          />
          <input
            type="file"
            accept=".json"
            onChange={handleUpload}
            placeholder="Upload File"
            // style={{ marginLeft: "1rem" }}
          />
        </div>
        <div className={styles.main}>
          {thread ? (
            thread.map((m, index) => (
              <div key={m.id} className={styles.cards}>
                {m.role === "user" ? (
                  <UserCard content={m.content} />
                ) : m.isLoaded === true ? (
                  <AICard model={m.model} content={m.content} />
                ) : (
                  <AICard model={m.model} content={m.content} loaded={false} />
                )}
              </div>
            ))
          ) : (
            <></>
          )}
          <div ref={scroll_ref} />
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
            type="submit"
          >
            <Send fontSize="medium" />
          </button>
          <div
            onClick={() =>
              scroll_ref.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          >
            <KeyboardDoubleArrowDown fontSize="medium" />
          </div>
          <Dropdown>
            <MenuButton variant="solid">{model}</MenuButton>
            <Menu variant="soft">
              {modelList.map((m, id) => {
                return (
                  <MenuItem onClick={() => setModel(m)} key={id}>
                    {m}
                  </MenuItem>
                );
              })}
              {/* <MenuItem onClick={() => setModel("granite3-moe")}>
                Granite 3 Moe
              </MenuItem>
              <MenuItem onClick={() => setModel("TinyLlama")}>
                TinyLlama
              </MenuItem>
              <MenuItem onClick={() => setModel("gemma3:1b")}>
                Gemma 3 1B
              </MenuItem> */}
            </Menu>
          </Dropdown>
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
        <Snackbar open={open2} autoHideDuration={3000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Please send a message or make a name for the save file
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
