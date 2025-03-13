"use client"; // Add this line to make this a Client Component

import React, { Fragment, useEffect, useState } from "react";
import styles from "./page.module.css";
import {
  Button,
  Divider,
  Form,
  Typography,
  Select,
  SliderSingleProps,
  Slider,
  Radio,
  message,
  FloatButton,
  notification,
  Skeleton,
  Statistic,
  Modal,
  Space,
} from "antd";
import { Image } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import LoadingPage from "../component/LoadingPage";
import { axiosInstance } from "../axios-instance";
import { logout } from "../functions/logout";
import { omit } from "lodash";

const marksBenign: SliderSingleProps["marks"] = {
  1: {
    style: {
      color: "#086f0f",
      width: "100px",
      left: "-60px",
      top: "-50px",
      fontSize: "18px",
    },
    label: <strong>High confidence Benign</strong>,
  },
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  60: "60",
  70: "70",
  80: "80",
  90: "90",
  100: {
    style: {
      color: "#9c9006",
      width: "100px",
      top: "-50px",
      transform: "translateX(4%)",
      fontSize: "18px",
    },
    label: <strong>Low confidence Benign</strong>,
  },
};
const marksMalignant: SliderSingleProps["marks"] = {
  1: {
    style: {
      color: "#9c9006",
      width: "100px",
      left: "-60px",
      top: "-50px",
      fontSize: "18px",
    },
    label: (
      <strong className={styles.note_slide}>Low confidence Malignant </strong>
    ),
  },
  10: "10",
  20: "20",
  30: "30",
  40: "40",
  50: "50",
  60: "60",
  70: "70",
  80: "80",
  90: "90",
  100: {
    style: {
      color: "red",
      width: "100px",
      top: "-50px",
      transform: "translateX(4%)",
      fontSize: "18px",
    },
    label: (
      <strong className={styles.note_slide}>High confidence Malignant </strong>
    ),
  },
};

const benignLesions = [
  {
    value: "Seborrheic Keratosis (SK)",
    label: "Seborrheic Keratosis (SK)",
  },
  {
    value: "Nevus",
    label: "Nevus",
  },
  {
    value: "Dermatofibroma",
    label: "Dermatofibroma",
  },
  {
    value: "Warts",
    label: "Warts",
  },
  {
    value: "Sebaceous Hyperplasia",
    label: "Sebaceous Hyperplasia",
  },
  {
    value: "Other benign lesions",
    label: "Other benign lesions",
  },
];
const malignantLesions = [
  {
    value: "Melanoma",
    label: "Melanoma",
  },
  {
    value: "Basal Cell Carcinoma (BCC)",
    label: "Basal Cell Carcinoma (BCC)",
  },
  {
    value: "Squamous Cell Carcinoma (SCC)",
    label: "Squamous Cell Carcinoma (SCC)",
  },
  {
    value: "Actinic Keratosis (AK)",
    label: "Actinic Keratosis (AK)",
  },
  {
    value: "Other Malignant Lesions",
    label: "Other Malignant Lesions",
  },
];

