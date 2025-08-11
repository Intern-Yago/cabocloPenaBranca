import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Package, TrendingUp, AlertTriangle, Users, Calendar } from 'lucide-react'

export function Dashboard() {
  const [resumoFinanceiro, setResumoFinanceiro] = useState(null)
  const [resumoMateriais, setResumoMateriais] = useState(null)
  const [resumoMembros, setResumoMembros] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResumos = async () => {
      try {
        const [financeiroRes, materiaisRes, membrosRes] = await Promise.all([
          fetch('http://localhost:5000/api/resumo-financeiro'),
          fetch('http://localhost:5000/api/resumo-estoque'),
          fetch('http://localhost:5000/api/resumo-membros')
        ])
        
        const financeiro = await financeiroRes.json()
        const materiais = await materiaisRes.json()
        const membros = await membrosRes.json()
        
        setResumoFinanceiro(financeiro)
        setResumoMateriais(materiais)
        setResumoMembros(membros)
      } catch (error) {
        console.error('Erro ao carregar resumos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResumos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-24 mb-1"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do templo umbandista
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Atual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (resumoFinanceiro?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              R$ {resumoFinanceiro?.saldo?.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {resumoMembros?.total_membros || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Membros ativos do templo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Materiais em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resumoMateriais?.total_materiais || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais religiosos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receitas do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {resumoMembros?.receita_mes_atual?.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Mensalidades recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Materiais em Falta
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {resumoMateriais?.materiais_baixo_estoque || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Materiais com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Membros Inadimplentes
            </CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {resumoMembros?.membros_inadimplentes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Mensalidades em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>
              Situação financeira atual do templo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Receitas Totais:</span>
              <span className="text-sm text-green-600 font-medium">
                R$ {resumoFinanceiro?.receitas?.toFixed(2) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Despesas Totais:</span>
              <span className="text-sm text-red-600 font-medium">
                R$ {resumoFinanceiro?.despesas?.toFixed(2) || '0,00'}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Saldo Atual:</span>
                <span className={`font-medium ${
                  (resumoFinanceiro?.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  R$ {resumoFinanceiro?.saldo?.toFixed(2) || '0,00'}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Receita Esperada/Mês:</span>
                <span className="text-sm font-medium">
                  R$ {resumoMembros?.receita_esperada_mensal?.toFixed(2) || '0,00'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Membros</CardTitle>
            <CardDescription>
              Informações sobre os membros do templo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total de Membros:</span>
              <span className="text-sm font-medium">
                {resumoMembros?.total_membros || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Receita Esperada:</span>
              <span className="text-sm text-green-600 font-medium">
                R$ {resumoMembros?.receita_esperada_mensal?.toFixed(2) || '0,00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Receita do Mês:</span>
              <span className="text-sm text-blue-600 font-medium">
                R$ {resumoMembros?.receita_mes_atual?.toFixed(2) || '0,00'}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Inadimplentes:</span>
                <span className="text-sm text-red-600 font-medium">
                  {resumoMembros?.membros_inadimplentes || 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taxa de Adimplência:</span>
              <span className="font-medium text-green-600">
                {resumoMembros?.percentual_adimplencia?.toFixed(1) || '0'}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Materiais</CardTitle>
          <CardDescription>
            Situação do estoque de materiais religiosos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{resumoMateriais?.total_materiais || 0}</div>
              <div className="text-sm text-muted-foreground">Total de Materiais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{resumoMateriais?.materiais_baixo_estoque || 0}</div>
              <div className="text-sm text-muted-foreground">Estoque Baixo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {resumoMateriais?.valor_total_estoque?.toFixed(2) || '0,00'}
              </div>
              <div className="text-sm text-muted-foreground">Valor Total</div>
            </div>
          </div>
          
          {resumoMateriais?.materiais_por_categoria && resumoMateriais.materiais_por_categoria.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Materiais por Categoria:</h4>
              <div className="grid grid-cols-2 gap-2">
                {resumoMateriais.materiais_por_categoria.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.categoria}:</span>
                    <span className="font-medium">{item.quantidade}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

