'use client';  // Add this line to make this a Client Component

import React, { Fragment, useState } from 'react';
import styles from "./page.module.css";
import { Button, Divider, Form, Input, Typography, Select, SliderSingleProps, Slider, TreeSelect, Radio, message } from 'antd';
import { Image } from 'antd';
import type { TreeSelectProps, RadioChangeEvent } from 'antd';

const { Option } = Select;

const marksBenign: SliderSingleProps['marks'] = {
  1: {
    style: {
      color: '#086f0f',
    },
    label: <strong className={styles.note_slide}>High confidence Benign</strong>,
  },
  50: {
    style: {
      color: '#9c9006',
    },
    label: <strong className={styles.note_slide}>Low confidence Benign</strong>,
  },
};
const marksMalignant: SliderSingleProps['marks'] = {
  51: {
    style: {
      color: '#9c9006',
    },
    label: <strong className={styles.note_slide}>Low confidence Malignant </strong>,
  },
  100: {
    style: {
      color: 'red',
    },
    label: <strong className={styles.note_slide}>High confidence Malignant </strong>,
  },
};

const benignLesions = [
  {
    value: 'benign 1',
    title: 'Seborrheic Keratosis (SK)',
    children: [
      {
        value: 'children 7',
        title: 'children',

      },

    ],
  },
  {
    value: 'benign 2',
    title: 'Nevus',
    children: [
      {
        value: 'children 2',
        title: 'children',

      },

    ],
  },
  {
    value: 'benign 3',
    title: 'Dermatofibroma',
    children: [
      {
        value: 'children 1',
        title: 'children',

      },

    ],
  },
  {
    value: 'benign 4',
    title: 'Warts',

  },
  {
    value: 'benign 5',
    title: 'Sebaceous Hyperplasia',
  },
  {
    value: 'benign 6',
    title: ' Other benign lesions',
  },

];
const malignantLesions = [
  {
    value: 'malignant1',
    title: 'Melanoma',
    children: [
      {
        value: 'children 1',
        title: 'Lentigo maligna',

      },
      {
        value: 'children 2',
        title: 'Lentigo maligna melanoma',

      },
      {
        value: 'children 3',
        title: 'Superficial spreading melanoma',

      },
      {
        value: 'children 4',
        title: 'Melanoma in situ',

      },
      {
        value: 'children 5',
        title: 'Nodular',

      },
      {
        value: 'children 6',
        title: 'Acral lentiginous melanoma',

      },
      {
        value: 'children 7',
        title: 'NOS / Other type of MM',

      },

    ],

  },
  {
    value: 'malignant2',
    title: 'Basal Cell Carcinoma (BCC)',
    children: [
      {
        value: 'children1',
        title: 'Solid/nodular',

      },
      {
        value: 'children2',
        title: 'Multicentric/superficial',

      },
      {
        value: 'children3',
        title: 'Pigmented',

      },
      {
        value: 'children4',
        title: 'Morpheaform, infiltrating',

      },
      {
        value: 'children5',
        title: 'Intraepidermal',

      },
      {
        value: 'children6',
        title: 'Fibroepithelial',

      },
      {
        value: 'children7',
        title: 'Metatypical',

      },
      {
        value: 'children8',
        title: 'Other Type of BCC',

      },

    ],

  }, {
    value: 'malignant3',
    title: 'Squamous Cell Carcinoma (SCC)',
    children: [
      {
        value: 'children11',
        title: 'In situr',

      },
      {
        value: 'children22',
        title: 'Invasive/keratinizing',

      },
      {
        value: 'children33',
        title: 'Metastatic',

      },
      {
        value: 'children44',
        title: 'Other type of SCC',

      },
    ],

  }, {
    value: 'malignant4',
    title: 'Actinic Keratosis (AK)',

  }, {
    value: 'malignant5',
    title: 'Other Malignant Lesions',

  }
];

