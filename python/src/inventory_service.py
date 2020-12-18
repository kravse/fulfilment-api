class inventory_service:
  all_inventory = {}

  def init_catalogue(self, inventory):
    for x in range(len(inventory)):
      inventory[x]['quantity'] = 0
      product_id = inventory[x]['product_id']
      inventory_service.all_inventory[product_id] = inventory[x]
    print('-----Catalogue Created-----')
    print(str(len(inventory_service.all_inventory)) + ' items added to the catalogue.')

  def get_product(self, product_id):
    return inventory_service.all_inventory[product_id]

  def update_product_quanity(self, product_id, quantity):
    newProduct = inventory_service.all_inventory[product_id]
    newProduct['quantity'] = max(0, newProduct['quantity'] - quantity)
    inventory_service.all_inventory[product_id] = newProduct

  def process_restock(self, restock):
    print('------Restock-----')
    print('Restocking ' + str(len(restock)) + ' items to the inventory.')
    for x in range(len(restock)):
      item = restock[x]
      current_item = inventory_service.all_inventory[restock[x]['product_id']]
      current_item['quantity'] += item['quantity']
      inventory_service.all_inventory[current_item['product_id']] = current_item
    orders.process_unfulfilled()

import order_service
orders = order_service.order_service()
