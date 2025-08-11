from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from . import db

class Material(db.Model):
    __tablename__ = 'materiais'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(100), nullable=False)  # Velas, Ervas, Incensos, etc.
    subcategoria = db.Column(db.String(100))  # Cor da vela, tipo de erva, etc.
    unidade_medida = db.Column(db.String(20), default='unidade')  # unidade, kg, litro, etc.
    preco_unitario = db.Column(db.Float, nullable=False)
    quantidade_atual = db.Column(db.Float, default=0)
    quantidade_minima = db.Column(db.Float, default=5)  # Alerta de estoque baixo
    fornecedor = db.Column(db.String(200))
    local_armazenamento = db.Column(db.String(100))  # Onde está guardado no templo
    observacoes = db.Column(db.Text)
    ativo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'descricao': self.descricao,
            'categoria': self.categoria,
            'subcategoria': self.subcategoria,
            'unidade_medida': self.unidade_medida,
            'preco_unitario': self.preco_unitario,
            'quantidade_atual': self.quantidade_atual,
            'quantidade_minima': self.quantidade_minima,
            'fornecedor': self.fornecedor,
            'local_armazenamento': self.local_armazenamento,
            'observacoes': self.observacoes,
            'ativo': self.ativo,
            'valor_total': self.preco_unitario * self.quantidade_atual,
            'estoque_baixo': self.quantidade_atual <= self.quantidade_minima,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MovimentacaoEstoque(db.Model):
    __tablename__ = 'movimentacoes_estoque'
    
    id = db.Column(db.Integer, primary_key=True)
    material_id = db.Column(db.Integer, db.ForeignKey('materiais.id'), nullable=False)
    tipo_movimentacao = db.Column(db.String(20), nullable=False)  # 'entrada', 'saida', 'ajuste'
    quantidade = db.Column(db.Float, nullable=False)
    motivo = db.Column(db.String(200), nullable=False)
    observacoes = db.Column(db.Text)
    data_movimentacao = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    material = db.relationship('Material', backref='movimentacoes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'material_id': self.material_id,
            'material_nome': self.material.nome if self.material else None,
            'tipo_movimentacao': self.tipo_movimentacao,
            'quantidade': self.quantidade,
            'motivo': self.motivo,
            'observacoes': self.observacoes,
            'data_movimentacao': self.data_movimentacao.isoformat() if self.data_movimentacao else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

