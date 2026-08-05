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
      const { data: recetas, error } = await supabase
        .from('recetas')
        .select(`
          id,
          nombre,
          descripcion,
          rendimiento,
          unidad_rendimiento,
          tiempo_produccion,
          dificultad,
          activo,
          created_at,
          receta_ingredientes(
            id,
            cantidad,
            unidad_medida,
            insumos(id, nombre, precio_unitario)
          )
        `)
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;
      return res.status(200).json(recetas);
    }

    if (req.method === 'POST') {
      const { nombre, descripcion, rendimiento, unidad_rendimiento, tiempo_produccion, dificultad, ingredientes } = req.body;

      if (!nombre || !rendimiento || !unidad_rendimiento) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data: receta, error: recetaError } = await supabase
        .from('recetas')
        .insert([{
          nombre,
          descripcion: descripcion || null,
          rendimiento,
          unidad_rendimiento,
          tiempo_produccion: tiempo_produccion || null,
          dificultad: dificultad || null,
          activo: true
        }])
        .select()
        .single();

      if (recetaError) throw recetaError;

      if (ingredientes && Array.isArray(ingredientes)) {
        const ingredientesData = ingredientes.map(ing => ({
          receta_id: receta.id,
          insumo_id: ing.insumo_id,
          cantidad: ing.cantidad,
          unidad_medida: ing.unidad_medida
        }));

        const { error: ingError } = await supabase
          .from('receta_ingredientes')
          .insert(ingredientesData);

        if (ingError) throw ingError;
      }

      return res.status(201).json(receta);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
