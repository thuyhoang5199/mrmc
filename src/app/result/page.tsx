"use client"; // Explicitly mark this file as a Client Component

import React from "react";
import { Result, Image } from "antd";
import styles from "./page.module.css";

export default function ResultPage() {
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
        title={
          <span className={styles.title}>
            Congratulations! <br />
            You have completed the MRMC Study successfully. <br />
            Thank you for your support.
          </span>
        }
        className={styles.text_result}
      />
    </div>
  );
}
