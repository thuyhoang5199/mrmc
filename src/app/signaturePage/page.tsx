"use client"; // Explicitly mark this file as a Client Component

import { Button, Form, Input, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import React from "react";
import styles from "./page.module.css";

export default function SignaturePage() {
  const router = useRouter();
  return (
    <div className={styles.page}>
      <Typography.Title level={1}>Signature Page</Typography.Title>

      <Typography.Text>
        “I do hereby attest that I have entered and completed all the
        information on this Multi-Reader, Multi-Case (MRMC) Study to the best of
        my knowledge and medical expertise.”
      </Typography.Text>
      <Form layout="horizontal" labelCol={{ span: 8 }} size="large">
        <Form.Item label="Signature" labelAlign="left">
          <Input />
        </Form.Item>

        <Form.Item label="Date" labelAlign="left">
          <Input />
        </Form.Item>
        <Space>
          <Button
            onClick={() => {
              router.replace("/result");
            }}
          >
            Completed
          </Button>
          <Button
            onClick={() => {
              router.replace("/result");
            }}
          >
            Save
          </Button>
        </Space>

      </Form>
    </div>
  );
}
