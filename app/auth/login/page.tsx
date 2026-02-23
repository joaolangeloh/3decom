'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email, password, redirect: false
    })
    setLoading(false)
    if (res?.error) {
      setError('Email ou senha incorretos')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#0e0e1a',border:'1px solid #1a1a2e',borderRadius:20,padding:'48px 40px',maxWidth:400,width:'100%'}}>
        <h1 style={{color:'#fff',fontSize:24,fontWeight:800,marginBottom:4,textAlign:'center'}}>
          3D<span style={{color:'#00e5a0'}}>Ecom</span>
        </h1>
        <p style={{color:'#666',fontSize:13,textAlign:'center',marginBottom:32}}>Entre na sua conta</p>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{color:'#888',fontSize:13,display:'block',marginBottom:6}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{width:'100%',padding:'12px',background:'#080810',border:'1px solid #1a1a2e',borderRadius:10,color:'#fff',fontSize:14,boxSizing:'border-box'}}
              placeholder="seu@email.com" />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{color:'#888',fontSize:13,display:'block',marginBottom:6}}>Senha</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{width:'100%',padding:'12px',background:'#080810',border:'1px solid #1a1a2e',borderRadius:10,color:'#fff',fontSize:14,boxSizing:'border-box'}}
              placeholder="••••••" />
          </div>
          {error && <p style={{color:'#ff6666',fontSize:13,marginBottom:16,textAlign:'center'}}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{width:'100%',background:'#00e5a0',color:'#000',padding:'14px',borderRadius:10,border:'none',fontWeight:700,fontSize:15,cursor:'pointer'}}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{color:'#666',fontSize:13,textAlign:'center',marginTop:20}}>
          Não tem conta?{' '}
          <a href="/auth/cadastro" style={{color:'#00e5a0',textDecoration:'none'}}>Assinar agora</a>
        </p>
      </div>
    </div>
  )
}
