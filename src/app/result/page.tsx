import React from 'react';
import { Result, Image } from 'antd';
import styles from "./page.module.css";


export default function ResultPage() {
  return (
    <div className={styles.page}>
      <Image
        src="bg.png" preview={false}
        className={styles.img_header}
      />
      <Result
        status="success"
        title="Successfully MRMC Evaluation "
      // subTitle="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait."

      />
    </div>

  )
}

