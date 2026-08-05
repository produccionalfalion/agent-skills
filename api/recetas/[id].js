import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vtgtykxcsuuocndabufi.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Z3R5a3hjc3V1b2NuZGFidWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTQ5OTMsImV4cCI6MjEwMTQ3MDk5M30.3KMwUiUIzfX-YFfrWj-ito6f1ZdYfCj39MvsG04CQVI';
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
    return res.status(400).json({ error: 'Invalid receta ID' });
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('recetas')
        .select(`id, nombre, descripcion, rendimiento, unidad_rendimiento, tiempo_produccion, dificultad, activo, created_at, receta_ingredientes(id, cantidad, unidad_medida, insumos(id, nombre, precio_unitario))`)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Receta not found' });
      return res.status(200).json(data);
    }

    if (req.method === 'PUT') {
      const { nombre, descripcion, rendimiento, unidad_rendimiento, tiempo_produccion, dificultad, ingredientes } = req.body;

      const updates = {};
      if (nombre !== undefined) updates.nombre = nombre;
      if (descripcion !== undefined) updates.descripcion = descripcion;
      if (rendimiento !== undefined) updates.rendimiento = rendimiento;
      if (unidad_rendimiento !== undefined) updates.unidad_rendimiento = unidad_rendimiento;
      if (tiempo_produccion !== undefined) updates.tiempo_produccion = tiempo_produccion;
      if (dificultad !== undefined) updates.dificultad = dificultad;
      updates.updated_at = new Date();

      const { data, error } = await supabase
        .from('recetas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Receta not found' });

      if (ingredientes && Array.isArray(ingredientes)) {
        await supabase.from('receta_ingredientes').delete().eq('receta_id', id);
        if (ingredientes.length > 0) {
          const ingredientesData = ingredientes.map(ing => ({
            receta_id: id,
            insumo_id: ing.insumo_id,
            cantidad: ing.cantidad,
            unidad_medida: ing.unidad_medida
          }));
          const { error: ingError } = await supabase.from('receta_ingredientes').insert(ingredientesData);
          if (ingError) throw ingError;
        }
      }

      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { data, error } = await supabase
        .from('recetas')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Receta not found' });
      return res.status(200).json({ message: 'Receta deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
