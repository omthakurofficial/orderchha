import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  // Check if this is an "available" badge - check in React children deeply
  const checkForAvailable = (children: React.ReactNode): boolean => {
    if (!children) return false;
    
    // Check string directly
    if (typeof children === 'string') {
      return children.toLowerCase() === 'available';
    }
    
    // Check array of children
    if (Array.isArray(children)) {
      return children.some(child => checkForAvailable(child));
    }
    
    // Check React element
    if (React.isValidElement(children)) {
      return (
        checkForAvailable(children.props.children) || 
        (children.props.value && children.props.value.toLowerCase() === 'available')
      );
    }
    
    return false;
  };
  
  const isAvailableBadge = checkForAvailable(props.children);
  
  // If it is an "available" badge, apply inline styles
  const inlineStyles = isAvailableBadge 
    ? { backgroundColor: '#597E52', color: 'white', borderColor: '#597E52' }
    : {};
    
  // Create a class name modifier for CSS targeting
  const badgeTypeClass = isAvailableBadge ? 'available-badge' : '';
  
  return (
    <div 
      className={cn(badgeVariants({ variant }), className, badgeTypeClass)} 
      style={isAvailableBadge ? inlineStyles : undefined}
      data-status={isAvailableBadge ? 'available' : undefined}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }
