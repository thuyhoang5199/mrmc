"use client"; // Add this line to make this a Client Component

import React from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";

type FieldType = {
  username?: string;
  password?: string;
};

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const response = await fetch("/api/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });
    if (response.ok) {
      router.push("/evaluationForm");
    } else {
      const error = await response.json();
      form.setFields([
        {
          name: "password",
          errors: [error.message],
        },
      ]);
    }
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

          <Button htmlType="submit" className={styles.btn} block>
            SIGN IN
          </Button>
        </Form>
      </main>
    </div>
  );
}
