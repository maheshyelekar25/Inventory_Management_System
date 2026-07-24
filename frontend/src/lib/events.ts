export const INVENTORY_DATA_CHANGED = 'inventory:data-changed'

export function notifyInventoryDataChanged() {
  window.dispatchEvent(new Event(INVENTORY_DATA_CHANGED))
}
