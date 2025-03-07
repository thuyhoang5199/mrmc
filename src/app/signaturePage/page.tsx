"use client"; // Explicitly mark this file as a Client Component

import { Button, Form, Space, Typography, Col, Row, Modal, Image } from "antd";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import styles from "./page.module.css";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePage() {
  const router = useRouter();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [img, setImg] = useState(undefined)
  const today = new Date()

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false); // Đặt lại trạng thái sau khi xóa chữ ký
      setImg(undefined)
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL(); // Lấy dữ liệu chữ ký dưới dạng ảnh
      console.log("Chữ ký dưới dạng hình ảnh:", dataURL);
      setImg(dataURL)
      // Bạn có thể lưu dataURL vào máy chủ hoặc hiển thị nó cho người dùng
    }
    setIsModalOpen(false);
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
          <Typography.Title level={1} className={styles.title}>Signature Page</Typography.Title>

          <Typography.Text className={styles.text}>
            “I do hereby attest that I have entered and completed all the
            information on this Multi-Reader, Multi-Case (MRMC) Study to the best of
            my knowledge and medical expertise.”
          </Typography.Text>

          <Form layout="horizontal" labelCol={{ span: 4 }} size="large" style={{ marginTop: "20px" }}>

            <Form.Item label={
              <span style={{ fontWeight: '600', fontSize: '20px' }}>
                Signature
              </span>
            } labelAlign="left" >
              <Button
                onClick={showModal}
              >
                {isSigned ? "Edit Sign" : "Create Sign"}
              </Button>
              {img ? (<Image
                alt="img"
                src={img}
                preview={false}
                style={{ marginTop: "10px" }}
              />) : null}

            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: '600', fontSize: '20px' }}>
                Date
              </span>}
              labelAlign="left">
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
                  onClick={() => {
                    router.replace("/result");
                  }}
                  disabled={!isSigned}
                  className={styles.btn}
                >
                  Save
                </Button>
              </Space>
            </Form.Item>

          </Form>
        </Typography>




        <Modal title="Signature" open={isModalOpen} width={600} footer={null} onCancel={handleCancel}>

          <Row>
            <Col span={24} style={{ textAlign: "center" }}>
              <SignatureCanvas
                ref={sigCanvas}
                backgroundColor="white"
                penColor="black"
                canvasProps={{ width: 500, height: 200, className: "signature-canvas" }}
                onEnd={handleEnd}
              />
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 20 }}>
            <Col>
              <Button type="primary" onClick={saveSignature} style={{ marginRight: 10 }} disabled={!isSigned} >
                Save
              </Button>
              <Button onClick={clearSignature} disabled={!isSigned} >
                Clear
              </Button>
            </Col>
          </Row>

        </Modal>


      </div>

    </div>
  );
}
