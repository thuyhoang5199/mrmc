"use client"; // Explicitly mark this file as a Client Component

import {
  Button,
  Form,
  Space,
  Typography,
  Image,
  notification,
  Input,
} from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./page.module.css";
// import SignatureCanvas from "react-signature-canvas";
import { axiosInstance } from "../axios-instance";
import LoadingPage from "../component/LoadingPage";

export default function SignaturePage() {
  const router = useRouter();
  // const sigCanvas = useRef<SignatureCanvas>(null);
  // const [isSigned, setIsSigned] = useState(false);
  const today = new Date();
  const [api, contextHolderNotificationSave] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  // const clearSignature = () => {
  //   if (sigCanvas.current) {
  //     sigCanvas.current.clear();
  //     setIsSigned(false); // Đặt lại trạng thái sau khi xóa chữ ký
  //   }
  // };

  // const saveSignature = (values: any) => {
  //   if (sigCanvas.current) {
  //     const dataURL = sigCanvas.current.toDataURL(); // Lấy dữ liệu chữ ký dưới dạng ảnh
  //     // Bạn có thể lưu dataURL vào máy chủ hoặc hiển thị nó cho người dùng
  //     axiosInstance(router)
  //       .post("/api/signature", {
  //         signature: dataURL.replace(/^data:image\/png;base64,/, ""),
  //       })
  //       .then((res) => {
  //         if (res.data?.successAll) {
  //           router.replace("/result");
  //         }
  //       })
  //       .catch(async (e) => {
  //         api.error({
  //           message: "Save error",
  //           description: e.message,
  //         });
  //       })
  //       .finally(() => {
  //         setIsLoading(false);
  //       });
  //   } else {
  //     api.error({
  //       message: "Save error",
  //       description: "Signature empty",
  //     });
  //   }
  // };

  // const handleEnd = () => {
  //   if (sigCanvas.current) {
  //     // Kiểm tra nếu canvas có chữ ký
  //     if (!sigCanvas.current.isEmpty()) {
  //       setIsSigned(true);
  //     } else {
  //       setIsSigned(false);
  //     }
  //   }
  // };

  const saveSignature = (values: any) => {
    setIsLoading(true);
    axiosInstance(router)
      .post("/api/signature", {
        signature: values.signature,
      })
      .then((res) => {
        if (res.data?.successAll) {
          router.replace("/result");
        }
      })
      .catch(async (e) => {
        api.error({
          message: "Save error",
          description: e.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {contextHolderNotificationSave}
        <Image
          alt="background"
          src="/public/bg.png"
          preview={false}
          className={styles.img_header}
        />
        <Typography className={styles.content}>
          <Typography.Title level={1} className={styles.title}>
            Signature Page
          </Typography.Title>

          <Typography.Text className={styles.text}>
            “I do hereby attest that I have entered and completed all the
            information on this Multi-Reader, Multi-Case (MRMC) Study to the
            best of my knowledge and medical expertise.”
          </Typography.Text>

          <Form
            layout="horizontal"
            labelCol={{ span: 4 }}
            size="large"
            style={{ marginTop: "20px" }}
            onFinish={saveSignature}
          >
            <Form.Item
              label={
                <span style={{ fontWeight: "600", fontSize: "20px" }}>
                  Signature
                </span>
              }
              name="signature"
              rules={[{ required: true, message: "Please input signature!" }]}
            >
              {/* <SignatureCanvas
                ref={sigCanvas}
                backgroundColor="white"
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "signature-canvas",
                }}
                onEnd={handleEnd}
              />
              <Button
                onClick={clearSignature}
                disabled={!isSigned}
                hidden={!isSigned}
                type="default"
              >
                Clear Signature
              </Button> */}
              <Input />
            </Form.Item>

            <Form.Item
              label={
                <span style={{ fontWeight: "600", fontSize: "20px" }}>
                  Date
                </span>
              }
              labelAlign="left"
            >
              <span style={{ fontSize: "20px" }}>{formattedDate}</span>
            </Form.Item>
            <Form.Item className={styles.center_buttons}>
              <Space>
                <Button
                  htmlType="submit"
                  // onClick={saveSignature}
                  // disabled={!isSigned}
                  className={styles.btn}
                  loading={isLoading}
                >
                  Submit
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Typography>
      </div>
      {isLoading && <LoadingPage />}
    </div>
  );
}
