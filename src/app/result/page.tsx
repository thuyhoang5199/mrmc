"use client"; // Explicitly mark this file as a Client Component

import React from "react";
import { Result, Image, Button } from "antd";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { logout } from "../functions/logout";

export default function ResultPage() {
  const router = useRouter();
  const submitLogout = () => {
    logout(router)
  };
  return (
    <div className={styles.page}>
      <Image
        src="video.gif"
        preview={false}
        className={styles.gif_style}
        alt="img"
      />
      <Result
        status="success"
        title="Successfully MRMC Evaluation"
        className={styles.text_result}
      />
      <Button className={styles.btn} onClick={submitLogout}>
        SIGN OUT
      </Button>
    </div>
  );
}
