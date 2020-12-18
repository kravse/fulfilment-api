import inventory_service
import order_service
import json

inventory = inventory_service.inventory_service()
orders = order_service.order_service()

sample = json.load(open('inventory.json', 'r'))
restock = json.load(open('restock.json', 'r'))
order = json.load(open('order.json', 'r'))

def init():
  inventory.init_catalogue(sample)
  inventory.process_restock(restock)
  orders.process_orders(order)

init()
