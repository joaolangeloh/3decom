import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')
  if (session.user.subscriptionStatus !== 'active') redirect('/assinar')

  return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      {/* Navbar */}
      <div style={{background:'#0e0e1a',borderBottom:'1px solid #1a1a2e',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:'sans-serif',fontWeight:800,color:'#fff',fontSize:18}}>
          3D<span style={{color:'#00e5a0'}}>Ecom</span>
        </span>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{color:'#666',fontSize:13}}>{session.user.email}</span>
          <a href="/api/auth/signout" style={{color:'#00e5a0',fontSize:13,textDecoration:'none'}}>Sair</a>
        </div>
      </div>
      {/* Calculadora via iframe */}
      <iframe
        src="/precificadora.html"
        style={{flex:1,border:'none',width:'100%'}}
        title="Precificadora 3DEcom"
      />
    </div>
  )
}
