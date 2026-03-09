import React, { useEffect, useState } from 'react';
import { Form, Input, Radio, Checkbox, Space, Collapse, Tabs } from 'antd';
import MediaUpload from './MediaUpload';
import type { DeviceResearchController, MediaAttachment } from '../../types/device';

interface ControllerInfoTabProps {
  initialValues?: DeviceResearchController;
  onSave?: (data: DeviceResearchController) => void;
  loading?: boolean;
  disabled?: boolean;
}

const ControllerInfoTab: React.FC<ControllerInfoTabProps> = ({
  initialValues,
  onSave,
  loading = false,
  disabled = false,
}) => {
  const [form] = Form.useForm();

  // 多媒体附件状态
  const [controllerPhotos, setControllerPhotos] = useState<MediaAttachment[]>(initialValues?.controllerPhotos || []);
  const [controllerVideos, setControllerVideos] = useState<MediaAttachment[]>(initialValues?.controllerVideos || []);
  const [touchscreenPhotos, setTouchscreenPhotos] = useState<MediaAttachment[]>(initialValues?.touchscreenPhotos || []);
  const [touchscreenVideos, setTouchscreenVideos] = useState<MediaAttachment[]>(initialValues?.touchscreenVideos || []);
  const [cabinetPhotos, setCabinetPhotos] = useState<MediaAttachment[]>(initialValues?.cabinetPhotos || []);
  const [cabinetVideos, setCabinetVideos] = useState<MediaAttachment[]>(initialValues?.cabinetVideos || []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        isInterfaceOccupied: initialValues.isInterfaceOccupied,
        interfaceType: initialValues.interfaceType,
        hasTouchScreen: initialValues.hasTouchScreen,
        controllerBrand: initialValues.controllerBrand,
        controllerModel: initialValues.controllerModel,
        hasPointTable: initialValues.hasPointTable,
        hasPlcSource: initialValues.hasPlcSource,
        hasTouchScreenSource: initialValues.hasTouchScreenSource,
      });

      // 设置多媒体附件
      setControllerPhotos(initialValues.controllerPhotos || []);
      setControllerVideos(initialValues.controllerVideos || []);
      setTouchscreenPhotos(initialValues.touchscreenPhotos || []);
      setTouchscreenVideos(initialValues.touchscreenVideos || []);
      setCabinetPhotos(initialValues.cabinetPhotos || []);
      setCabinetVideos(initialValues.cabinetVideos || []);
    }
  }, [initialValues, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data: DeviceResearchController = {
        isInterfaceOccupied: values.isInterfaceOccupied,
        interfaceType: values.interfaceType,
        hasTouchScreen: values.hasTouchScreen,
        controllerBrand: values.controllerBrand,
        controllerModel: values.controllerModel,
        hasPointTable: values.hasPointTable || false,
        hasPlcSource: values.hasPlcSource || false,
        hasTouchScreenSource: values.hasTouchScreenSource || false,
        // 包含多媒体附件
        controllerPhotos,
        controllerVideos,
        touchscreenPhotos,
        touchscreenVideos,
        cabinetPhotos,
        cabinetVideos,
      };
      onSave?.(data);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      autoComplete="off"
    >
      <Form.Item
        label="接口是否被占用"
        name="isInterfaceOccupied"
        rules={[{ required: true, message: '请选择接口是否被占用' }]}
      >
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="控制器接口类型"
        name="interfaceType"
        rules={[{ required: true, message: '请选择控制器接口类型' }]}
      >
        <Radio.Group>
          <Radio value="serial">串口</Radio>
          <Radio value="network">网口</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="是否连接触摸屏"
        name="hasTouchScreen"
        rules={[{ required: true, message: '请选择是否连接触摸屏' }]}
      >
        <Radio.Group>
          <Radio value={true}>是</Radio>
          <Radio value={false}>否</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        label="控制器品牌"
        name="controllerBrand"
        rules={[{ required: true, message: '请输入控制器品牌' }]}
      >
        <Input placeholder="请输入控制器品牌" />
      </Form.Item>

      <Form.Item
        label="控制器型号"
        name="controllerModel"
      >
        <Input placeholder="请输入控制器型号" />
      </Form.Item>

      <Form.Item label="提供的资料">
        <Space direction="vertical">
          <Form.Item name="hasPointTable" valuePropName="checked" noStyle>
            <Checkbox>是否提供点位表</Checkbox>
          </Form.Item>
          <Form.Item name="hasPlcSource" valuePropName="checked" noStyle>
            <Checkbox>是否提供PLC源程序</Checkbox>
          </Form.Item>
          <Form.Item name="hasTouchScreenSource" valuePropName="checked" noStyle>
            <Checkbox>是否提供触摸屏源程序</Checkbox>
          </Form.Item>
        </Space>
      </Form.Item>

      {/* 多媒体资料上传 */}
      <Collapse
        items={[
          {
            key: 'multimedia',
            label: '多媒体资料（照片/视频）',
            children: (
              <Tabs
                defaultActiveKey="controller"
                items={[
                  {
                    key: 'controller',
                    label: '控制器',
                    children: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item label="控制器照片" style={{ marginBottom: 16 }}>
                          <MediaUpload
                            value={controllerPhotos}
                            onChange={setControllerPhotos}
                            acceptType="image"
                            maxCount={10}
                            disabled={disabled}
                          />
                        </Form.Item>
                        <Form.Item label="控制器视频" style={{ marginBottom: 0 }}>
                          <MediaUpload
                            value={controllerVideos}
                            onChange={setControllerVideos}
                            acceptType="video"
                            maxCount={5}
                            disabled={disabled}
                            maxSize={50}
                          />
                        </Form.Item>
                      </Space>
                    ),
                  },
                  {
                    key: 'touchscreen',
                    label: '触摸屏',
                    children: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item label="触摸屏照片" style={{ marginBottom: 16 }}>
                          <MediaUpload
                            value={touchscreenPhotos}
                            onChange={setTouchscreenPhotos}
                            acceptType="image"
                            maxCount={10}
                            disabled={disabled}
                          />
                        </Form.Item>
                        <Form.Item label="触摸屏视频" style={{ marginBottom: 0 }}>
                          <MediaUpload
                            value={touchscreenVideos}
                            onChange={setTouchscreenVideos}
                            acceptType="video"
                            maxCount={5}
                            disabled={disabled}
                            maxSize={50}
                          />
                        </Form.Item>
                      </Space>
                    ),
                  },
                  {
                    key: 'cabinet',
                    label: '控制柜',
                    children: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item label="控制柜照片" style={{ marginBottom: 16 }}>
                          <MediaUpload
                            value={cabinetPhotos}
                            onChange={setCabinetPhotos}
                            acceptType="image"
                            maxCount={10}
                            disabled={disabled}
                          />
                        </Form.Item>
                        <Form.Item label="控制柜视频" style={{ marginBottom: 0 }}>
                          <MediaUpload
                            value={cabinetVideos}
                            onChange={setCabinetVideos}
                            acceptType="video"
                            maxCount={5}
                            disabled={disabled}
                            maxSize={50}
                          />
                        </Form.Item>
                      </Space>
                    ),
                  },
                ]}
              />
            ),
          },
        ]}
      />

      <Form.Item>
        <Space>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '6px 16px',
              background: loading ? '#d9d9d9' : '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '保存中...' : '保存控制器信息'}
          </button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ControllerInfoTab;