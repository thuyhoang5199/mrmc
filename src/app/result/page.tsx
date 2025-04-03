"use client"; // Explicitly mark this file as a Client Component

import React, { useEffect, useState } from "react";
import { Button, Image, notification, Space } from "antd";
import styles from "./page.module.css";
import { logout } from "../functions/logout";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";

export default function ResultPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [api, contextHolderNotificationSave] = notification.useNotification();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) + I is pressed
      if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault(); // Prevent the default behavior (like opening the browser's DevTools)
        resetAccount()
      }
    };

    // Add event listener when component mounts
    document.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const tryAgain = () => {
    setIsLoading(true);
    axiosInstance(router)
      .post("/api/try-again", {})
      .then(() => {
        router.replace("/evaluationForm");
      })
      .catch(async (e) => {
        api.error({
          message: "Error",
          description: e.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const resetAccount = () => {
    setIsLoading(true);
    axiosInstance(router)
      .post("/api/reset-account", {})
      .then(() => {
        router.replace("/");
      })
      .catch(async (e) => {
        api.error({
          message: "Error",
          description: e.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  const submitLogout = () => {
    logout(router);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {contextHolderNotificationSave}
        <Image
          src="/reverse-logo-white.svg"
          preview={false}
          className={styles.img_style}
          alt="img"
        />
        <div className={styles.title}>
          Congratulations! <br />
          You have completed the MRMC Study successfully. <br />
          Thank you for <a onClick={() => { resetAccount() }}>your</a> support.
        </div>
        <Space>
          <Button
            onClick={tryAgain}
            className={styles.btn}
            loading={isLoading}
            type="primary"
          >
            Try Again
          </Button>
          <Button
            onClick={submitLogout}
            className={styles.btn}
            loading={isLoading}
            danger
          >
            Logout
          </Button>
        </Space>
      </div>
    </div>
  );
}
