import { Inventory } from '@/services/inventory';
import { Logger } from '@/services/logger';

interface OrdersService {
  process_orders(order): void;
}

function Package(order_id, items?, total_weight?) {
  this.items = items || [];
  this.order_id = order_id;
  this.total_weight = total_weight || 0;
}

class OrdersServiceImpl implements OrdersService {
  private unfulfiled_orders = [];
  private outgoing_packages = [];

  public process_orders(order):void {
    let unfulfilled = [];
    let current_package = new Package(order.order_id);
    let remaining_orders = {
      order_id: order.order_id,
      requested: []
    };
    console.log("ORDER:", order)
    for (let i = 0; i < order.requested.length; i++) {
      let order_item = order.requested[i];
      let inventory_item = Inventory.get_product(order_item.product_id);
      let remaining_mass = 1800 - current_package.total_weight;
      let packages_to_send = 0;

      let max_packages = Math.floor(remaining_mass / inventory_item.mass_g);

      if (order_item.quantity < max_packages) {
        packages_to_send = order_item.quantity;
      } else {
        packages_to_send = Math.min(max_packages, inventory_item.quantity);
      }
      const more_than_available_required = order_item.quantity > inventory_item.quantity;
      const more_than_zero_left = order_item.quantity - packages_to_send > 0;

      if (more_than_available_required && more_than_zero_left) {
        unfulfilled.push({
          product_id: order.requested[i].product_id,
          quantity: order_item.quantity - packages_to_send
        })
      }

      Inventory.update_product_quanity(inventory_item.product_id, inventory_item.quantity);

      let projected_mass = current_package.total_weight + (packages_to_send * inventory_item.mass_g)
      if (projected_mass <= 1800) {
        current_package = new Package(
          current_package.order_id,
          [...current_package.items, {
            product_id: order_item.product_id,
            quantity: packages_to_send
          }],
          current_package.total_weight += packages_to_send * inventory_item.mass_g
        );

      } else {
        this.outgoing_packages.push(current_package)
      }
      if (packages_to_send < order_item.quantity &&
        order_item.quantity < inventory_item.quantity) {
        remaining_orders.requested.push({
          product_id: order_item.product_id,
          quantity: order_item.quantity - packages_to_send
        })
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
      this.process_orders(remaining_orders)
      return;
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