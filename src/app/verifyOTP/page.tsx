"use client"; // Add this line to make this a Client Component

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { FormProps, Input, notification, Space } from "antd";
import { Button, Form, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";
import { logout } from "../functions/logout";

type FieldType = {
  otp?: string;
};

export default function OTPPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [api] = notification.useNotification();
  const [email, setEmail] = useState('');

  useEffect(() => {
    axiosInstance(router).get('/api/cookie').then(res => {
      setEmail(res.data.email)
    })
  }, []);

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


  const submitLogout = () => {
    logout(router);
  };


  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Form
          name="verifyOTP"
          wrapperCol={{ span: 24 }}
          className={styles.form_login}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}

        >
          <Typography.Title level={4} className={styles.title}>
            Welcome to Vita Imaging’s <br />
            MRMC (Multi-Reader Multi-Case) Study
          </Typography.Title>
          <Typography.Title level={4} style={{ textAlign: 'left' }}>
            Verify your identity
          </Typography.Title>
          <p style={{ textAlign: 'left' }}>Please enter the verification code we sent you at </p>
          <Typography.Title level={5} style={{ textAlign: 'left' }} >
            {email}
            <Button
              onClick={resendOTP}
              type="link"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Resending..." : "Resend"}
            </Button></Typography.Title>
          <Form.Item<FieldType>
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
            <Input.OTP length={6} size="large" />
          </Form.Item>
          <Space style={{ marginTop: 15 }}>
            <Button
              htmlType="submit"
              className={styles.btn}
              type="primary"
              block
              loading={isLoading}
              disabled={isLoading}
              style={{ width: 120 }}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              style={{ width: 120 }}
              onClick={submitLogout}
            >Cancel</Button>
          </Space>


          <p style={{ marginTop: 20 }}>If you can&apos;t find the verification code, please retry sign in or contact our <a href="mailto:Info@vita-imaging.com">Support center</a></p>
        </Form>
      </main>
    </div>
  );
}
