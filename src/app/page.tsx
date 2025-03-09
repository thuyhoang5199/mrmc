"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Button, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "./axios-instance";
import Link from "next/link";

type FieldType = {
  username?: string;
  password?: string;
};

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth", {
        username: values.username,
        password: values.password,
      })
      .then(() => {
        router.replace("/verifyOTP");
      })
      .catch((error) => {
        form.setFields([
          {
            name: "password",
            errors: [error.message || "Something when wrong"],
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Form
          name="login"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          className={styles.form_login}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
          size="large"
        >
          <Typography.Title level={4} className={styles.title}>
            Welcome to Vita Imaging’s <br />
            MRMC (Multi-Reader Multi-Case) Study
          </Typography.Title>
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
            labelAlign="left"
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            labelAlign="left"
          >
            <Input.Password />
          </Form.Item>

          <Button
            htmlType="submit"
            className={styles.btn}
            block
            loading={isLoading}
            disabled={isLoading}
            style={{ marginBottom: 15 }}
          >
            {isLoading ? "Signing In..." : "SIGN IN"}
          </Button>
          <Link type="link" href={'forgotPassword'}>Forgot Password</Link>
        </Form>
      </main>
    </div>
  );
}
