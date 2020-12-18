class package(object):
  def __init__(self, order_id, items=[], total_weight=0):
    self.items = items
    self.order_id = order_id
    self.total_weight = total_weight

  def __getitem__(self, key):
    return getattr(self, key)

  def __setitem__(self, key, value):
    self[key] = value

class item(object):
  def __init__(self, product_id, quantity):
    self.product_id = product_id
    self.quantity = quantity

  def __getitem__(self,key):
    return getattr(self,key)

  def __setitem__(self, key, value):
    self[key] = value

class order_service:
  unfulfiled_orders = []
  def __init__(self):
    self.outgoing_packages = []

  def process_orders(self, order):
    import math
    import copy
    unfulfilled = []
    current_package = package(order['order_id'])

    for i in range(len(order['requested'])):
      order_item = order['requested'][i]
      inventory_item = inventory.get_product(order_item['product_id'])
      max_packages = math.floor((1800 - current_package['total_weight']) / inventory_item['mass_g'])
      packages_to_send = order_item['quantity']

      if int(order_item['quantity']) == 0:
        continue
      if order_item['quantity'] > max_packages:
        packages_to_send = min(max_packages, inventory_item['quantity'])

      more_than_available_required = order_item['quantity'] > inventory_item['quantity']
      more_than_zero_left = order_item['quantity'] - packages_to_send > 0

      if more_than_available_required and more_than_zero_left:
        unfulfilled.append(item(order['requested'][i]['product_id'], order_item['quantity'] - packages_to_send))
        order_item['quantity'] -= order_item['quantity'] - packages_to_send

      if current_package['total_weight'] + (packages_to_send * inventory_item['mass_g']) <= 1800:
        p_id = order_item['product_id']
        new_item = item(p_id, packages_to_send)
        current_package['items'].append(new_item)
        current_package.total_weight += packages_to_send * inventory_item['mass_g']
        inventory.update_product_quanity(inventory_item['product_id'], packages_to_send)
        order_item['quantity'] -= packages_to_send

      else:
        self.outgoing_packages.append(current_package)

    if len(current_package['items']) > 0: self.outgoing_packages.append(current_package)
    self.ship_package()

    if len(unfulfilled) > 0:
      print('----Unable to fulfill -----')
      print('Couldn\'t fulful ' + str(len(unfulfilled)) + ' packages, stored for later.')
      for i in unfulfilled:
        print('ID: ' + str(i['product_id']) + ' Quantity: ' + str(int(i['quantity'])))
      self.unfulfiled_orders.append({
        'order_id': order['order_id'],
        'requested': unfulfilled
      })
    for order_request in order['requested']:
      if order_request['quantity'] > 0:
        self.process_orders(order)
        return

  def process_unfulfilled(self):
    if (len(order_service.unfulfiled_orders) == 0):
      return
    print('-----processing orders-----')
    orders = order_service.unfulfiled_orders
    order_service.unfulfiled_orders = []
    for order in orders:
      self.process_orders(order)

  def ship_package(self):
    if (len(self.outgoing_packages)> 0):
      shipped_package = self.outgoing_packages.pop(0)
      print('-----Shipped a package!-----')
      print('Order: ' + str(shipped_package['order_id']))
      for i in shipped_package['items']:
        print('ID: ' + str(i['product_id']) + ' Quantity: ' + str(int(i['quantity'])))
      self.ship_package()

import inventory_service
inventory = inventory_service.inventory_service()
