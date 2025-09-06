'use client'

import { useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  message,
  Space,
  Typography,
  Popconfirm,
  Tooltip,
  Upload,
  Image 
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/AppLayout'
import styles from './items.module.css'

const { Title } = Typography

interface Item {
  id: number
  sku: string
  name: string
  category?: string
  uom: string
  barcode?: string
  minQty: string
  imageUrl?: string
  createdAt: string
}

interface CreateItemData {
  sku: string
  name: string
  category?: string
  uom: string
  barcode?: string
  minQty: number
  imageUrl?: string
}

export default function ItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [uploading, setUploading] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Fetch items
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async (): Promise<Item[]> => {
      const response = await fetch('/api/items')
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      return response.json()
    },
  })

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: CreateItemData): Promise<Item> => {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Create a more detailed error message
        let errorMessage = errorData.message || errorData.error || `Failed to ${editingItem ? 'update' : 'create'} item`
        
        // If there are validation details, include them
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors = errorData.details.map((detail: any) => 
            `${detail.field}: ${detail.message}`
          ).join('\n')
          errorMessage = `Validation errors:\n${fieldErrors}`
        }
        
        const error = new Error(errorMessage)
        // Attach additional error data
        ;(error as any).status = response.status
        ;(error as any).field = errorData.field
        ;(error as any).details = errorData.details
        throw error
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      message.success(`Item ${editingItem ? 'updated' : 'created'} successfully!`)
      setIsModalOpen(false)
      setEditingItem(null)
      form.resetFields()
    },
    onError: (error: any) => {
      // Handle different types of errors with appropriate messages
      if (error.status === 400) {
        // Validation or bad request errors
        if (error.details && Array.isArray(error.details)) {
          // Show validation errors in a more user-friendly way
          error.details.forEach((detail: any) => {
            message.error(`${detail.field}: ${detail.message}`)
          })
        } else {
          message.error(error.message)
        }
      } else if (error.status === 409) {
        // Conflict errors (like duplicate SKU/barcode)
        message.error(error.message)
      } else if (error.status === 500) {
        // Server errors
        message.error(`Server error: ${error.message}`)
      } else {
        // Generic error fallback
        message.error(`Failed to ${editingItem ? 'update' : 'create'} item: ${error.message}`)
      }
    },
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete item')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      message.success('Item deleted successfully!')
    },
    onError: (error) => {
      message.error(`Failed to delete item: ${error.message}`)
    },
  })

  const handleSubmit = (values: CreateItemData) => {
    // Clean up null/undefined values before sending to API
    const cleanedValues = {
      ...values,
      category: values.category || undefined,
      barcode: values.barcode || undefined,
      imageUrl: values.imageUrl || undefined,
    }
    createItemMutation.mutate(cleanedValues)
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    form.setFieldsValue({
      sku: item.sku,
      name: item.name,
      category: item.category,
      uom: item.uom,
      barcode: item.barcode,
      minQty: parseFloat(item.minQty),
      imageUrl: item.imageUrl,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteItemMutation.mutate(id)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    form.resetFields()
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      form.setFieldsValue({ imageUrl: result.imageUrl })
      message.success('Image uploaded successfully!')
    } catch (error: any) {
      message.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string, record: Item) => (
        <div className={styles.imageCell}>
          {imageUrl ? (
            <div style={{ position: 'relative' }}>
              <img
                width={60}
                height={60}
                src={imageUrl}
                alt={`${record.name} image`}
                className={styles.itemImage}
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl)
                  // Prevent infinite loops by checking if we're already showing placeholder
                  if (!e.currentTarget.src.includes('/api/placeholder/')) {
                    e.currentTarget.src = '/api/placeholder/60/60'
                  }
                }}
                onClick={() => {
                  // Simple preview using Ant Design Modal
                  const modal = document.createElement('div')
                  modal.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
                      <img src="${imageUrl}" style="max-width: 90%; max-height: 90%; border-radius: 8px;" />
                    </div>
                  `
                  document.body.appendChild(modal)
                }}
                style={{ cursor: 'pointer', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div className={styles.noImagePlaceholder}>
              No Image
            </div>
          )}
        </div>
      ),
      width: 90,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a: Item, b: Item) => a.sku.localeCompare(b.sku),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Item, b: Item) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || '-',
    },
    {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      render: (barcode: string) => barcode || '-',
    },
    {
      title: 'Min Qty',
      dataIndex: 'minQty',
      key: 'minQty',
      render: (minQty: string) => parseFloat(minQty).toFixed(2),
      sorter: (a: Item, b: Item) => parseFloat(a.minQty) - parseFloat(b.minQty),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Item, b: Item) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Item) => (
        <Space>
          <Tooltip title="Edit item">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Tooltip title="Delete item">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={deleteItemMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: 'right' as const,
    },
  ]

  if (error) {
    return (
      <AppLayout>
        <div>Error loading items: {error.message}</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Items</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Item
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          className={styles.itemsTable}
        />

        <Modal
          title={editingItem ? 'Edit Item' : 'Add New Item'}
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              uom: 'pcs',
              minQty: 0,
            }}
          >
            <Form.Item
              label="SKU"
              name="sku"
              rules={[
                { required: true, message: 'SKU is required' },
                { max: 50, message: 'SKU must be 50 characters or less' },
                { pattern: /^[A-Za-z0-9\-_]+$/, message: 'SKU can only contain letters, numbers, hyphens, and underscores' }
              ]}
            >
              <Input placeholder="Enter SKU (letters, numbers, -, _)" />
            </Form.Item>

            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: 'Item name is required' },
                { max: 255, message: 'Item name must be 255 characters or less' }
              ]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[
                { max: 100, message: 'Category must be 100 characters or less' }
              ]}
            >
              <Input placeholder="Enter category (optional)" />
            </Form.Item>

            <Form.Item
              label="Unit of Measure"
              name="uom"
              rules={[
                { required: true, message: 'Unit of measure is required' },
                { max: 20, message: 'Unit of measure must be 20 characters or less' }
              ]}
            >
              <Input placeholder="e.g., pcs, kg, liters" />
            </Form.Item>

            <Form.Item
              label="Barcode"
              name="barcode"
              rules={[
                { max: 100, message: 'Barcode must be 100 characters or less' }
              ]}
            >
              <Input placeholder="Enter barcode (optional)" />
            </Form.Item>

            <Form.Item
              label="Minimum Quantity"
              name="minQty"
              rules={[
                { required: true, message: 'Minimum quantity is required' },
                { type: 'number', min: 0, message: 'Minimum quantity cannot be negative' },
                { type: 'number', max: 999999999, message: 'Minimum quantity is too large' }
              ]}
            >
              <InputNumber
                min={0}
                max={999999999}
                style={{ width: '100%' }}
                placeholder="Enter minimum quantity"
              />
            </Form.Item>

            <Form.Item
              label="Product Image"
              name="imageUrl"
              rules={[
                { max: 500, message: 'Image URL must be 500 characters or less' }
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file)
                    return false // Prevent default upload
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </Upload>
                <Form.Item name="imageUrl" noStyle>
                  <Input placeholder="Image URL (will be filled automatically)" disabled />
                </Form.Item>
                {form.getFieldValue('imageUrl') && (
                  <div style={{ marginTop: 8 }}>
                    <Image
                      width={100}
                      height={100}
                      src={form.getFieldValue('imageUrl')}
                      alt="Preview"
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  </div>
                )}
              </Space>
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={createItemMutation.isPending}
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  )
}
