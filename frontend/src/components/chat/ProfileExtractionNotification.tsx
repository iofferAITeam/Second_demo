'use client'

import React, { useState } from 'react'
import { Modal, Button, Tag, Space, Typography, Alert } from 'antd'
import { UserOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

interface ExtractedData {
  gpa?: number
  major?: string
  currentEducation?: string
  graduationDate?: string
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  nationality?: string
  goals?: string
  experiences?: string[]
}

interface ProfileExtractionNotificationProps {
  visible: boolean
  extractedData: ExtractedData
  confidence: number
  onConfirm: (confirmed: boolean, data: ExtractedData) => void
  onCancel: () => void
}

export default function ProfileExtractionNotification({
  visible,
  extractedData,
  confidence,
  onConfirm,
  onCancel
}: ProfileExtractionNotificationProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async (confirmed: boolean) => {
    setLoading(true)
    try {
      await onConfirm(confirmed, extractedData)
    } finally {
      setLoading(false)
    }
  }

  const formatFieldName = (key: string): string => {
    const fieldNames: { [key: string]: string } = {
      gpa: 'GPA成绩',
      major: '专业',
      currentEducation: '当前教育阶段',
      graduationDate: '毕业时间',
      toefl: 'TOEFL成绩',
      ielts: 'IELTS成绩',
      gre: 'GRE成绩',
      gmat: 'GMAT成绩',
      nationality: '国籍',
      goals: '留学目标',
      experiences: '经历'
    }
    return fieldNames[key] || key
  }

  const formatValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }
    if (key === 'graduationDate') {
      return new Date(value).toLocaleDateString()
    }
    return String(value)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success'
    if (confidence >= 0.6) return 'warning'
    return 'error'
  }

  const extractedFields = Object.entries(extractedData).filter(
    ([_, value]) => value !== undefined && value !== null && value !== ''
  )

  return (
    <Modal
      title={
        <Space>
          <UserOutlined className="text-blue-500" />
          <span>发现个人资料信息</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="profile-extraction-modal"
    >
      <div className="space-y-4">
        {/* 置信度指示器 */}
        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              <Text>
                AI识别置信度: {Math.round(confidence * 100)}%
                {confidence >= 0.8 && <Text type="success"> (高准确度)</Text>}
                {confidence < 0.8 && confidence >= 0.6 && <Text type="warning"> (中等准确度)</Text>}
                {confidence < 0.6 && <Text type="danger"> (低准确度，请仔细核对)</Text>}
              </Text>
            </Space>
          }
          type="info"
          showIcon
        />

        {/* 提取的信息列表 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Text strong>从您的消息中识别到以下信息：</Text>
          <div className="mt-3 space-y-2">
            {extractedFields.map(([key, value]) => (
              <div key={key} className="flex items-start justify-between py-2 border-b border-gray-200 last:border-b-0">
                <Text className="font-medium text-gray-700 min-w-[100px]">
                  {formatFieldName(key)}:
                </Text>
                <div className="flex-1 ml-4">
                  <Tag color={getConfidenceColor(confidence)}>
                    {formatValue(key, value)}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 说明文字 */}
        <Paragraph className="text-sm text-gray-600">
          <InfoCircleOutlined className="mr-2" />
          这些信息将用于完善您的个人资料，帮助AI提供更精准的留学建议。您可以选择确认添加或忽略这次提取。
        </Paragraph>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel}>
            暂时忽略
          </Button>
          <Button
            type="default"
            onClick={() => handleConfirm(false)}
            disabled={loading}
          >
            不准确
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirm(true)}
            loading={loading}
          >
            确认添加到资料
          </Button>
        </div>
      </div>
    </Modal>
  )
}