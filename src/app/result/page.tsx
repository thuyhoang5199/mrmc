"use client"; // Explicitly mark this file as a Client Component

import React from "react";
import { Result, Image, Button, notification } from "antd";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();
  const [notificationClient] = notification.useNotification();
  const logout = () => {
    fetch("/api/auth/logout", { method: "POST", body: "{}" })
      .then(async () => {
        router.replace("/");
      })
      .catch(async (e) => {
        const data = await e.json();

        notificationClient.error({
          message: "Get Data Error",
          description: data.message,
        });
      });
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
      <Button className={styles.btn} onClick={logout}>
        SIGN OUT
      </Button>
    </div>
  );
}
