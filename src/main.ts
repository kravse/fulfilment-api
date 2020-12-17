import { Inventory } from '@/services/inventory';
import { Orders } from '@/services/orders';

const restock = [
  { "product_id": 0, "quantity": 3 },
  { "product_id": 1, "quantity": 25 },
  { "product_id": 2, "quantity": 25 },
  { "product_id": 3, "quantity": 12 },
  { "product_id": 4, "quantity": 15 },
  { "product_id": 5, "quantity": 10 },
  { "product_id": 6, "quantity": 8 },
  { "product_id": 7, "quantity": 8 },
  { "product_id": 8, "quantity": 20 },
  { "product_id": 9, "quantity": 10 },
  { "product_id": 10, "quantity": 5 },
  { "product_id": 11, "quantity": 5 },
  { "product_id": 12, "quantity": 5 }
];

const sampleInventory = [
  { "mass_g": 700, "product_name": "RBC A+ Adult", "product_id": 0 },
  { "mass_g": 700, "product_name": "RBC B+ Adult", "product_id": 1 },
  { "mass_g": 750, "product_name": "RBC AB+ Adult", "product_id": 2 },
  { "mass_g": 680, "product_name": "RBC O- Adult", "product_id": 3 },
  { "mass_g": 350, "product_name": "RBC A+ Child", "product_id": 4 },
  { "mass_g": 200, "product_name": "RBC AB+ Child", "product_id": 5 },
  { "mass_g": 120, "product_name": "PLT AB+", "product_id": 6 },
  { "mass_g": 80, "product_name": "PLT O+", "product_id": 7 },
  { "mass_g": 40, "product_name": "CRYO A+", "product_id": 8 },
  { "mass_g": 80, "product_name": "CRYO AB+", "product_id": 9 },
  { "mass_g": 300, "product_name": "FFP A+", "product_id": 10 },
  { "mass_g": 300, "product_name": "FFP B+", "product_id": 11 },
  { "mass_g": 300, "product_name": "FFP AB+", "product_id": 12 }
];

const order = {
  "order_id": 123,
  "requested": [
    {"product_id": 0, "quantity": 5 },
    {"product_id": 10, "quantity": 4 }
  ]
};

(function init() {
  Inventory.init_catalogue(sampleInventory);
  Inventory.process_restock(restock);
  Orders.process_orders(order);
  Inventory.process_restock(restock);
})();
