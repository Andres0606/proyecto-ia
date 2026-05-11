const supabase = require('../config/supabase');

const getStats = async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalCompanies } = await supabase.from('empresas').select('*', { count: 'exact', head: true });
    const { count: totalJobs } = await supabase.from('vacantes').select('*', { count: 'exact', head: true }).eq('estado', 'activa');
    const { count: activePlans } = await supabase.from('suscripciones').select('*', { count: 'exact', head: true }).eq('estado', 'activo');

    return res.status(200).json({
      success: true,
      stats: {
        total_users: totalUsers || 0,
        total_companies: totalCompanies || 0,
        total_jobs: totalJobs || 0,
        active_plans: activePlans || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener estadísticas', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, users: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllVacancies = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vacantes')
      .select('*, empresas(razon_social)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, vacancies: data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getUserDistributions = async (req, res) => {
  try {
    // Consulta robusta con selección explícita
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        nombre_completo,
        genero,
        fecha_nacimiento,
        perfiles_usuarios (
          programa_academico
        ),
        resultados_modelo (
          programa_academico,
          genero,
          fecha
        )
      `)
      .eq('rol_id', 1); // Solo egresados para los reportes

    if (error) {
      console.error("❌ Error en Supabase:", error);
      throw error;
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    console.error("❌ Error en getUserDistributions:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getStats, getAllUsers, getAllVacancies, getUserDistributions };
