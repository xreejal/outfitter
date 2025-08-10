import { useState } from 'react'
import { TransitionLink } from '@shopify/shop-minis-react'
import { Button, Card } from '@shopify/shop-minis-react'

interface AnimatedCardProps {
  title: string
  description: string
  buttonText: string
  to: string
  bgColor: string
  textColor: string
  buttonVariant?: 'default' | 'secondary' | 'outline'
  delay?: number
}

export function AnimatedCard({
  title,
  description,
  buttonText,
  to,
  bgColor,
  textColor,
  buttonVariant = 'default',
  delay = 0
}: AnimatedCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="transform transition-all duration-700 ease-out opacity-0"
      style={{
        animationDelay: `${delay}ms`,
        animation: `fadeIn 0.8s ease-out ${delay}ms forwards`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card 
        className={`p-6 rounded-3xl transition-all duration-500 ease-out ${
          isHovered ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'
        }`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 
              className="text-xl font-bold mb-3"
              style={{ 
                color: textColor,
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 700
              }}
            >
              {title}
            </h3>
            <p 
              className="text-sm leading-relaxed"
              style={{ 
                color: textColor,
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 300,
                opacity: 0.9
              }}
            >
              {description}
            </p>
          </div>
          <div className="ml-6">
            <TransitionLink to={to}>
              <Button 
                variant={buttonVariant}
                className={`transition-all duration-300 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`}
              >
                {buttonText}
              </Button>
            </TransitionLink>
          </div>
        </div>
      </Card>
    </div>
  )
}
