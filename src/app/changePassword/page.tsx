"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import type { FormProps } from "antd";
import { Alert, Button, Form, Input, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";
import { logout } from "../functions/logout";

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


  const submitLogout = () => {
    logout(router);
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
          size="large"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Typography.Title level={4} className={styles.title}>
            Welcome to Vita Imaging’s <br />
            MRMC (Multi-Reader Multi-Case) Study
          </Typography.Title>
          <Typography.Title level={5} >
            Please create your password to get started.
          </Typography.Title>
          <Alert message="Your new password must be at least 8 characters and must contain one lowercase, one uppercase letter, one number and one special character." type="warning" style={{ textAlign: "left", marginBottom: 20, marginTop: 20 }} />

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
                  "Password format is wrong ",
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
                    new Error("The new password does not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password />
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
              {isLoading ? "Changing..." : "Submit"}
            </Button>
            <Button style={{ width: 175 }} onClick={submitLogout}>
              Back
            </Button>
          </Space>
        </Form>
      </main>
    </div>
  );
}
