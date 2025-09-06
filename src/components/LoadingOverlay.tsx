'use client'

import { useEffect, useState } from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { APP_NAME } from '@/config/app'

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [stopBounce, setStopBounce] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Stop bouncing animation after 3 seconds
    const bounceTimer = setTimeout(() => {
      setStopBounce(true)
    }, 3000)

    // Initially hide main content to prevent FOUC
    const appContent = document.getElementById('__next')
    if (appContent) {
      appContent.style.visibility = 'hidden'
    }
    
    // Wait for Ant Design styles and components to be ready
    let isReady = false
    
    const checkReady = () => {
      // Check if Ant Design CSS is loaded
      const antdLoaded = document.querySelector('.ant-spin') !== null || 
                        getComputedStyle(document.body).getPropertyValue('--ant-primary-color') !== ''

      if ((document.readyState === 'complete' || antdLoaded) && !isReady) {
        isReady = true
        
        // Calculate how much time has passed
        const elapsed = Date.now() - startTime
        const remainingTime = Math.max(0, 3000 - elapsed) // Ensure at least 3 seconds total
        
        setTimeout(() => {
          setFadeOut(true)
          // Show main content when loading is done
          if (appContent) {
            appContent.style.visibility = 'visible'
          }
          setTimeout(() => setIsLoading(false), 500) // Longer fade animation
        }, remainingTime)
      } else if (!isReady) {
        setTimeout(checkReady, 100)
      }
    }

    // Start checking after initial delay
    const minDisplayTimer = setTimeout(checkReady, 500)

    // Absolute fallback timer - minimum 3 seconds total
    const maxDisplayTimer = setTimeout(() => {
      if (!isReady) {
        isReady = true
        setFadeOut(true)
        // Show main content even if something went wrong
        if (appContent) {
          appContent.style.visibility = 'visible'
        }
        setTimeout(() => setIsLoading(false), 500)
      }
    }, 3500) // 3.5 seconds as absolute maximum

    return () => {
      clearTimeout(bounceTimer)
      clearTimeout(minDisplayTimer)
      clearTimeout(maxDisplayTimer)
    }
  }, [])

  if (!isLoading) {
    return null
  }

  const antIcon = (
    <LoadingOutlined 
      style={{ 
        fontSize: 48, 
        color: '#1890ff',
        filter: 'drop-shadow(0 0 8px rgba(24, 144, 255, 0.3))'
      }} 
      spin 
    />
  )

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(24, 144, 255, 0.05) 0%, rgba(255, 255, 255, 1) 70%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        opacity: fadeOut ? 0 : 1,
        transform: fadeOut ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
      }}
    >
      {/* App Logo with Animation */}
      <div
        style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#001529',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px',
          transform: fadeOut ? 'translateY(-20px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span 
          style={{
            fontSize: '40px',
            animation: stopBounce ? 'none' : 'bounce 2s infinite ease-in-out',
            display: 'inline-block',
            transition: 'transform 0.3s ease-out',
          }}
        >
          📦
        </span>
        {APP_NAME}
      </div>
      
      {/* Subtitle */}
      <div
        style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          textAlign: 'center',
          transform: fadeOut ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
          opacity: fadeOut ? 0 : 1,
        }}
      >
        Inventory Management System
      </div>

      {/* Loading Spinner with Pulse Effect */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transform: fadeOut ? 'scale(0.8)' : 'scale(1)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
        }}
      >
        {/* Pulse Ring */}
        <div
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px solid rgba(24, 144, 255, 0.2)',
            animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Main Spinner */}
        <Spin 
          indicator={antIcon} 
          size="large"
        />
      </div>
      
      {/* Loading Text with Typewriter Effect */}
      <div
        style={{
          fontSize: '14px',
          color: '#1890ff',
          textAlign: 'center',
          fontWeight: '500',
          transform: fadeOut ? 'translateY(10px)' : 'translateY(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
          opacity: fadeOut ? 0 : 1,
        }}
      >
        Loading Ant Design Components...
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
