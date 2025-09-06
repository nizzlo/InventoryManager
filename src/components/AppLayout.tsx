'use client'

import { Layout, Menu, MenuProps } from 'antd'
import { ShoppingCartOutlined, BoxPlotOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { APP_NAME } from '@/config/app'

const { Header, Content, Sider } = Layout

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const menuItems: MenuProps['items'] = [
    {
      key: '/items',
      icon: <BoxPlotOutlined />,
      label: 'Items',
    },
    {
      key: '/moves',
      icon: <ShoppingCartOutlined />,
      label: 'Stock Moves',
    },
    {
      key: '/balances',
      icon: <BarChartOutlined />,
      label: 'Balances',
    },
    {
      key: '/config',
      icon: <SettingOutlined />,
      label: 'Configuration',
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ padding: 0, background: '#001529' }}>
        <div style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold',
          padding: '0 24px',
          lineHeight: '64px'
        }}>
          📦 {APP_NAME}
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}
