import { Inventory } from '@/services/inventory';
import { Logger } from '@/services/logger';

interface OrdersService {
  process_orders(order): void;
}

function Package(order_id, items?, total_weight?) {
  this.items = items || [];
  this.order_id = order_id;
  this.total_weight = total_weight || 0;
  this.update = (newItem, newWeight) => {
    this.items = [...this.items, newItem]
    this.total_weight += newWeight;
  }
}

function Item(product_id, quantity) {
  this.product_id = product_id;
  this.quantity = quantity;
}

class OrdersServiceImpl implements OrdersService {
  private unfulfiled_orders = [];
  private outgoing_packages = [];

  public process_orders(order):void {
    let unfulfilled = [];
    let current_package = new Package(order.order_id);
    let remaining_orders = order;

    for (let i = 0; i < order.requested.length; i++) {
      let order_item = order.requested[i];
      let inventory_item = Inventory.get_product(order_item.product_id);
      let max_packages = Math.floor((1800 - current_package.total_weight) / inventory_item.mass_g);
      let packages_to_send = order_item.quantity;

      if (order_item.quantity === 0) {
        remaining_orders.requested.splice(i, 1);
        continue;
      }

      if (order_item.quantity > max_packages) {
        packages_to_send = Math.min(max_packages, inventory_item.quantity);
      }

      const more_than_available_required = order_item.quantity > inventory_item.quantity;
      const more_than_zero_left = order_item.quantity - packages_to_send > 0;

      if (more_than_available_required && more_than_zero_left) {
        unfulfilled.push(new Item(order.requested[i].product_id, order_item.quantity - packages_to_send));
        remaining_orders.requested[i].quantity -= order_item.quantity - packages_to_send;
      }

      if (current_package.total_weight + (packages_to_send * inventory_item.mass_g) <= 1800) {
        current_package.update(
          new Item(order_item.product_id, packages_to_send),
          packages_to_send * inventory_item.mass_g
        )

        Inventory.update_product_quanity(inventory_item.product_id, packages_to_send);
        remaining_orders.requested[i].quantity -= packages_to_send
      } else {
        this.outgoing_packages.push(current_package)
      }
    }

    if (current_package.items.length > 0) this.outgoing_packages.push(current_package)
    this.ship_package()

    if (unfulfilled.length > 0) {
      Logger.logMessage('Unfulfiled packages',
        `Unable to fulfill the following packages, stored for later.`,
        unfulfilled);

      this.unfulfiled_orders.push({
        order_id: order.order_id,
        requested: unfulfilled
      });
    }

    if (remaining_orders.requested.length > 0) {
      this.process_orders(remaining_orders);
    }
  }

  public process_unfulfilled() {
    if (this.unfulfiled_orders.length === 0) return;
    Logger.logMessage('processing orders', `Processed ${this.unfulfiled_orders.length} unfulfilled orders; `);
    let orders = this.unfulfiled_orders;
    this.unfulfiled_orders = [];
    for (let order of orders) {
      this.process_orders(order);
    }
  }

  private ship_package() {
    if (this.outgoing_packages.length > 0) {
      Logger.logMessage('shipping notice',
        `Shipped a package! \nTimestamp: ${new Date().getTime()}: `,
        this.outgoing_packages[0]);
      this.outgoing_packages.shift();
      this.ship_package();
    }
  }
}

let Orders = new OrdersServiceImpl()
export { Orders };