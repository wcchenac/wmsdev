/**
 * UI Components Library
 * Centralized export for all reusable UI components
 *
 * Usage:
 * import { Button, Card, EmptyState, PageHeader, FormField, ConfirmDialog, Badge, Alert } from '../UI';
 */

// Core Components
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonType, IconPosition } from './Button';

export { default as Card } from './Card';
export type { CardProps, CardVariant } from './Card';

export { default as EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateType } from './EmptyState';

export { default as PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { default as FormField } from './FormField';
export type { FormFieldProps } from './FormField';

// Dialog Components
export { default as ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps, ConfirmDialogVariant } from './ConfirmDialog';

// Action Components
export { default as IconButton, ActionButtonGroup } from './IconButton';
export type {
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
  ActionButtonGroupProps,
  ActionButtonGroupAlign,
  ActionButtonGroupGap
} from './IconButton';

// Feedback Components
export { default as Alert, InlineMessage } from './Alert';
export type { AlertProps, AlertVariant, InlineMessageProps, InlineMessageVariant } from './Alert';

export { default as Badge, StatusBadge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize, StatusBadgeProps, StatusType } from './Badge';
