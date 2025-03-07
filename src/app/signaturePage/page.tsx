"use client"; // Explicitly mark this file as a Client Component

import { Button, Form, Space, Typography, Image } from "antd";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import styles from "./page.module.css";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePage() {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false); // Đặt lại trạng thái sau khi xóa chữ ký
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL(); // Lấy dữ liệu chữ ký dưới dạng ảnh
      console.log("Chữ ký dưới dạng hình ảnh:", dataURL);
      // Bạn có thể lưu dataURL vào máy chủ hoặc hiển thị nó cho người dùng
    }
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      // Kiểm tra nếu canvas có chữ ký
      if (!sigCanvas.current.isEmpty()) {
        setIsSigned(true);
      } else {
        setIsSigned(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Image
          alt="background"
          src="bg.png"
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
          >
            <Form.Item
              label={
                <span style={{ fontWeight: "600", fontSize: "20px" }}>
                  Signature
                </span>
              }
            >
              <SignatureCanvas
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
              </Button>
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
                  onClick={() => {
                    router.replace("/result");
                  }}
                  disabled={!isSigned}
                  className={styles.btn}
                >
                  Completed
                </Button>
                <Button
                  onClick={saveSignature}
                  disabled={!isSigned}
                  className={styles.btn}
                >
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Typography>
      </div>
    </div>
  );
}
