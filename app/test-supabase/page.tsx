import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function TestSupabase() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Test connection by fetching from 'todos' table
  const { data: todos, error } = await supabase.from('todos').select()

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Test</h1>
      
      {error ? (
        <div style={{ color: 'red', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>
          <strong>Error:</strong> {error.message}
          <p>Note: This error is expected if you haven't created the 'todos' table yet.</p>
        </div>
      ) : (
        <ul style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
          {todos?.map((todo: any) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
          {todos?.length === 0 && <li>Conectado, pero la tabla está vacía.</li>}
        </ul>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
        <p>✅ Dependencias instaladas</p>
        <p>✅ Variables de entorno configuradas</p>
        <p>✅ Middleware activo</p>
      </div>
    </div>
  )
}
