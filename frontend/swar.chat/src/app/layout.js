import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Swa.chat",
  description: "Made By Swarit Acharya",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>{children}</body>
    </html>
  );
}
