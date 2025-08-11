from flask import Blueprint, jsonify, request
from datetime import datetime, date
from src.models.membro import Membro, PagamentoMensalidade, db

membro_bp = Blueprint('membro', __name__)

@membro_bp.route('/membros', methods=['GET'])
def get_membros():
    membros = Membro.query.filter_by(ativo=True).order_by(Membro.nome).all()
    return jsonify([membro.to_dict() for membro in membros])

@membro_bp.route('/membros', methods=['POST'])
def create_membro():
    data = request.json
    
    # Converter data de nascimento se fornecida
    data_nascimento = None
    if data.get('data_nascimento'):
        data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
    
    membro = Membro(
        nome=data['nome'],
        telefone=data.get('telefone'),
        email=data.get('email'),
        endereco=data.get('endereco'),
        data_nascimento=data_nascimento,
        valor_mensalidade=data.get('valor_mensalidade', 0.0),
        observacoes=data.get('observacoes')
    )
    db.session.add(membro)
    db.session.commit()
    return jsonify(membro.to_dict()), 201

@membro_bp.route('/membros/<int:membro_id>', methods=['GET'])
def get_membro(membro_id):
    membro = Membro.query.get_or_404(membro_id)
    return jsonify(membro.to_dict())

@membro_bp.route('/membros/<int:membro_id>', methods=['PUT'])
def update_membro(membro_id):
    membro = Membro.query.get_or_404(membro_id)
    data = request.json
    
    membro.nome = data.get('nome', membro.nome)
    membro.telefone = data.get('telefone', membro.telefone)
    membro.email = data.get('email', membro.email)
    membro.endereco = data.get('endereco', membro.endereco)
    membro.valor_mensalidade = data.get('valor_mensalidade', membro.valor_mensalidade)
    membro.observacoes = data.get('observacoes', membro.observacoes)
    
    if data.get('data_nascimento'):
        membro.data_nascimento = datetime.strptime(data['data_nascimento'], '%Y-%m-%d').date()
    
    db.session.commit()
    return jsonify(membro.to_dict())

@membro_bp.route('/membros/<int:membro_id>', methods=['DELETE'])
def delete_membro(membro_id):
    membro = Membro.query.get_or_404(membro_id)
    membro.ativo = False  # Soft delete
    db.session.commit()
    return '', 204

@membro_bp.route('/membros/<int:membro_id>/pagamentos', methods=['GET'])
def get_pagamentos_membro(membro_id):
    pagamentos = PagamentoMensalidade.query.filter_by(membro_id=membro_id).order_by(PagamentoMensalidade.mes_referencia.desc()).all()
    return jsonify([pagamento.to_dict() for pagamento in pagamentos])

@membro_bp.route('/pagamentos-mensalidade', methods=['GET'])
def get_pagamentos():
    pagamentos = PagamentoMensalidade.query.order_by(PagamentoMensalidade.data_pagamento.desc()).all()
    return jsonify([pagamento.to_dict() for pagamento in pagamentos])

@membro_bp.route('/pagamentos-mensalidade', methods=['POST'])
def create_pagamento():
    data = request.json
    
    # Verificar se já existe pagamento para este membro no mês
    existing = PagamentoMensalidade.query.filter_by(
        membro_id=data['membro_id'],
        mes_referencia=data['mes_referencia']
    ).first()
    
    if existing:
        return jsonify({'error': 'Já existe pagamento para este membro neste mês'}), 400
    
    pagamento = PagamentoMensalidade(
        membro_id=data['membro_id'],
        mes_referencia=data['mes_referencia'],
        valor_pago=data['valor_pago'],
        observacoes=data.get('observacoes')
    )
    
    if data.get('data_pagamento'):
        pagamento.data_pagamento = datetime.strptime(data['data_pagamento'], '%Y-%m-%d').date()
    
    db.session.add(pagamento)
    db.session.commit()
    return jsonify(pagamento.to_dict()), 201

@membro_bp.route('/pagamentos-mensalidade/<int:pagamento_id>', methods=['DELETE'])
def delete_pagamento(pagamento_id):
    pagamento = PagamentoMensalidade.query.get_or_404(pagamento_id)
    db.session.delete(pagamento)
    db.session.commit()
    return '', 204

@membro_bp.route('/membros/inadimplentes', methods=['GET'])
def get_membros_inadimplentes():
    # Pegar mês atual
    mes_atual = datetime.now().strftime('%Y-%m')
    
    # Buscar membros ativos que não pagaram este mês
    membros_ativos = Membro.query.filter_by(ativo=True).all()
    inadimplentes = []
    
    for membro in membros_ativos:
        pagamento_mes = PagamentoMensalidade.query.filter_by(
            membro_id=membro.id,
            mes_referencia=mes_atual
        ).first()
        
        if not pagamento_mes and membro.valor_mensalidade > 0:
            inadimplentes.append(membro.to_dict())
    
    return jsonify(inadimplentes)

@membro_bp.route('/resumo-membros', methods=['GET'])
def get_resumo_membros():
    total_membros = Membro.query.filter_by(ativo=True).count()
    
    # Receita mensal esperada
    receita_esperada = db.session.query(db.func.sum(Membro.valor_mensalidade)).filter_by(ativo=True).scalar() or 0
    
    # Receita do mês atual
    mes_atual = datetime.now().strftime('%Y-%m')
    receita_mes = db.session.query(db.func.sum(PagamentoMensalidade.valor_pago)).filter_by(mes_referencia=mes_atual).scalar() or 0
    
    # Membros inadimplentes
    membros_ativos = Membro.query.filter_by(ativo=True).all()
    inadimplentes = 0
    
    for membro in membros_ativos:
        pagamento_mes = PagamentoMensalidade.query.filter_by(
            membro_id=membro.id,
            mes_referencia=mes_atual
        ).first()
        
        if not pagamento_mes and membro.valor_mensalidade > 0:
            inadimplentes += 1
    
    return jsonify({
        'total_membros': total_membros,
        'receita_esperada_mensal': receita_esperada,
        'receita_mes_atual': receita_mes,
        'membros_inadimplentes': inadimplentes,
        'percentual_adimplencia': ((total_membros - inadimplentes) / total_membros * 100) if total_membros > 0 else 0
    })

