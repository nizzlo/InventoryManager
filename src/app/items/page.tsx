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
  Tooltip 
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/AppLayout'

const { Title } = Typography

interface Item {
  id: number
  sku: string
  name: string
  category?: string
  uom: string
  barcode?: string
  minQty: string
  createdAt: string
}

interface CreateItemData {
  sku: string
  name: string
  category?: string
  uom: string
  barcode?: string
  minQty: number
}

export default function ItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
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
        throw new Error(`Failed to ${editingItem ? 'update' : 'create'} item`)
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
    onError: (error) => {
      message.error(`Failed to ${editingItem ? 'update' : 'create'} item: ${error.message}`)
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
    createItemMutation.mutate(values)
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

  const columns = [
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
              rules={[{ required: true, message: 'Please enter SKU' }]}
            >
              <Input placeholder="Enter SKU" />
            </Form.Item>

            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
            >
              <Input placeholder="Enter category (optional)" />
            </Form.Item>

            <Form.Item
              label="Unit of Measure"
              name="uom"
              rules={[{ required: true, message: 'Please enter UoM' }]}
            >
              <Input placeholder="e.g., pcs, kg, liters" />
            </Form.Item>

            <Form.Item
              label="Barcode"
              name="barcode"
            >
              <Input placeholder="Enter barcode (optional)" />
            </Form.Item>

            <Form.Item
              label="Minimum Quantity"
              name="minQty"
              rules={[{ required: true, message: 'Please enter minimum quantity' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Enter minimum quantity"
              />
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
