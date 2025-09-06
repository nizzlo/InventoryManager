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
  AutoComplete,
  message,
  Space,
  Typography,
  Tag,
  Popconfirm,
  Tooltip,
  Dropdown
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
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
  sellPrice?: string
  ref?: string
  note?: string
  movedAt: string
  userName?: string
  item: Item
  location: Location
}

interface CreateMoveData {
  itemId: number
  locationId?: number
  locationName?: string
  type: 'IN' | 'OUT' | 'ADJUST'
  qty: number
  unitCost?: number
  sellPrice?: number
  ref?: string
  note?: string
  userName?: string
}

export default function MovesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMove, setEditingMove] = useState<InventoryMove | null>(null)
  const [isMultipleMode, setIsMultipleMode] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // Prepare location options for AutoComplete
  const getLocationOptions = () => {
    if (!locations) return []
    return locations.map(location => ({
      value: location.name,
      label: location.name,
      id: location.id
    }))
  }

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
      const url = editingMove ? `/api/moves/${editingMove.id}` : '/api/moves'
      const method = editingMove ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error(`Failed to ${editingMove ? 'update' : 'create'} move`)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] }) // Invalidate locations cache for new locations
      message.success(`Stock move ${editingMove ? 'updated' : 'recorded'} successfully!`)
      setIsModalOpen(false)
      setEditingMove(null)
      form.resetFields()
    },
    onError: (error) => {
      message.error(`Failed to ${editingMove ? 'update' : 'record'} move: ${error.message}`)
    },
  })

  // Delete move mutation
  const deleteMoveMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`/api/moves/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete move')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      message.success('Move deleted successfully!')
    },
    onError: (error) => {
      message.error(`Failed to delete move: ${error.message}`)
    },
  })

  // Create multiple moves mutation
  const createMultipleMoveMutation = useMutation({
    mutationFn: async (moves: CreateMoveData[]): Promise<InventoryMove[]> => {
      const response = await fetch('/api/moves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moves }),
      })
      if (!response.ok) {
        throw new Error('Failed to create moves')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moves'] })
      queryClient.invalidateQueries({ queryKey: ['balances'] })
      queryClient.invalidateQueries({ queryKey: ['locations'] }) // Invalidate locations cache for new locations
      message.success('All stock moves recorded successfully!')
      setIsModalOpen(false)
      setIsMultipleMode(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error(`Failed to record moves: ${error.message}`)
    },
  })

  const handleSubmit = (values: any) => {
    if (isMultipleMode) {
      // Handle multiple moves
      const moves = values.moves.map((move: any) => {
        const processedMove = { ...move, userName: 'Current User' }
        
        // Handle location - if it's a string (typed), use locationName; if it's a number, use locationId
        if (typeof move.location === 'string') {
          processedMove.locationName = move.location
          delete processedMove.locationId
        } else {
          processedMove.locationId = move.location
          delete processedMove.locationName
        }
        
        return processedMove
      })
      createMultipleMoveMutation.mutate(moves)
    } else {
      // Handle single move
      const moveData: CreateMoveData = {
        ...values,
        userName: 'Current User',
      }
      
      // Handle location - if it's a string (typed), use locationName; if it's a number, use locationId
      if (typeof values.location === 'string') {
        moveData.locationName = values.location
        delete moveData.locationId
      } else {
        moveData.locationId = values.location
        delete moveData.locationName
      }
      
      createMoveMutation.mutate(moveData)
    }
  }

  const handleEdit = (move: InventoryMove) => {
    setEditingMove(move)
    form.setFieldsValue({
      itemId: move.item.id,
      location: move.location.name, // Use location name for AutoComplete
      type: move.type,
      qty: parseFloat(move.qty),
      unitCost: move.unitCost ? parseFloat(move.unitCost) : undefined,
      sellPrice: move.sellPrice ? parseFloat(move.sellPrice) : undefined,
      ref: move.ref,
      note: move.note,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteMoveMutation.mutate(id)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingMove(null)
    setIsMultipleMode(false)
    form.resetFields()
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
      title: 'Sell Price',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (price: string) => price ? `$${parseFloat(price).toFixed(2)}` : '-',
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
    {
      title: 'Actions',
      key: 'actions',
      render: (record: InventoryMove) => (
        <Space>
          <Tooltip title="Edit move">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Delete move"
            description="Are you sure you want to delete this move?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Tooltip title="Delete move">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={deleteMoveMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: 'right' as const,
    },
  ]

  return (
    <AppLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2}>Stock Moves</Title>
          <Space>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setIsMultipleMode(false)
                setIsModalOpen(true)
              }}
            >
              Record Move
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsMultipleMode(true)
                setIsModalOpen(true)
              }}
            >
              Record Multiple Moves
            </Button>
          </Space>
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
          title={
            editingMove 
              ? "Edit Stock Move" 
              : isMultipleMode 
                ? "Record Multiple Stock Moves" 
                : "Record Stock Move"
          }
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={null}
          width={isMultipleMode ? 1000 : 600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={isMultipleMode ? { moves: [{}] } : {}}
          >
            {isMultipleMode ? (
              <Form.List name="moves">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '6px', 
                        padding: '16px', 
                        marginBottom: '16px',
                        position: 'relative'
                      }}>
                        <h4 style={{ marginBottom: '16px' }}>Move #{key + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                            style={{ position: 'absolute', top: '8px', right: '8px' }}
                          >
                            Remove
                          </Button>
                        )}
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'itemId']}
                            label="Item"
                            rules={[{ required: true, message: 'Please select an item' }]}
                          >
                            <Select
                              placeholder="Select item"
                              showSearch
                              optionFilterProp="label"
                              filterOption={(input, option) =>
                                option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                              }
                            >
                              {items?.map((item) => (
                                <Option key={item.id} value={item.id} label={`${item.sku} - ${item.name}`}>
                                  {item.sku} - {item.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'location']}
                            label="Location"
                            rules={[{ required: true, message: 'Please select or enter a location' }]}
                          >
                            <AutoComplete
                              placeholder="Select or type location"
                              options={getLocationOptions()}
                              filterOption={(inputValue, option) =>
                                option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                              }
                              style={{ width: '100%' }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'type']}
                            label="Move Type"
                            rules={[{ required: true, message: 'Please select move type' }]}
                          >
                            <Select placeholder="Select move type">
                              <Option value="IN">IN - Add stock</Option>
                              <Option value="OUT">OUT - Remove stock</Option>
                              <Option value="ADJUST">ADJUST - Adjust stock</Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'qty']}
                            label="Quantity"
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
                            {...restField}
                            name={[name, 'unitCost']}
                            label="Unit Cost"
                          >
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                              placeholder="Enter unit cost"
                              prefix="$"
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'sellPrice']}
                            label="Sell Price"
                          >
                            <InputNumber
                              min={0}
                              step={0.01}
                              style={{ width: '100%' }}
                              placeholder="Enter sell price"
                              prefix="$"
                            />
                          </Form.Item>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item
                            {...restField}
                            name={[name, 'ref']}
                            label="Reference"
                          >
                            <Input placeholder="Enter reference" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'note']}
                            label="Note"
                          >
                            <Input placeholder="Enter note" />
                          </Form.Item>
                        </div>
                      </div>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                      >
                        Add Another Move
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            ) : (
              // Single move form
              <>
                <Form.Item
                  label="Item"
                  name="itemId"
                  rules={[{ required: true, message: 'Please select an item' }]}
                >
                  <Select
                    placeholder="Select item"
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      option?.label?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                  >
                    {items?.map((item) => (
                      <Option key={item.id} value={item.id} label={`${item.sku} - ${item.name}`}>
                        {item.sku} - {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Location"
                  name="location"
                  rules={[{ required: true, message: 'Please select or enter a location' }]}
                >
                  <AutoComplete
                    placeholder="Select existing location or type new one"
                    options={getLocationOptions()}
                    filterOption={(inputValue, option) =>
                      option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false
                    }
                    style={{ width: '100%' }}
                  />
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
                  label="Sell Price"
                  name="sellPrice"
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: '100%' }}
                    placeholder="Enter sell price (optional)"
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
              </>
            )}

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={createMoveMutation.isPending || createMultipleMoveMutation.isPending}
                >
                  {editingMove 
                    ? 'Update Move' 
                    : isMultipleMode 
                      ? 'Record All Moves' 
                      : 'Record Move'
                  }
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  )
}
