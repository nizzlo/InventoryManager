'use client'

import { useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input,
  message,
  Space,
  Typography,
  Popconfirm,
  Card,
  Divider
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/AppLayout'

const { Title } = Typography

interface Location {
  id: number
  name: string
}

interface CreateLocationData {
  name: string
}

export default function ConfigPage() {
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Fetch locations
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Location[]> => {
      const response = await fetch('/api/locations')
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }
      return response.json()
    },
  })

  // Create/Update location mutation
  const locationMutation = useMutation({
    mutationFn: async (data: CreateLocationData): Promise<Location> => {
      const url = editingLocation ? `/api/locations/${editingLocation.id}` : '/api/locations'
      const method = editingLocation ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save location')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] }) // Invalidate balances when locations change
      message.success(editingLocation ? 'Location updated successfully!' : 'Location created successfully!')
      setIsLocationModalVisible(false)
      setEditingLocation(null)
      form.resetFields()
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number): Promise<void> => {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete location')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] }) // Invalidate balances when locations are deleted
      message.success('Location deleted successfully!')
    },
    onError: (error: Error) => {
      message.error(error.message)
    },
  })

  const handleSubmit = async (values: CreateLocationData) => {
    locationMutation.mutate(values)
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    form.setFieldsValue({ name: location.name })
    setIsLocationModalVisible(true)
  }

  const handleDelete = (locationId: number) => {
    deleteLocationMutation.mutate(locationId)
  }

  const handleModalCancel = () => {
    setIsLocationModalVisible(false)
    setEditingLocation(null)
    form.resetFields()
  }

  const locationColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Location) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete Location"
            description="Are you sure you want to delete this location? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <AppLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Title level={2}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            Configuration Manager
          </Title>
        </div>

        {/* Locations Section */}
        <Card 
          title="Location Management" 
          style={{ marginBottom: '24px' }}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsLocationModalVisible(true)}
            >
              Add Location
            </Button>
          }
        >
          <Table
            columns={locationColumns}
            dataSource={locations}
            rowKey="id"
            loading={locationsLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} locations`,
            }}
          />
        </Card>

        {/* Future sections can be added here */}
        <Card title="Coming Soon" style={{ opacity: 0.6 }}>
          <p>Additional configuration options will be added here in future updates:</p>
          <ul>
            <li>User Management</li>
            <li>System Settings</li>
            <li>Data Import/Export</li>
            <li>Backup & Restore</li>
          </ul>
        </Card>
      </div>

      {/* Location Modal */}
      <Modal
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
        open={isLocationModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            label="Location Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter location name' },
              { min: 1, message: 'Location name must be at least 1 character' },
              { max: 100, message: 'Location name must be 100 characters or less' },
            ]}
          >
            <Input placeholder="Enter location name" autoFocus />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={locationMutation.isPending}
              >
                {editingLocation ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  )
}
