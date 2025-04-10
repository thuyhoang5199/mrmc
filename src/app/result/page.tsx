"use client"; // Explicitly mark this file as a Client Component

import React from "react";
import { Image } from "antd";
import styles from "./page.module.css";

export default function ResultPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Image
          src="/public/reverse-logo-white.svg"
          preview={false}
          className={styles.img_style}
          alt="img"
        />
        <div className={styles.title}>
          Congratulations! <br />
          You have completed the MRMC Study successfully. <br />
          Thank you for your support.
        </div>
      </div>
    </div>
  );
}
