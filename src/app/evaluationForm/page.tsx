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
  TreeSelect,
  Radio,
  message,
  FloatButton,
  notification,
} from "antd";
import { Image } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import LoadingPage from "../component/LoadingPage";

const { Option } = Select;

const marksBenign: SliderSingleProps["marks"] = {
  1: {
    style: {
      color: "#086f0f",
      width: "100px",
      left: "5px",
    },
    label: <strong>High confidence Benign</strong>,
  },
  50: {
    style: {
      color: "#9c9006",
      right: "-10px",
      width: "100px",
    },
    label: <strong>Low confidence Benign</strong>,
  },
};
const marksMalignant: SliderSingleProps["marks"] = {
  51: {
    style: {
      color: "#9c9006",
      width: "100px",
      left: "5px",
    },
    label: (
      <strong className={styles.note_slide}>Low confidence Malignant </strong>
    ),
  },
  100: {
    style: {
      color: "red",
      right: "-10px",
      width: "100px",
    },
    label: (
      <strong className={styles.note_slide}>High confidence Malignant </strong>
    ),
  },
};

const benignLesions = [
  {
    value: "benign 1",
    title: "Seborrheic Keratosis (SK)",

  },
  {
    value: "benign 2",
    title: "Nevus",

  },
  {
    value: "benign 3",
    title: "Dermatofibroma",

  },
  {
    value: "benign 4",
    title: "Warts",
  },
  {
    value: "benign 5",
    title: "Sebaceous Hyperplasia",
  },
  {
    value: "benign 6",
    title: " Other benign lesions",
  },
];
const malignantLesions = [
  {
    value: "malignant1",
    title: "Melanoma",
    children: [
      {
        value: "children 1",
        title: "Lentigo maligna",
      },
      {
        value: "children 2",
        title: "Lentigo maligna melanoma",
      },
      {
        value: "children 3",
        title: "Superficial spreading melanoma",
      },
      {
        value: "children 4",
        title: "Melanoma in situ",
      },
      {
        value: "children 5",
        title: "Nodular",
      },
      {
        value: "children 6",
        title: "Acral lentiginous melanoma",
      },
      {
        value: "children 7",
        title: "NOS / Other type of MM",
      },
    ],
  },
  {
    value: "malignant2",
    title: "Basal Cell Carcinoma (BCC)",
    children: [
      {
        value: "children1",
        title: "Solid/nodular",
      },
      {
        value: "children2",
        title: "Multicentric/superficial",
      },
      {
        value: "children3",
        title: "Pigmented",
      },
      {
        value: "children4",
        title: "Morpheaform, infiltrating",
      },
      {
        value: "children5",
        title: "Intraepidermal",
      },
      {
        value: "children6",
        title: "Fibroepithelial",
      },
      {
        value: "children7",
        title: "Metatypical",
      },
      {
        value: "children8",
        title: "Other Type of BCC",
      },
    ],
  },
  {
    value: "malignant3",
    title: "Squamous Cell Carcinoma (SCC)",
    children: [
      {
        value: "children11",
        title: "In situr",
      },
      {
        value: "children22",
        title: "Invasive/keratinizing",
      },
      {
        value: "children33",
        title: "Metastatic",
      },
      {
        value: "children44",
        title: "Other type of SCC",
      },
    ],
  },
  {
    value: "malignant4",
    title: "Actinic Keratosis (AK)",
  },
  {
    value: "malignant5",
    title: "Other Malignant Lesions",
  },
];

// Define the type of currentData
interface CurrentData {
  lesion: number;
  eval: number;
  eval1: unknown; // eval1 as an object or null
  eval2: unknown; // eval2 as an object or null
}

