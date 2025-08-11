import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Users, DollarSign, AlertTriangle, Trash2, Edit, CreditCard } from 'lucide-react'

export function Membros() {
  const [membros, setMembros] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false)
  const [editingMembro, setEditingMembro] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    data_nascimento: '',
    valor_mensalidade: '',
    observacoes: ''
  })
  const [pagamentoData, setPagamentoData] = useState({
    membro_id: '',
    mes_referencia: '',
    valor_pago: '',
    data_pagamento: '',
    observacoes: ''
  })

  useEffect(() => {
    fetchMembros()
    fetchPagamentos()
  }, [])

  const fetchMembros = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/membros')
      const data = await response.json()
      setMembros(data)
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPagamentos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pagamentos-mensalidade')
      const data = await response.json()
      setPagamentos(data)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    }
  }

  const handleSubmitMembro = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingMembro 
        ? `http://localhost:5000/api/membros/${editingMembro.id}`
        : 'http://localhost:5000/api/membros'
      
      const method = editingMembro ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          valor_mensalidade: parseFloat(formData.valor_mensalidade) || 0
        }),
      })

      if (response.ok) {
        await fetchMembros()
        setDialogOpen(false)
        setEditingMembro(null)
        setFormData({
          nome: '', telefone: '', email: '', endereco: '',
          data_nascimento: '', valor_mensalidade: '', observacoes: ''
        })
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
    }
  }

  const handleSubmitPagamento = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:5000/api/pagamentos-mensalidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pagamentoData,
          valor_pago: parseFloat(pagamentoData.valor_pago)
        }),
      })

      if (response.ok) {
        await fetchPagamentos()
        setPagamentoDialogOpen(false)
        setPagamentoData({
          membro_id: '', mes_referencia: '', valor_pago: '',
          data_pagamento: '', observacoes: ''
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao registrar pagamento')
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
    }
  }

  const handleEdit = (membro) => {
    setEditingMembro(membro)
    setFormData({
      nome: membro.nome,
      telefone: membro.telefone || '',
      email: membro.email || '',
      endereco: membro.endereco || '',
      data_nascimento: membro.data_nascimento || '',
      valor_mensalidade: membro.valor_mensalidade.toString(),
      observacoes: membro.observacoes || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      try {
        await fetch(`http://localhost:5000/api/membros/${id}`, { method: 'DELETE' })
        await fetchMembros()
      } catch (error) {
        console.error('Erro ao remover membro:', error)
      }
    }
  }

  const handleDeletePagamento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este pagamento?')) {
      try {
        await fetch(`http://localhost:5000/api/pagamentos-mensalidade/${id}`, { method: 'DELETE' })
        await fetchPagamentos()
      } catch (error) {
        console.error('Erro ao excluir pagamento:', error)
      }
    }
  }

  const totalMembros = membros.length
  const receitaEsperada = membros.reduce((sum, m) => sum + m.valor_mensalidade, 0)
  const mesAtual = new Date().toISOString().slice(0, 7)
  const pagamentosMesAtual = pagamentos.filter(p => p.mes_referencia === mesAtual)
  const receitaMesAtual = pagamentosMesAtual.reduce((sum, p) => sum + p.valor_pago, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Membros</h1>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Membros do Templo</h1>
          <p className="text-muted-foreground">
            Gerencie os membros e suas mensalidades
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Pagamento de Mensalidade</DialogTitle>
                <DialogDescription>
                  Registre o pagamento da mensalidade de um membro.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitPagamento} className="space-y-4">
                <div>
                  <Label htmlFor="membro">Membro</Label>
                  <select
                    id="membro"
                    className="w-full p-2 border rounded-md"
                    value={pagamentoData.membro_id}
                    onChange={(e) => setPagamentoData({ ...pagamentoData, membro_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um membro</option>
                    {membros.map((membro) => (
                      <option key={membro.id} value={membro.id}>
                        {membro.nome} - R$ {membro.valor_mensalidade.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="mes_referencia">Mês de Referência</Label>
                  <Input
                    id="mes_referencia"
                    type="month"
                    value={pagamentoData.mes_referencia}
                    onChange={(e) => setPagamentoData({ ...pagamentoData, mes_referencia: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="valor_pago">Valor Pago</Label>
                  <Input
                    id="valor_pago"
                    type="number"
                    step="0.01"
                    value={pagamentoData.valor_pago}
                    onChange={(e) => setPagamentoData({ ...pagamentoData, valor_pago: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_pagamento">Data do Pagamento</Label>
                  <Input
                    id="data_pagamento"
                    type="date"
                    value={pagamentoData.data_pagamento}
                    onChange={(e) => setPagamentoData({ ...pagamentoData, data_pagamento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes_pagamento">Observações</Label>
                  <Textarea
                    id="observacoes_pagamento"
                    value={pagamentoData.observacoes}
                    onChange={(e) => setPagamentoData({ ...pagamentoData, observacoes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setPagamentoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingMembro(null)
                setFormData({
                  nome: '', telefone: '', email: '', endereco: '',
                  data_nascimento: '', valor_mensalidade: '', observacoes: ''
                })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMembro ? 'Editar Membro' : 'Novo Membro'}
                </DialogTitle>
                <DialogDescription>
                  {editingMembro 
                    ? 'Edite os dados do membro abaixo.'
                    : 'Adicione um novo membro ao templo.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitMembro} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="valor_mensalidade">Valor da Mensalidade</Label>
                    <Input
                      id="valor_mensalidade"
                      type="number"
                      step="0.01"
                      value={formData.valor_mensalidade}
                      onChange={(e) => setFormData({ ...formData, valor_mensalidade: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingMembro ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembros}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Esperada</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {receitaEsperada.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mensalidades mensais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {receitaMesAtual.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="membros" className="space-y-4">
        <TabsList>
          <TabsTrigger value="membros">Membros</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="membros">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Membros</CardTitle>
              <CardDescription>
                Todos os membros ativos do templo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membros.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum membro encontrado. Clique em "Novo Membro" para começar.
                </div>
              ) : (
                <div className="space-y-4">
                  {membros.map((membro) => (
                    <div key={membro.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{membro.nome}</h3>
                          {membro.valor_mensalidade > 0 && (
                            <Badge variant="outline">
                              R$ {membro.valor_mensalidade.toFixed(2)}/mês
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {membro.telefone && `${membro.telefone} • `}
                          {membro.email && `${membro.email} • `}
                          Membro desde {new Date(membro.data_ingresso).toLocaleDateString('pt-BR')}
                        </p>
                        {membro.observacoes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {membro.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(membro)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(membro.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Registro de todas as mensalidades pagas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pagamentos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento registrado.
                </div>
              ) : (
                <div className="space-y-4">
                  {pagamentos.map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{pagamento.membro_nome}</h3>
                          <Badge variant="default">
                            {new Date(pagamento.mes_referencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pago em {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                          {pagamento.observacoes && ` • ${pagamento.observacoes}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          R$ {pagamento.valor_pago.toFixed(2)}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePagamento(pagamento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

