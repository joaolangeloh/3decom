'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Assinar() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.subscriptionStatus === 'active') {
      router.push('/dashboard')
    }
  }, [session])

  return (
    <div style={{
      minHeight:'100vh', background:'#080810', display:'flex',
      alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif'
    }}>
      <div style={{
        background:'#0e0e1a', border:'1px solid #1a1a2e', borderRadius:20,
        padding:'48px 40px', maxWidth:440, width:'100%', textAlign:'center'
      }}>
        <div style={{fontSize:48, marginBottom:16}}>🖨️</div>
        <h1 style={{color:'#fff', fontSize:28, fontWeight:800, marginBottom:8}}>
          3D<span style={{color:'#00e5a0'}}>Ecom</span>
        </h1>
        <p style={{color:'#666', marginBottom:32, fontSize:14}}>
          Precificadora automática para impressão 3D
        </p>
        <div style={{
          background:'rgba(0,229,160,.08)', border:'1px solid rgba(0,229,160,.2)',
          borderRadius:12, padding:'20px', marginBottom:32
        }}>
          <div style={{color:'#00e5a0', fontSize:32, fontWeight:800}}>R$ 29<span style={{fontSize:16}}>/mês</span></div>
          <div style={{color:'#888', fontSize:13, marginTop:4}}>Acesso completo à calculadora</div>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_LASTLINK_URL ?? '#'}
          style={{
            display:'block', background:'#00e5a0', color:'#000',
            padding:'16px', borderRadius:12, fontWeight:700, fontSize:16,
            textDecoration:'none', marginBottom:16
          }}
        >
          Assinar agora — R$29/mês
        </a>
        <button
          onClick={() => signIn()}
          style={{
            background:'transparent', border:'1px solid #1a1a2e', color:'#888',
            padding:'12px 24px', borderRadius:10, cursor:'pointer', fontSize:14, width:'100%'
          }}
        >
          Já tenho conta — entrar
        </button>
      </div>
    </div>
  )
}
