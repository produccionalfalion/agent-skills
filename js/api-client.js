// API Client for inventory management
const API_BASE = '/api';

class InventoryAPI {
  // Insumos (Supplies)
  static async getInsumos() {
    const response = await fetch(`${API_BASE}/insumos`);
    if (!response.ok) throw new Error('Failed to fetch insumos');
    return response.json();
  }

  static async createInsumo(data) {
    const response = await fetch(`${API_BASE}/insumos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create insumo');
    return response.json();
  }

  static async updateInsumo(id, data) {
    const response = await fetch(`${API_BASE}/insumos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update insumo');
    return response.json();
  }

  static async deleteInsumo(id) {
    const response = await fetch(`${API_BASE}/insumos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete insumo');
    return response.json();
  }

  // Recetas (Recipes)
  static async getRecetas() {
    const response = await fetch(`${API_BASE}/recetas`);
    if (!response.ok) throw new Error('Failed to fetch recetas');
    return response.json();
  }

  static async createReceta(data) {
    const response = await fetch(`${API_BASE}/recetas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create receta');
    return response.json();
  }

  // Mermas (Waste)
  static async getMermas(insumoId = null) {
    let url = `${API_BASE}/mermas`;
    if (insumoId) url += `?insumoId=${insumoId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch mermas');
    return response.json();
  }

  static async createMerma(data) {
    const response = await fetch(`${API_BASE}/mermas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create merma');
    return response.json();
  }

  // Kardex (Inventory Log)
  static async getKardex(insumoId = null) {
    let url = `${API_BASE}/kardex`;
    if (insumoId) url += `?insumoId=${insumoId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch kardex');
    return response.json();
  }

  static async createKardexEntry(data) {
    const response = await fetch(`${API_BASE}/kardex`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create kardex entry');
    return response.json();
  }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InventoryAPI;
}