export default function EvaluationForm() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [valueBenign, setValueBenign] = useState<string>();
  const [valueMalignant, setValueMalignant] = useState<string>();

  const [valueCheck, setValueCheck] = useState<string>();


  const onFinish = (values: any) => {
    console.log(values);
  };
  const warning = (value: string) => {
    if (value) {
      messageApi.open({
        type: 'warning',
        content: 'IMPORTANT NOTE:  For the MRM Study, Actinic Keratosis (AK) is classified as a “malignant” diagnosis',
      });
    }

  };

  const onChangeBenign = (newValue: string) => {
    setValueBenign(newValue);
  };
  const onChangeMalignant = (newValue: string) => {
    setValueMalignant(newValue);
  };

  const onPopupScroll: TreeSelectProps['onPopupScroll'] = (e) => {
    console.log('onPopupScroll', e);
  };


  const onCheck = (e: RadioChangeEvent) => {
    setValueCheck(e.target.value)
    form.setFieldsValue({ checkMalignant: e.target.value });
  };

  // Recursively disable parent nodes that are not leaves
  const processTreeData = (data: any) => {
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
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Image
          src="bg.png" preview={false}
          className={styles.img_header}
        />
        <Fragment>
          <Typography.Title level={3}>
            MRMC Evaluation - Part 3 of 10
          </Typography.Title>
          <Typography.Title level={5}>
            Acc: Thuy hoang
          </Typography.Title>
        </Fragment>
        <Divider />
        <Form onFinish={onFinish} form={form} className={styles.form_style} >
          {contextHolder}
          <Typography.Title level={4}>
            Please provide your diagnosis for the lesion shown below.
          </Typography.Title>
          <Typography.Title level={5}>
            Patient's Age: 60
          </Typography.Title>
          <Typography.Title level={5}>
            Patient's Gender: Male
          </Typography.Title>
          <Image
            src="demo.jpg"
          />
          <Form.Item name="choose" label="" rules={[{ required: true, message: "This field is required" }]} className={styles.form_item}>
            <Select
              placeholder="Choose"
              allowClear
              onChange={warning}
            >
              <Option value="benign" >Benign</Option>
              <Option value="malignant" >Malignant</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.choose !== currentValues.choose}
          >
            {({ getFieldValue }) =>
              getFieldValue('choose') === 'benign' ? (
                <>
                  <Form.Item
                    name="confidenceBenign"
                    label="Part 3 of 10, lesion 1 of 16: Benign Diagnosis - Confidence Level"
                    rules={[{ required: true, message: "This field is required" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <Slider range marks={marksBenign} min={1} max={50} step={5} />
                  </Form.Item>
                  <Form.Item
                    name="lesionBenign"
                    label="Part 3 of 10, lesion 2 of 16: Benign Diagnosis - Lesion Type"
                    rules={[{ required: true, message: "This field is required" }]}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                  >
                    <TreeSelect
                      showSearch
                      style={{ width: '100%' }}
                      value={valueBenign}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      placeholder="Please select"
                      allowClear
                      treeDefaultExpandAll
                      onChange={onChangeBenign}
                      treeData={processTreeData(benignLesions)}
                      onPopupScroll={onPopupScroll}
                    />
                  </Form.Item>
                </>

              ) : getFieldValue('choose') === 'malignant' ? (<>
                <Form.Item
                  name="confidenceMalignant"
                  label="Part 3 of 10, lesion 2 of 16: Malignant Diagnosis - Confidence Level"
                  rules={[{ required: true, message: "This field is required" }]}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Slider range marks={marksMalignant} min={51} max={100} step={5} />
                </Form.Item>
                <Form.Item
                  name="lesionMalignant"
                  label="Part 3 of 10, lesion 2 of 16: Malignant Diagnosis - Lesion Type"
                  rules={[{ required: true, message: "This field is required" }]}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <TreeSelect
                    showSearch
                    style={{ width: '100%' }}
                    value={valueMalignant}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="Please select"
                    allowClear
                    treeDefaultExpandAll
                    onChange={onChangeMalignant}
                    treeData={processTreeData(malignantLesions)}
                    onPopupScroll={onPopupScroll}
                  />
                </Form.Item>
                <Form.Item
                  name="checkMalignant"
                  label="Have you considered the slider-bar position when making your diagnostic decision?"
                  rules={[{ required: true, message: "This field is required" }]}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Radio.Group
                    onChange={onCheck}
                    value={valueCheck}
                    options={[
                      { value: "yes", label: 'Yes' },
                      { value: "no", label: 'No' },

                    ]}
                  />
                </Form.Item>
              </>
              ) : null
            }
          </Form.Item>
          <Button htmlType="submit" className={styles.btn}>
            NEXT
          </Button>
        </Form>

      </div>
    </div>
  );
}