export default function EvaluationForm() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();
  const [api, contextHolderNotificationSave] = notification.useNotification();

  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [currentEval, setCurrentEval] = useState(1);

  //#region for handle not working util 5 minutes
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  const [isApiCalled, setIsApiCalled] = useState(false);
  //#endregion

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionInfo, setQuestionInfo] = useState({
    nextQuestionIndex: 1,
    patientAge: "0",
    patientGender: "",
    lesionLocation: "",
    lesionSize: "",
    lesionPicture: null,
    lesionAuraResultScreen: null,
    lesionId: null,
    doctorName: "",
    nextQuestionIndexInListQuestion: 0,
    lesionLength: 0,
    account: {
      id: "",
      name: "",
    },
  });

  useEffect(() => {
    setIsLoading(true);
    axiosInstance(router)
      .get("/api/question")
      .then(async (res) => {
        setStartTime(new Date().toUTCString());
        if (res.data.successAll) {
          if (res.data?.isSignWhenComplete == "False") {
            router.replace("/signature");
          } else {
            router.replace("/result");
          }
        } else {
          setQuestionInfo(omit(res.data, ["answerLesion"]) as any);
          setCurrentEval(Number(res.data?.answerLesion?.currentEval || 1));
          form.setFieldsValue(omit(res.data?.answerLesion, ["currentEval"]));
        }
      })
      .catch(async (e) => {
        api.error({
          message: "Get Data Error",
          description: e.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
        setSeconds(0);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: any) => {
    if (currentEval == 1) {
      onFinish({
        eval1: { ...values, done: "True" },
        resetForm: true,
      });
    } else {
      onFinish({
        eval2: { ...values, done: "True" },
        resetForm: true,
      });
    }
  };

  const onFinish = (values: any) => {
    const { resetForm } = values;
    setIsLoading(true);
    axiosInstance(router)
      .post("/api/question", { ...values, startTime })
      .then((res) => {
        if (res.data?.successAll) {
          router.replace("/signature");
        } else if (resetForm) {
          setQuestionInfo(res.data);
          setCurrentEval(currentEval == 1 ? 2 : 1);
          form.resetFields();
        }
        success();
      })
      .catch(async (e) => {
        api.success({
          message: "Save error",
          description: e.message,
        });
      })
      .finally(() => {
        setStartTime(new Date().toUTCString());
        setIsLoading(false);
        setSeconds(0);
      });
  };

  const warning = (value: string) => {
    if (value) {
      messageApi.open({
        type: "warning",
        content:
          "IMPORTANT NOTE:  For the MRMC Study, Actinic Keratosis (AK) is classified as a “malignant” diagnosis",
        style: {
          fontSize: "20px",
          fontWeight: 500,
        },
      });
    }
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Data is automatically saved",
      style: {
        fontSize: "20px",
        color: "#0d7535",
        fontWeight: 600,
      },
    });
  };

  const handleClickSave = () => {
    const data = form.getFieldsValue();

    if (currentEval == 1) {
      onFinish({
        eval1: { ...data, done: "False" },
        resetForm: false,
      });
    } else {
      onFinish({
        eval2: { ...data, done: "False" },
        resetForm: false,
      });
    }
  };

  const submitLogout = () => {
    logout(router);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  //#region for handle not working util 5 minutes
  const handleUserActivity = () => {
    setLastActionTime(Date.now());
    if (isApiCalled) {
      setIsApiCalled(false); // Reset cờ khi có hành động mới
    }
  };

  useEffect(() => {
    // Đăng ký sự kiện cho hành động của người dùng
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);

    const interval = setInterval(() => {
      // Kiểm tra nếu 5 phút đã trôi qua và API chưa được gọi
      if (Date.now() - lastActionTime > 1 * 60 * 1000 && !isApiCalled) {
        setIsApiCalled(true);
        const data = form.getFieldsValue();
        if (currentEval == 1) {
          onFinish({
            eval1: { ...data, done: "False" },
            resetForm: false,
          });
          success();
        } else {
          onFinish({
            eval2: { ...data, done: "False" },
            resetForm: false,
          });
        }
      }
    }, 10000); // Kiểm tra mỗi 10 giây

    // Dọn dẹp sự kiện khi component bị unmount
    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActionTime, isApiCalled]);
  //#endregion

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Image
          alt="background"
          src="bg.png"
          preview={false}
          className={styles.img_header}
        />
        <Fragment>
          <Typography.Title level={1}>
            MRMC Evaluation - Lesion{" "}
            {questionInfo.nextQuestionIndexInListQuestion} of{" "}
            {questionInfo.lesionLength}
          </Typography.Title>
          <Typography.Title level={3}>
            Doctor ID: {questionInfo.account.id}
          </Typography.Title>
          <Typography.Title level={3}>
            Doctor Name: {questionInfo.account.name}
          </Typography.Title>
        </Fragment>
        <Divider />
        <Typography.Title level={2}>
          Please provide your diagnosis for the lesion shown below.
        </Typography.Title>

        <Typography className={styles.property_gr}>
          <Typography.Title level={3} className={styles.property}>
            Patient&apos;s Age:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>
            {questionInfo.patientAge}
          </Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={3} className={styles.property}>
            Patient&apos;s Gender:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>
            {questionInfo.patientGender}
          </Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={3} className={styles.property}>
            Location of the lesion:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>
            {questionInfo.lesionLocation}
          </Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={3} className={styles.property}>
            Lesion size:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>
            {questionInfo.lesionSize.replace("mm", " mm")}
          </Typography.Text>
        </Typography>

        <Form
          onFinish={onSubmit}
          form={form}
          className={styles.form_style}
          initialValues={{
            benignConfidenceLevel: "1",
            malignantConfidenceLevel: "1",
          }}
        >
          {contextHolder}
          {contextHolderNotificationSave}

          <Typography className={styles.img_gr}>
            {isLoading || !questionInfo.lesionAuraResultScreen ? (
              <Skeleton.Image active={true} />
            ) : currentEval === 2 ? (
              <Image
                alt=""
                src={`https://mrmc.vercel.app/${questionInfo.lesionAuraResultScreen}.jpg`}
                className={styles.img}
                preview={false}
              />
            ) : (
              <div className={styles.note_not_img}>
                <span>
                  Please do not zoom the lesion picture in or out.
                  <br />
                  The default web zoom setting is at 100%,
                  <br /> please do not change it.
                </span>
              </div>
            )}
            {isLoading || !questionInfo.lesionPicture ? (
              <Skeleton.Image active={true} />
            ) : (
              <Image
                alt=""
                src={`https://mrmc.vercel.app/${questionInfo.lesionPicture}.jpg`}
                className={styles.img}
                preview={false}
              />
            )}
          </Typography>
          <label className={styles.label_item}>
            {/* Direct label styling */}
            <span style={{ color: "red" }}>
              **Note: Actinic Keratosis is classified as malignant.
            </span>
          </label>
          <Form.Item
            name="type"
            label=""
            rules={[{ required: true, message: "This field is required" }]}
            className={styles.form_item}
            wrapperCol={{ span: 24 }}
          >
            <Select
              placeholder="Choose"
              allowClear
              onChange={warning}
              className={styles.select_style}
              dropdownStyle={{ zIndex: 9999 }}
              size="large"
              options={[
                {
                  value: "benign",
                  label: "Benign",
                },
                {
                  value: "malignant",
                  label: "Malignant",
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("type") === "benign" ? (
                <>
                  <label className={styles.label_item}>
                    {" "}
                    {/* Direct label styling */}
                    <span style={{ color: "red" }}>*</span> Lesion{" "}
                    {questionInfo.nextQuestionIndexInListQuestion} of{" "}
                    {questionInfo.lesionLength}: Benign Diagnosis - Confidence
                    Level
                  </label>
                  <Form.Item
                    name="benignConfidenceLevel"
                    label=""
                    rules={[{ required: true, message: "" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={styles.form_item}
                  >
                    <Slider
                      marks={marksBenign}
                      step={1}
                      min={1}
                      max={100}
                      tooltip={{
                        open: true,
                      }}
                      className={styles.slider_style}
                    />
                  </Form.Item>

                  <label className={styles.label_item}>
                    {" "}
                    {/* Direct label styling */}
                    <span style={{ color: "red" }}>*</span> Lesion{" "}
                    {questionInfo.nextQuestionIndexInListQuestion} of{" "}
                    {questionInfo.lesionLength}: Benign Diagnosis - Lesion Type
                  </label>
                  <Form.Item
                    name="benignLesionType"
                    label=""
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={styles.form_item}
                  >
                    <Select
                      placeholder="Choose"
                      allowClear
                      className={styles.select_style}
                      dropdownStyle={{ zIndex: 9999 }}
                      options={benignLesions}
                      size="large"
                    />
                  </Form.Item>
                  {currentEval === 2 ? (
                    <>
                      <label className={styles.label_item}>
                        {" "}
                        {/* Direct label styling */}
                        <span style={{ color: "red" }}>*</span> Did the AURA
                        Slider bar position affect your diagnostic decision?{" "}
                        <br />
                      </label>
                      <Form.Item
                        name="affectDiagnostic"
                        label=""
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        className={styles.form_item}
                      >
                        <Radio.Group style={{ marginTop: "10px" }}>
                          <Radio value="yes" style={{ fontSize: "16px" }}>
                            Yes
                          </Radio>
                          <Radio value="no" style={{ fontSize: "16px" }}>
                            No
                          </Radio>
                        </Radio.Group>
                      </Form.Item>

                      <label className={styles.label_item}>
                        {" "}
                        {/* Direct label styling */}
                        <span style={{ color: "red" }}>*</span> Did the AURA
                        slider bar position affect the confidence level of your
                        final decision? <br />
                      </label>
                      <Form.Item
                        name="affectConfidenceLevel"
                        label=""
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        className={styles.form_item}
                      >
                        <Radio.Group style={{ marginTop: "10px" }}>
                          <Radio
                            value="MoreConfident"
                            style={{ fontSize: "16px" }}
                          >
                            More confident
                          </Radio>
                          <Radio
                            value="LessConfident"
                            style={{ fontSize: "16px" }}
                          >
                            Less confident
                          </Radio>
                          <Radio value="NoEffect" style={{ fontSize: "16px" }}>
                            No effect
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </>
                  ) : null}
                </>
              ) : getFieldValue("type") === "malignant" ? (
                <>
                  <label className={styles.label_item}>
                    {" "}
                    {/* Direct label styling */}
                    <span style={{ color: "red" }}>*</span> Lesion{" "}
                    {questionInfo.nextQuestionIndexInListQuestion} of{" "}
                    {questionInfo.lesionLength}: Malignant Diagnosis -
                    Confidence Level
                  </label>
                  <Form.Item
                    name="malignantConfidenceLevel"
                    label=""
                    rules={[{ required: true, message: "" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={styles.form_item}
                  >
                    <Slider
                      marks={marksMalignant}
                      step={1}
                      min={1}
                      max={100}
                      tooltip={{ open: true }}
                      className={styles.slider_style}
                    />
                  </Form.Item>
                  <label className={styles.label_item}>
                    {/* Direct label styling */}
                    <span style={{ color: "red" }}>*</span> Lesion{" "}
                    {questionInfo.nextQuestionIndexInListQuestion} of{" "}
                    {questionInfo.lesionLength}: Malignant Diagnosis - Lesion
                    Type
                  </label>
                  <Form.Item
                    name="malignantLesionType"
                    label=""
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    className={styles.form_item}
                  >
                    <Select
                      placeholder="Choose"
                      allowClear
                      className={styles.select_style}
                      dropdownStyle={{ zIndex: 9999 }}
                      options={malignantLesions}
                      size="large"
                    />
                  </Form.Item>
                  {currentEval === 2 ? (
                    <>
                      <label className={styles.label_item}>
                        {" "}
                        {/* Direct label styling */}
                        <span style={{ color: "red" }}>*</span> Did the AURA
                        Slider bar position affect your diagnostic decision?{" "}
                        <br />
                      </label>
                      <Form.Item
                        name="affectDiagnostic"
                        label=""
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        className={styles.form_item}
                      >
                        <Radio.Group style={{ marginTop: "10px" }}>
                          <Radio value="yes" style={{ fontSize: "16px" }}>
                            Yes
                          </Radio>
                          <Radio value="no" style={{ fontSize: "16px" }}>
                            No
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                      <label className={styles.label_item}>
                        {" "}
                        {/* Direct label styling */}
                        <span style={{ color: "red" }}>*</span> Did the AURA
                        slider bar position affect the confidence level of your
                        final decision? <br />
                      </label>
                      <Form.Item
                        name="affectConfidenceLevel"
                        label=""
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        className={styles.form_item}
                      >
                        <Radio.Group style={{ marginTop: "10px" }}>
                          <Radio
                            value="More confident"
                            style={{ fontSize: "16px" }}
                          >
                            More confident
                          </Radio>
                          <Radio
                            value="Less confident"
                            style={{ fontSize: "16px" }}
                          >
                            Less confident
                          </Radio>
                          <Radio value="No effect" style={{ fontSize: "16px" }}>
                            No effect
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </>
                  ) : null}
                </>
              ) : null
            }
          </Form.Item>
          <Space>
            <Button
              className={styles.btn}
              loading={isLoading}
              disabled={isLoading}
              onClick={handleClickSave}
              size="large"
            >
              SAVE
            </Button>
            <Button
              htmlType="submit"
              className={styles.btn}
              loading={isLoading}
              disabled={isLoading}
              size="large"
            >
              NEXT
            </Button>
          </Space>
        </Form>
        <FloatButton.Group>
          <FloatButton
            description={<Statistic value={formatTime(seconds)} />}
            shape="square"
            className={styles.btn_float}
          />
          <FloatButton
            shape="square"
            className={styles.btn_float}
            onClick={() => {
              setIsLogoutOpen(true);
            }}
            description={
              <span>
                <LogoutOutlined style={{ fontSize: "18px" }} />
                <br />
                <span style={{ fontWeight: "600" }}>LOGOUT</span>
              </span>
            }
          />
        </FloatButton.Group>
        <Modal
          title="SIGN OUT"
          open={isLogoutOpen}
          onOk={submitLogout}
          onCancel={() => {
            setIsLogoutOpen(false);
          }}
          style={{ width: "100px" }}
        >
          <p>When you log out, the evaluation results will be saved.</p>
        </Modal>
      </div>
      {isLoading && <LoadingPage />}
    </div>
  );
}
