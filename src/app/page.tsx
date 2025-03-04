"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Button, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "./axios-instance";

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
    await axiosInstance(router).post("/api/auth", {
      username: values.username,
      password: values.password,
    }).then(() => {
      router.push("/evaluationForm");
    }).catch((error) => {
      form.setFields([
        {
          name: "password",
          errors: [error.message],
        },
      ]);
    }).finally(() => {
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
        >
          <Typography.Title level={5} className={styles.title}>
            Welcome to <br />the Multi-Reader Multi-Case (MRMC) Study
          </Typography.Title>
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>

          <Button htmlType="submit" className={styles.btn} block loading={isLoading} disabled={isLoading}>
            {isLoading ? "Signing In..." : "SIGN IN"}
          </Button>
        </Form>
      </main>
    </div>
  );
}
