'use client'

import { 
  Table, 
  Typography,
  Alert,
  Space,
  Tag
} from 'antd'
import { WarningOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/AppLayout'

const { Title } = Typography

interface Balance {
  item_id: number
  sku: string
  name: string
  location_id: number
  location: string
  qty_on_hand: number | string
}

interface Item {
  id: number
  sku: string
  name: string
  minQty: string
}

export default function BalancesPage() {
  // Fetch balances
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['balances'],
    queryFn: async (): Promise<Balance[]> => {
      const response = await fetch('/api/balances')
      if (!response.ok) {
        throw new Error('Failed to fetch balances')
      }
      return response.json()
    },
  })

  // Fetch items to get min quantities
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

  // Create a map of item min quantities for quick lookup
  const itemMinQtyMap = items?.reduce((acc, item) => {
    acc[item.id] = parseFloat(item.minQty)
    return acc
  }, {} as Record<number, number>) || {}

  // Filter for low stock items
  const lowStockItems = balances?.filter((balance) => {
    const qty = typeof balance.qty_on_hand === 'string' 
      ? parseFloat(balance.qty_on_hand) 
      : balance.qty_on_hand
    const minQty = itemMinQtyMap[balance.item_id] || 0
    return qty < minQty
  }) || []

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      sorter: (a: Balance, b: Balance) => a.sku.localeCompare(b.sku),
      fixed: 'left' as const,
      width: 120,
    },
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Balance, b: Balance) => a.name.localeCompare(b.name),
      width: 200,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a: Balance, b: Balance) => a.location.localeCompare(b.location),
      filters: Array.from(new Set(balances?.map(b => b.location) || [])).map(location => ({
        text: location,
        value: location,
      })),
      onFilter: (value: any, record: Balance) => record.location === value,
      width: 150,
    },
    {
      title: 'Qty on Hand',
      dataIndex: 'qty_on_hand',
      key: 'qty_on_hand',
      render: (qty: number | string, record: Balance) => {
        const quantity = typeof qty === 'string' ? parseFloat(qty) : qty
        const minQty = itemMinQtyMap[record.item_id] || 0
        const isLowStock = quantity < minQty
        
        return (
          <Space>
            <span style={{ 
              color: isLowStock ? '#ff4d4f' : 'inherit',
              fontWeight: isLowStock ? 'bold' : 'normal'
            }}>
              {quantity.toFixed(2)}
            </span>
            {isLowStock && (
              <Tag color="red" icon={<WarningOutlined />}>
                Low Stock
              </Tag>
            )}
          </Space>
        )
      },
      sorter: (a: Balance, b: Balance) => {
        const aQty = typeof a.qty_on_hand === 'string' ? parseFloat(a.qty_on_hand) : a.qty_on_hand
        const bQty = typeof b.qty_on_hand === 'string' ? parseFloat(b.qty_on_hand) : b.qty_on_hand
        return aQty - bQty
      },
      width: 150,
    },
    {
      title: 'Min Qty',
      key: 'minQty',
      render: (record: Balance) => {
        const minQty = itemMinQtyMap[record.item_id] || 0
        return minQty.toFixed(2)
      },
      sorter: (a: Balance, b: Balance) => {
        const aMin = itemMinQtyMap[a.item_id] || 0
        const bMin = itemMinQtyMap[b.item_id] || 0
        return aMin - bMin
      },
      width: 100,
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Balance) => {
        const qty = typeof record.qty_on_hand === 'string' 
          ? parseFloat(record.qty_on_hand) 
          : record.qty_on_hand
        const minQty = itemMinQtyMap[record.item_id] || 0
        
        if (qty <= 0) {
          return <Tag color="red">Out of Stock</Tag>
        } else if (qty < minQty) {
          return <Tag color="orange">Low Stock</Tag>
        } else {
          return <Tag color="green">In Stock</Tag>
        }
      },
      filters: [
        { text: 'Out of Stock', value: 'out' },
        { text: 'Low Stock', value: 'low' },
        { text: 'In Stock', value: 'in' },
      ],
      onFilter: (value: any, record: Balance) => {
        const qty = typeof record.qty_on_hand === 'string' 
          ? parseFloat(record.qty_on_hand) 
          : record.qty_on_hand
        const minQty = itemMinQtyMap[record.item_id] || 0
        
        switch (value) {
          case 'out':
            return qty <= 0
          case 'low':
            return qty > 0 && qty < minQty
          case 'in':
            return qty >= minQty
          default:
            return true
        }
      },
      width: 120,
    },
  ]

  return (
    <AppLayout>
      <div>
        <Title level={2}>Stock Balances</Title>
        
        {lowStockItems.length > 0 && (
          <Alert
            message={`Low Stock Alert: ${lowStockItems.length} item(s) below minimum quantity`}
            description={
              <div>
                Items with low stock: {lowStockItems.map(item => 
                  `${item.sku} (${item.location})`
                ).join(', ')}
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={balances}
          loading={balancesLoading}
          rowKey={(record) => `${record.item_id}-${record.location_id}`}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
          rowClassName={(record) => {
            const qty = typeof record.qty_on_hand === 'string' 
              ? parseFloat(record.qty_on_hand) 
              : record.qty_on_hand
            const minQty = itemMinQtyMap[record.item_id] || 0
            return qty < minQty ? 'low-stock' : ''
          }}
          summary={(pageData) => {
            const totalItems = pageData.length
            const lowStockCount = pageData.filter((record) => {
              const qty = typeof record.qty_on_hand === 'string' 
                ? parseFloat(record.qty_on_hand) 
                : record.qty_on_hand
              const minQty = itemMinQtyMap[record.item_id] || 0
              return qty < minQty
            }).length
            
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong>Summary</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <strong>Total: {totalItems} records</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <strong style={{ color: lowStockCount > 0 ? '#ff4d4f' : 'inherit' }}>
                    Low Stock: {lowStockCount}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} colSpan={2} />
              </Table.Summary.Row>
            )
          }}
        />
      </div>
    </AppLayout>
  )
}
