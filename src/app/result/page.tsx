import React from 'react';
import { Result, Image } from 'antd';
import styles from "./page.module.css";


export default function ResultPage() {
  return (
    <div className={styles.page}>

      <Image
        src="video.gif" preview={false}
        className={styles.gif_style}
      />
      <Result
        status="success"
        title="Successfully MRMC Evaluation "
        className={styles.text_result}
      />
    </div>

  )
}

