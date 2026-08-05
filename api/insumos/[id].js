import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vtgtykxcsuuocndabufi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z3R5a3hjc3V1b2NuZGFidWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTQ5OTMsImV4cCI6MjEwMTQ3MDk5M30.3KMwUiUIzfX-YFfrWj-ito6f1ZdYfCj39MvsG04CQVI';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'Invalid insumo ID' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Insumo not found' });
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { nombre, descripcion, cantidad_actual, unidad_medida, precio_unitario, cantidad_minima, proveedor, ubicacion } = req.body;

      const updates = {};
      if (nombre !== undefined) updates.nombre = nombre;
      if (descripcion !== undefined) updates.descripcion = descripcion;
      if (cantidad_actual !== undefined) updates.cantidad_actual = cantidad_actual;
      if (unidad_medida !== undefined) updates.unidad_medida = unidad_medida;
      if (precio_unitario !== undefined) updates.precio_unitario = precio_unitario;
      if (cantidad_minima !== undefined) updates.cantidad_minima = cantidad_minima;
      if (proveedor !== undefined) updates.proveedor = proveedor;
      if (ubicacion !== undefined) updates.ubicacion = ubicacion;

      updates.updated_at = new Date();

      const { data, error } = await supabase
        .from('insumos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Insumo not found' });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('insumos')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Insumo not found' });
      return res.status(200).json({ message: 'Insumo deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
