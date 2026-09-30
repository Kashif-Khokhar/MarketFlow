import { OrderStatus } from '../models/Order';
import { AppError } from '../utils/AppError';

export class OrderStateMachine {
  // Define valid transitions from a given state
  private static readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.PROCESSING], // Allow PENDING -> PROCESSING for simple mock payment setups
    [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REFUNDING, OrderStatus.PROCESSING],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.REFUNDING],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDING],
    [OrderStatus.SHIPPED]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.RETURN_REQUESTED],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURN_REQUESTED],
    
    [OrderStatus.CANCELLED]: [], // Terminal (unless manual admin override)
    
    [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURN_APPROVED, OrderStatus.RETURN_REJECTED],
    [OrderStatus.RETURN_APPROVED]: [OrderStatus.REFUNDING],
    [OrderStatus.RETURN_REJECTED]: [OrderStatus.DELIVERED], // Go back to delivered if rejected
    
    [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED],
    [OrderStatus.REFUNDED]: [], // Terminal
  };

  /**
   * Validates if the transition from currentStatus to newStatus is allowed.
   */
  public static validateTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    if (currentStatus === newStatus) return true; // No change is technically valid
    
    const allowedNextStates = this.validTransitions[currentStatus] || [];
    return allowedNextStates.includes(newStatus);
  }

  /**
   * Asserts if the transition is allowed. Throws an AppError if not.
   */
  public static assertTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    if (!this.validateTransition(currentStatus, newStatus)) {
      throw new AppError(`Invalid order status transition from ${currentStatus} to ${newStatus}`, 400);
    }
  }
}
