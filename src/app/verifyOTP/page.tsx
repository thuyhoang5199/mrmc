"use client"; // Add this line to make this a Client Component

import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { FormProps, Input, notification, Space } from "antd";
import { Button, Form, Typography } from "antd";
import { useRouter } from "next/navigation";
import { axiosInstance } from "../axios-instance";
import { logout } from "../functions/logout";
import { toLower } from "lodash";

type FieldType = {
  otp?: string;
};

export default function OTPPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolderNotificationSave] = notification.useNotification();
  const [email, setEmail] = useState("");

  useEffect(() => {
    axiosInstance(router)
      .get("/api/cookie")
      .then((res) => {
        setEmail(res.data.email);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsLoading(true);
    await axiosInstance(router)
      .post("/api/auth/verify-otp", {
        otp: values.otp,
      })
      .then((res) => {
        if (toLower(res.data.isDefaultPassword) == "true")
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
          message: "Resend Verification Code Successful",
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
        {contextHolderNotificationSave}
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
          <Typography.Title level={4} style={{ textAlign: "left" }}>
            Verify your identity
          </Typography.Title>
          <p style={{ textAlign: "left" }}>
            You are required to change the default password. Please enter
            Verification Code we sent you at {email}{" "}
          </p>

          <Typography style={{ textAlign: "left", marginBottom: 10 }}>
            Didn&apos;t receive the code?{" "}
            <Button
              onClick={resendOTP}
              type="link"
              loading={isLoading}
              disabled={isLoading}
              className={styles.btn_link}
            >
              {isLoading ? "Resending..." : "Resend"}
            </Button>
          </Typography>
          <label className={styles.label_otp}>Enter Verification Code</label>
          <Form.Item<FieldType>
            name="otp"
            rules={[
              {
                required: true,
                message: "Please input your Verification Code!",
              },
              {
                pattern: /^\d{6}$/,
                message: "Verification Code must contain exactly 6 digits!",
              },
            ]}
            style={{ marginTop: 10 }}
          >
            <Input.OTP length={6} size="large" />
          </Form.Item>
          <Space style={{ marginTop: 10 }}>
            <Button
              htmlType="submit"
              className={styles.btn}
              type="primary"
              block
              loading={isLoading}
              disabled={isLoading}
              style={{ width: 175 }}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button style={{ width: 175 }} onClick={submitLogout}>
              Back
            </Button>
          </Space>

          <p style={{ marginTop: 20 }}>
            If you can&apos;t find the verification code, please retry sign in
            or contact our{" "}
            <a href="mailto:Info@vita-imaging.com">Support center</a>
          </p>
        </Form>
      </main>
    </div>
  );
}
