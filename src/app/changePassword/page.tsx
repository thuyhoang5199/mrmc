"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Button, Form, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";

type FieldType = {
  password?: string;
};

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth/change-password", {
        password: values.password,
      })
      .then(() => {
        router.replace("/evaluationForm");
      })
      .catch((error) => {
        form.setFields([
          {
            name: "confirm",
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
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          className={styles.form_login}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Typography.Title level={5} className={styles.title}>
            Welcome to <br />
            the Multi-Reader Multi-Case (MRMC) Study
          </Typography.Title>
          <Form.Item
            name="password"
            label="Password"
            labelAlign="left"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
              {
                pattern:
                  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
                message:
                  "Password must contain at least one letter, one number, and one special character!",
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={["password"]}
            hasFeedback
            labelAlign="left"
            rules={[
              {
                required: true,
                message: "Please confirm your password!",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The new password that you entered do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            htmlType="submit"
            className={styles.btn}
            block
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Changing..." : "Submit"}
          </Button>
        </Form>
      </main>
    </div>
  );
}
