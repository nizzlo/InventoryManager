'use client'

import { useState } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  InputNumber, 
  Input,
  message,
  Space,
  Typography,
  Tag 
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/AppLayout'

const { Title } = Typography
const { Option } = Select

interface Item {
  id: number
  sku: string
  name: string
}

interface Location {
  id: number
  name: string
}

interface InventoryMove {
  id: number
  type: 'IN' | 'OUT' | 'ADJUST'
  qty: string
  unitCost?: string
  ref?: string
  note?: string
  movedAt: string
  userName?: string
  item: Item
  location: Location
}

interface CreateMoveData {
  itemId: number
  locationId: number
  type: 'IN' | 'OUT' | 'ADJUST'
  qty: number
  unitCost?: number
  ref?: string
  note?: string
  userName?: string
}

export default function MovesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Fetch moves
  const { data: moves, isLoading: movesLoading } = useQuery({
    queryKey: ['moves'],
    queryFn: async (): Promise<InventoryMove[]> => {
      const response = await fetch('/api/moves')
      if (!response.ok) {
        throw new Error('Failed to fetch moves')
      }
      return response.json()
    },
  })

  // Fetch items for dropdown
  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async (): Promise<Item[]> => {
      const response = await fetch('/api/items')
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      return response.json()
    },
  })

  // Fetch locations for dropdown
  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Location[]> => {
      const response = await fetch('/api/locations')
      if (!response.ok) {
        throw new Error('Failed to fetch locations')
      }
      return response.json()
    },
  })

  // Create move mutation
  const createMoveMutation = useMutation({
    mutationFn: async (data: CreateMoveData): Promise<InventoryMove> => {
      const response = await fetch('/api/moves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error('Failed to create move')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      message.success('Stock move recorded successfully!')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error(`Failed to record move: ${error.message}`)
    },
  })

  const handleSubmit = (values: CreateMoveData) => {
    createMoveMutation.mutate({
      ...values,
      userName: 'Current User', // In a real app, get from auth context
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'green'
      case 'OUT':
        return 'red'
      case 'ADJUST':
        return 'orange'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: 'Date',
      dataIndex: 'movedAt',
      key: 'movedAt',
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: InventoryMove, b: InventoryMove) => 
        new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Item',
      key: 'item',
      render: (record: InventoryMove) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.item.sku}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.item.name}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: ['location', 'name'],
      key: 'location',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getTypeColor(type)}>{type}</Tag>
      ),
      filters: [
        { text: 'IN', value: 'IN' },
        { text: 'OUT', value: 'OUT' },
        { text: 'ADJUST', value: 'ADJUST' },
      ],
      onFilter: (value: any, record: InventoryMove) => record.type === value,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      render: (qty: string) => parseFloat(qty).toFixed(2),
      sorter: (a: InventoryMove, b: InventoryMove) => 
        parseFloat(a.qty) - parseFloat(b.qty),
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unitCost',
      key: 'unitCost',
      render: (cost: string) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
    },
    {
      title: 'Reference',
      dataIndex: 'ref',
      key: 'ref',
      render: (ref: string) => ref || '-',
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (user: string) => user || '-',
    },
  ]

  return (
    <AppLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Stock Moves</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Record Move
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={moves}
          loading={movesLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />

        <Modal
          title="Record Stock Move"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Item"
              name="itemId"
              rules={[{ required: true, message: 'Please select an item' }]}
            >
              <Select
                placeholder="Select item"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {items?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.sku} - {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Location"
              name="locationId"
              rules={[{ required: true, message: 'Please select a location' }]}
            >
              <Select placeholder="Select location">
                {locations?.map((location) => (
                  <Option key={location.id} value={location.id}>
                    {location.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Move Type"
              name="type"
              rules={[{ required: true, message: 'Please select move type' }]}
            >
              <Select placeholder="Select move type">
                <Option value="IN">IN - Add stock</Option>
                <Option value="OUT">OUT - Remove stock</Option>
                <Option value="ADJUST">ADJUST - Adjust stock</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="qty"
              rules={[
                { required: true, message: 'Please enter quantity' },
                { type: 'number', min: 0.01, message: 'Quantity must be greater than 0' }
              ]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Enter quantity"
              />
            </Form.Item>

            <Form.Item
              label="Unit Cost"
              name="unitCost"
            >
              <InputNumber
                min={0}
                step={0.01}
                style={{ width: '100%' }}
                placeholder="Enter unit cost (optional)"
                prefix="$"
              />
            </Form.Item>

            <Form.Item
              label="Reference"
              name="ref"
            >
              <Input placeholder="Enter reference (e.g., PO number, invoice)" />
            </Form.Item>

            <Form.Item
              label="Note"
              name="note"
            >
              <Input.TextArea 
                rows={3}
                placeholder="Enter any notes (optional)" 
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalOpen(false)
                  form.resetFields()
                }}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={createMoveMutation.isPending}
                >
                  Record Move
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  )
}
