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
    let current_package = new Package(order.order_id);
    let remaining_order = order;

    for (let i = 0; i < order.requested.length; i++) {
      let inventory_item = Inventory.get_product(order.requested[i].product_id);

      if (inventory_item.quantity === 0) {
        this.unfulfiled_orders.push(order.requested[i]);
        continue;
      }

      const item_specifics = this.calculate_specifics(order.requested[i], inventory_item);
      const package_mass = current_package.total_weight + item_specifics.mass_g;

      if (package_mass < 1800) {
        inventory_item.quantity = item_specifics.quantity;

        if (inventory_item.quantity > 0) {
          current_package = new Package(
            current_package.order_id,
            [...current_package.items, inventory_item],
            package_mass
          );
        }

        remaining_order.requested[i].quantity -= inventory_item.quantity;
        if (remaining_order.requested[i].quantity === 0) {
          remaining_order.requested.slice(i, 1);
        }

        Inventory.update_product_quanity(inventory_item.product_id, inventory_item.quantity);
      } else {
        this.outgoing_packages.push(current_package);
        this.process_orders(remaining_order);
        return;
      }
    }
    this.outgoing_packages.push(current_package);
    this.ship_package();
  }

  public process_unfulfilled() {
    if (this.unfulfiled_orders.length === 0) return;
    Logger.logMessage('processing orders', `Processed ${this.unfulfiled_orders.length} unfulfilled orders; `);
    let orders = this.unfulfiled_orders;
    this.unfulfiled_orders = [];
    this.process_orders(orders);
  }

  private calculate_specifics (order_item, inventory_item):any {
    let quantity = 0;
    let mass_g = 0;
    let target_quantity = order_item.quantity
    if (inventory_item.quantity < target_quantity) target_quantity = inventory_item.quantity;
    while (quantity < target_quantity && mass_g < 1800) {
      mass_g += inventory_item.mass_g;
      quantity++;
    }
    return { quantity: quantity, mass_g: mass_g };
  }

  private ship_package() {
    if (this.outgoing_packages.length > 0) {
      Logger.logMessage('shipping notice',
        `Shipped a package! \nTimestamp: ${new Date().getTime()} \nPackage: `,
        this.outgoing_packages[0]);
      this.outgoing_packages.shift();
      this.ship_package();
    }
  }
}

let Orders = new OrdersServiceImpl()
export { Orders };