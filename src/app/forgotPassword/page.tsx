"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Button, Form, Input, notification, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";

type FieldType = {
  username?: string;
  password?: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolderNotificationSave] = notification.useNotification();


  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth/forgot-password", {
        username: values.username,
      })
      .then(() => {
        api.success({
          message: "Success",
          description: "Recover password link will be send to your email, please check"
        })
      })
      .catch((error) => {
        form.setFields([
          {
            name: "username",
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
        {contextHolderNotificationSave}
        <Form
          name="forgotPassword"
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

          <Space style={{ marginTop: 10 }}>

            <Button
              htmlType="submit"
              className={styles.btn}
              block
              loading={isLoading}
              disabled={isLoading}
              style={{ width: 175 }}
            >
              {isLoading ? "Submitting..." : "Reset Password"}
            </Button>

            <Button style={{ width: 175 }} onClick={() => { router.replace('/') }}>
              Back
            </Button>
          </Space>
        </Form>
      </main>
    </div>
  );
}
