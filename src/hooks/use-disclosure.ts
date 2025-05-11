/**
 * useDisclosure Hook
 * 
 * A custom hook for managing disclosure state (open/close) for components
 * like modals, drawers, accordions, etc.
 */

import { useState, useCallback } from 'react';

interface UseDisclosureProps {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
}

/**
 * useDisclosure hook
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.defaultIsOpen - Initial open state
 * @param {Function} options.onOpen - Callback when opening
 * @param {Function} options.onClose - Callback when closing
 * @returns {Object} Disclosure state and handlers
 */
export function useDisclosure({
  defaultIsOpen = false,
  onOpen: onOpenProp,
  onClose: onCloseProp,
}: UseDisclosureProps = {}): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
    onOpenProp?.();
  }, [onOpenProp]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    onCloseProp?.();
  }, [onCloseProp]);

  const onToggle = useCallback(() => {
    const action = isOpen ? onClose : onOpen;
    action();
  }, [isOpen, onOpen, onClose]);

  /**
   * Get props for the disclosure trigger button
   */
  const getButtonProps = useCallback(
    (props: any = {}) => ({
      'aria-expanded': isOpen,
      'aria-controls': props.id,
      onClick: (e: React.MouseEvent) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) {
          onToggle();
        }
      },
      ...props,
    }),
    [isOpen, onToggle]
  );

  /**
   * Get props for the disclosure content
   */
  const getDisclosureProps = useCallback(
    (props: any = {}) => ({
      hidden: !isOpen,
      ...props,
    }),
    [isOpen]
  );

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    getButtonProps,
    getDisclosureProps,
  };
}

/**
 * Usage example:
 * 
 * import { useDisclosure } from "@/hooks/use-disclosure";
 * import { Button } from "@/components/ui/button";
 * import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 * 
 * const MyComponent = () => {
 *   const { isOpen, onOpen, onClose } = useDisclosure();
 * 
 *   return (
 *     <>
 *       <Button onClick={onOpen}>Open Dialog</Button>
 *       <Dialog open={isOpen} onOpenChange={onClose}>
 *         <DialogContent>
 *           <DialogHeader>
 *             <DialogTitle>Dialog Title</DialogTitle>
 *           </DialogHeader>
 *           <div>Dialog Content</div>
 *         </DialogContent>
 *       </Dialog>
 *     </>
 *   );
 * };
 */
