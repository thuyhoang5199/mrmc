"use client"; // Add this line to make this a Client Component

import React, { useState } from "react";
import styles from "./page.module.css";
import { FormProps, Input, notification } from "antd";
import { Button, Form, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";

type FieldType = {
  otp?: string;
};

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [api] = notification.useNotification();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth/verify-otp", {
        otp: values.otp,
      })
      .then((res) => {
        if (res.data.isDefaultPassword == "True")
          router.replace("/changePassword");
        else router.replace("/evaluationForm");
      })
      .catch((error) => {
        form.setFields([
          {
            name: "otp",
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

  const resendOTP = async () => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth/resend-otp", {})
      .then(() => {
        api.success({
          message: "Resend OTP Successful",
        });
      })
      .catch((error) => {
        form.setFields([
          {
            name: "otp",
            errors: [error.message || "Something when wrong"],
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Form
          name="verifyOTP"
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
            Welcome to <br />
            the Multi-Reader Multi-Case (MRMC) Study
          </Typography.Title>
          <Form.Item<FieldType>
            label="OTP"
            name="otp"
            labelAlign="left"
            rules={[
              { required: true, message: "Please input your otp!" },
              {
                pattern: /^\d{6}$/,
                message: "OTP must contain exactly 6 digits!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Button
            htmlType="submit"
            className={styles.btn}
            type="primary"
            block
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>

          <Button
            onClick={resendOTP}
            type="dashed"
            block
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 10 }}
          >
            {isLoading ? "Resending..." : "Resend"}
          </Button>
        </Form>
      </main>
    </div>
  );
}