export default function EvaluationForm() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();
  const [api, contextHolderNotificationSave] = notification.useNotification();

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
  });

  const [currentData, setCurrentData] = useState<CurrentData>({
    lesion: 1,
    eval: 1,
    eval1: null, // Default object for eval1
    eval2: null, // Default object for eval2
  });

  // Fetch data from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('currentData');
      if (storedData) {
        setCurrentData(JSON.parse(storedData));
      }
    }
  }, []); // This will run only once after the component mounts

  // Sync the currentData with localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentData', JSON.stringify(currentData));
    }
  }, [currentData]); // This will run whenever currentData changes


  useEffect(() => {
    setIsLoading(true);
    fetch("/api/question")
      .then(async (res: Response) => {
        const data = await res.json();
        if (data?.successAll) {
          router.replace("/result");
        }
        setQuestionInfo(data);
      })
      .catch(async (e) => {
        const data = await e.json();

        api.error({
          message: "Get Data Error",
          description: data.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);


  const onSubmit = (values: unknown) => {
    if (currentData.eval === 1) {
      setCurrentData({
        ...currentData, eval: 2, eval1: values
      })
      form.resetFields()
    } else {
      onFinish(values)
      setCurrentData({
        lesion: currentData.lesion + 1,
        eval: 1,
        eval1: null, // Default object for eval1
        eval2: null, // Default object for eval2
      })
    }
  }

  const onFinish = (values: unknown) => {
    setIsLoading(true);
    fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then(async (res: Response) => {
        const data = await res.json();
        if (data?.successAll) {
          router.replace("/result");
          setCurrentData({
            lesion: 1,
            eval: 1,
            eval1: null, // Default object for eval1
            eval2: null, // Default object for eval2
          })
        }
        setQuestionInfo(data);
        form.resetFields();
      })
      .catch(async (e) => {
        const data = await e.json();
        api.success({
          message: "Save error",
          description: data.message,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  const warning = (value: string) => {
    if (value) {
      messageApi.open({
        type: "warning",
        content:
          "IMPORTANT NOTE:  For the MRM Study, Actinic Keratosis (AK) is classified as a “malignant” diagnosis",
      });
    }
  };

  // Recursively disable parent nodes that are not leaves
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processTreeData = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((node: any) => {
      if (node.children) {
        return {
          ...node,
          disabled: true, // Disable parent node
          children: processTreeData(node.children), // Recursively process children
        };
      }
      return node;
    });
  };
  const openNotificationWithIcon = () => {
    api.success({
      message: "Save Success",
      description: "Your evaluation process has been saved successfully.",
    });
  };

  // if (isLoading) return <LoadingPage />;
  return (
    isLoading ? (<LoadingPage />) : (<div className={styles.page}>
      <div className={styles.container}>
        <Image
          alt="background"
          src="bg.png"
          preview={false}
          className={styles.img_header}
        />
        <Fragment>
          <Typography.Title level={3}>
            MRMC Evaluation - Part {currentData.lesion} of 160
          </Typography.Title>
          <Typography.Title level={5}>
            Acc: {questionInfo.doctorName}
          </Typography.Title>
        </Fragment>
        <Divider />
        <Typography.Title level={4}>
          Please provide your diagnosis for the lesion shown below.
        </Typography.Title>

        <Typography className={styles.property_gr}>
          <Typography.Title level={5} className={styles.property}>
            Patient&apos;s Age:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>{questionInfo.patientAge}</Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={5} className={styles.property}>
            Patient&apos;s Gender:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>{questionInfo.patientGender}</Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={5} className={styles.property}>
            Location of the lesion:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>{questionInfo.lesionLocation}</Typography.Text>
        </Typography>

        <Typography className={styles.property_gr}>
          <Typography.Title level={5} className={styles.property}>
            Lesion size:
          </Typography.Title>
          <Typography.Text className={styles.property_value}>{questionInfo.lesionSize}</Typography.Text>
        </Typography>

        <Form onFinish={onSubmit} form={form} className={styles.form_style} initialValues={{ confidenceBenign: "1", confidenceMalignant: "51" }}>
          {contextHolder}
          {contextHolderNotificationSave}

          <Typography className={styles.img_gr}>
            {currentData.eval === 2 ? (<Image
              src={`${questionInfo.lesionAuraResultScreen}.jpg`}
              className={styles.img}
            />) : (<div className={styles.note_not_img}>
              <span>
                Please do not zoom the lesion picture in or out.
                <br />
                The default web zoom setting is at 100%,
                <br /> please do not change it.
              </span>
            </div>)}


            <Image src={`${questionInfo.lesionPicture}.jpg`} className={styles.img} />
          </Typography>

          <Form.Item
            name="choose"
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
            >
              <Option value="benign">Benign</Option>
              <Option value="malignant">Malignant</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.choose !== currentValues.choose
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("choose") === "benign" ? (
                <>
                  <Form.Item
                    name="confidenceBenign"
                    label={`Lesion ${currentData.lesion} of 160: Benign Diagnosis - Confidence Level`}
                    rules={[{ required: true, message: "" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Slider
                      marks={marksBenign}
                      min={1}
                      max={50}
                      step={1}
                      tooltip={{ open: true }}
                      className={styles.slider_style}
                    />
                  </Form.Item>
                  <Form.Item
                    name="lesionBenign"
                    label={`Lesion ${currentData.lesion} of 160: Benign Diagnosis - Lesion Type`}
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    valuePropName="select"
                  >
                    <TreeSelect
                      showSearch
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto", zIndex: 9999, }}
                      placeholder="Please select"
                      allowClear
                      // treeDefaultExpandAll
                      treeData={processTreeData(benignLesions)}
                    />
                  </Form.Item>
                  {currentData.eval === 2 ? (<><Form.Item
                    name="checkBenign "
                    label="Did the AURA Slider bar position affect your diagnostic decision?"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Radio.Group>
                      <Radio value="yes">Yes</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </Form.Item>

                    <Form.Item
                      name="confidenceBenignCheck"
                      label="Did the AURA slider bar position affect the confidence level of your decision?"
                      rules={[
                        { required: true, message: "This field is required" },
                      ]}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Radio.Group>
                        <Radio value="MoreConfident">More confident</Radio>
                        <Radio value="LessConfident">Less confident</Radio>
                        <Radio value="NoEffect">No effect</Radio>
                      </Radio.Group>
                    </Form.Item></>) : null}
                </>
              ) : getFieldValue("choose") === "malignant" ? (
                <>
                  <Form.Item
                    name="confidenceMalignant"
                    label={`Lesion ${currentData.lesion} of 160: Malignant Diagnosis - Confidence Level`}
                    rules={[{ required: true, message: "" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Slider
                      marks={marksMalignant}
                      min={51}
                      max={100}
                      step={1}
                      tooltip={{ open: true }}
                      className={styles.slider_style}
                    />
                  </Form.Item>
                  <Form.Item
                    name="lesionMalignant"
                    label={`Lesion ${currentData.lesion} of 160: Malignant Diagnosis - Lesion Type`}
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    valuePropName="select"
                  >
                    <TreeSelect
                      showSearch
                      style={{ width: "100%" }}
                      dropdownStyle={{ maxHeight: 400, overflow: "auto", zIndex: 9999, }}
                      placeholder="Please select"
                      allowClear
                      // treeDefaultExpandAll
                      treeData={processTreeData(malignantLesions)}
                    />
                  </Form.Item>
                  {currentData.eval === 2 ? (<><Form.Item
                    name="checkMalignant"
                    label="Did the AURA Slider bar position affect your diagnostic decision?"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Radio.Group>
                      <Radio value="yes">Yes</Radio>
                      <Radio value="no">No</Radio>
                    </Radio.Group>
                  </Form.Item>

                    <Form.Item
                      name="confidenceMalignantCheck"
                      label="Did the AURA slider bar position affect the confidence level of your decision?"
                      rules={[
                        { required: true, message: "This field is required" },
                      ]}
                      labelCol={{ span: 24 }}
                      wrapperCol={{ span: 24 }}
                    >
                      <Radio.Group>
                        <Radio value="MoreConfident">More confident</Radio>
                        <Radio value="LessConfident">Less confident</Radio>
                        <Radio value="NoEffect">No effect</Radio>
                      </Radio.Group>
                    </Form.Item></>) : null}

                </>
              ) : null
            }
          </Form.Item>
          <Button htmlType="submit" className={styles.btn}>
            NEXT
          </Button>
        </Form>
        <FloatButton
          icon={<FileTextOutlined />}
          description="SAVE"
          type="primary"
          // shape="circle"
          style={{ insetInlineEnd: 14, height: 50, width: 50 }}
          onClick={openNotificationWithIcon}
          shape="square"
        />
      </div>
    </div>
    )
  );
}
