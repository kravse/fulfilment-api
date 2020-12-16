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
  add_inventory(key?): void;
  process_restock(inventory): void;
  get_catalogue():any;
  update_product_quanity(productId, quantity):void;
}

class InventoryServiceImpl implements InventoryService {
  private all_inventory = new Map();

  public init_catalogue(inventory):void {
    this.all_inventory = new Map(inventory.map(key => {
      let quantity = { quantity: key.quantity || 0};
      return [key.product_id, Object.assign(key, { quantity: quantity})]
    }));
    Logger.logMessage('Catalogue Created', `${this.all_inventory.size} items added to the catalogue.`);
  }
  public get_product(productId): product {
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
  public get_catalogue(): object {
    return this.all_inventory
  }
  public add_inventory(key?): void {
    this.all_inventory.set(key.product_id, key)
  }
  public process_restock(inventory):void {
    let failed_items = [];

    for (var item of inventory) {
      let current_item = this.get_product(item.product_id);
      if (current_item) {
        current_item.quantity += current_item.quantity
        this.all_inventory.set(current_item.product_id, current_item);
      } else {
        failed_items.push(item.product_id)
      }
    }

    Orders.process_unfulfilled();

    if (failed_items.length > 0) {
      Logger.logError(`The following items were unable to be added to the inventory: ${failed_items}`)
    } else {
      Logger.logMessage('Restock Processed', `Successfully added ${inventory.length} items to the inventory.`)
    }
  }
}

const Inventory = new InventoryServiceImpl()
export { Inventory };