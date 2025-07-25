// src/lib/offline-db.js
import Dexie from 'dexie'

export class OfflineDatabase extends Dexie {
  constructor() {
    super('BellaOticaDB')
    
    this.version(1).stores({
      // Tabelas principais
      lojas: '++id, nome, cnpj, sync_version, last_modified, needs_sync',
      funcionarios: '++id, user_id, loja_id, role, sync_version, last_modified, needs_sync',
      clientes: '++id, cpf, loja_id, criado_por, sync_version, last_modified, needs_sync',
      produtos: '++id, referencia, sync_version, last_modified, needs_sync',
      estoque_lojas: '++id, produto_id, loja_id, sync_version, last_modified, needs_sync',
      ordens_servico: '++id, numero_os, loja_id, cliente_id, criado_por, sync_version, last_modified, needs_sync',
      notas_fiscais: '++id, numero_nf, loja_id, criado_por, sync_version, last_modified, needs_sync',
      caixa: '++id, loja_id, criado_por, sync_version, last_modified, needs_sync',
      
      // Tabelas de controle
      sync_queue: '++id, table_name, record_id, operation, created_at, attempts',
      sync_metadata: 'table_name, last_sync_timestamp'
    })
  }
}

export const offlineDb = new OfflineDatabase()

