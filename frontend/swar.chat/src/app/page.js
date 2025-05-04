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
import { Alert, Input, Switch } from "@mui/material";
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
  return (
    <div className={spaceMono.className} style={{ height: "100vh" }}>
      <div className={styles.page}>
        <div className={styles.centre}>
          <p className={styles.title}>
            CHAT WITH LLMS LOCALLY WITH OLLAMA AND SWAR.CHAT!
          </p>
          <p className={styles.subtext}>
            Start chatting with your local LLMs right now at{" "}
            <a href="/chat">https://swarchat.vercel.app/chat</a>
          </p>
          <p className={styles.supersub}>Made by Swarit Acharya</p>
        </div>
      </div>
    </div>
  );
}
