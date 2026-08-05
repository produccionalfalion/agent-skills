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

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { nombre, descripcion, cantidad_actual, unidad_medida, precio_unitario, cantidad_minima, proveedor, ubicacion } = req.body;

      if (!nombre || !unidad_medida || precio_unitario === undefined) {
        return res.status(400).json({ error: 'Missing required fields: nombre, unidad_medida, precio_unitario' });
      }

      const { data, error } = await supabase
        .from('insumos')
        .insert([{
          nombre,
          descripcion: descripcion || null,
          cantidad_actual: cantidad_actual || 0,
          unidad_medida,
          precio_unitario,
          cantidad_minima: cantidad_minima || 0,
          proveedor: proveedor || null,
          ubicacion: ubicacion || null,
          activo: true
        }])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
