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
      const { insumoId } = req.query;
      let query = supabase
        .from('mermas')
        .select(`
          id,
          insumo_id,
          cantidad,
          razon,
          fecha_evento,
          creado_por,
          created_at,
          insumos(id, nombre)
        `);

      if (insumoId) {
        query = query.eq('insumo_id', insumoId);
      }

      const { data, error } = await query.order('fecha_evento', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { insumo_id, cantidad, razon, fecha_evento, creado_por } = req.body;

      if (!insumo_id || !cantidad) {
        return res.status(400).json({ error: 'Missing required fields: insumo_id, cantidad' });
      }

      const { data: insumo } = await supabase
        .from('insumos')
        .select('cantidad_actual')
        .eq('id', insumo_id)
        .single();

      if (!insumo) return res.status(404).json({ error: 'Insumo not found' });

      const nuevaCantidad = insumo.cantidad_actual - cantidad;

      const { data: merma, error: mermaError } = await supabase
        .from('mermas')
        .insert([{
          insumo_id,
          cantidad,
          razon: razon || null,
          fecha_evento: fecha_evento || new Date().toISOString().split('T')[0],
          creado_por: creado_por || null
        }])
        .select()
        .single();

      if (mermaError) throw mermaError;

      await supabase
        .from('insumos')
        .update({ cantidad_actual: nuevaCantidad })
        .eq('id', insumo_id);

      return res.status(201).json(merma);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
