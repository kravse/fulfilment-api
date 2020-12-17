import { Orders } from '@/services/orders';
import { Logger } from '@/services/logger';

export interface product {
  "mass_g": number,
  "product_name": string,
  "product_id": number,
  "quantity": number
}

function Product(product) {
  this.mass_g = product.mass_g;
  this.product_name = product.product_name;
  this.product_id = product.product_id;
  this.quantity = product.quantity;
}

interface InventoryService {
  init_catalogue(inventory): void;
  get_product(productId): product;
  process_restock(inventory): void;
  update_product_quanity(productId, quantity):void;
}

class InventoryServiceImpl implements InventoryService {
  private all_inventory = new Map();

  public init_catalogue(inventory):void {
    this.all_inventory = new Map(inventory.map(key => [key.product_id, Object.assign(key, {quantity: key.quantity || 0})]));
    Logger.log_message('Catalogue Created', `${this.all_inventory.size} items added to the catalogue.`);
  }

  public get_product(productId):product {
    let item = this.all_inventory.get(productId)
    if (item) {
      return new Product(item)
    } else {
      return
    }
  }

  public update_product_quanity(productId, quantity):void {
    let newProduct = this.all_inventory.get(productId)
    newProduct.quantity = Math.max(0, newProduct.quantity - quantity)
    this.all_inventory.set(productId, newProduct)
    return
  }

  public process_restock(inventory):void {
    let failed_items = [];
    Logger.log_message('Restock', `Restocking ${inventory.length} items to the inventory.`);
    for (var item of inventory) {
      let current_item = this.get_product(item.product_id);
      if (current_item) {
        current_item.quantity += item.quantity;
        this.all_inventory.set(current_item.product_id, current_item);
      } else {
        failed_items.push(item.product_id);
      }
    }
    Orders.process_unfulfilled();

    if (failed_items.length > 0) {
      Logger.log_error(`The following items were unable to be added to the inventory: ${failed_items}`);
    }
  }
}

const Inventory = new InventoryServiceImpl();
export { Inventory };