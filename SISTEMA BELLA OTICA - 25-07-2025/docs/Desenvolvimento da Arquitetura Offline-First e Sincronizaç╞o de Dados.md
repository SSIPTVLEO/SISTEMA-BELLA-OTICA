# Desenvolvimento da Arquitetura Offline-First e Sincronização de Dados

## 1. Visão Geral da Arquitetura Offline-First

A arquitetura offline-first é crucial para garantir que o sistema da Bella Ótica continue operando mesmo quando a conexão com a internet for perdida. Esta abordagem envolve:

1. **Armazenamento Local**: Dados críticos são armazenados localmente no dispositivo
2. **Sincronização Automática**: Quando a conexão é restabelecida, os dados são sincronizados automaticamente
3. **Resolução de Conflitos**: Estratégias para lidar com conflitos quando múltiplos usuários editam os mesmos dados offline
4. **Interface Responsiva**: A interface deve indicar claramente o status da conexão e sincronização

## 2. Tecnologias para Implementação Offline-First

### Frontend (React)
- **Dexie.js**: Wrapper moderno para IndexedDB, oferecendo uma API simples e poderosa
- **React Query/TanStack Query**: Para cache inteligente e sincronização de dados
- **Service Workers**: Para interceptar requisições e servir dados do cache quando offline
- **Zustand**: Para gerenciamento de estado global, incluindo status de conexão

### Backend (Supabase)
- **Realtime Subscriptions**: Para detectar mudanças em tempo real
- **Edge Functions**: Para lógica de sincronização complexa
- **Database Triggers**: Para auditoria e controle de versões

## 3. Estrutura de Dados para Offline

### Metadados de Sincronização
Cada tabela principal deve ter campos adicionais para controle de sincronização:

```sql
-- Adicionar a todas as tabelas principais
ALTER TABLE clientes ADD COLUMN 
    sync_version BIGINT DEFAULT 1,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    offline_id TEXT; -- ID temporário para registros criados offline

-- Trigger para atualizar last_modified automaticamente
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    NEW.sync_version = OLD.sync_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_last_modified
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified();
```

### Tabela de Log de Sincronização
```sql
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    user_id UUID REFERENCES auth.users(id),
    sync_version BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. Implementação no Frontend

### Configuração do Dexie.js
```typescript
// src/lib/offline-db.ts
import Dexie, { Table } from 'dexie';

export interface Cliente {
  id?: string;
  nome: string;
  cpf: string;
  data_nascimento?: string;
  endereco?: string;
  numero?: number;
  bairro?: string;
  cidade?: string;
  telefone?: string;
  criado_por?: string;
  loja_id: string;
  sync_version: number;
  last_modified: string;
  is_deleted: boolean;
  offline_id?: string;
  needs_sync?: boolean; // Flag local para indicar se precisa sincronizar
}

export interface OrdemServico {
  id?: string;
  numero_os: number;
  data_pedido: string;
  cliente_id: string;
  loja_id: string;
  funcionario_id: string;
  criado_por?: string;
  status: string;
  sync_version: number;
  last_modified: string;
  is_deleted: boolean;
  offline_id?: string;
  needs_sync?: boolean;
}

export interface SyncQueue {
  id?: number;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  created_at: string;
  attempts: number;
}

export class OfflineDatabase extends Dexie {
  clientes!: Table<Cliente>;
  ordens_servico!: Table<OrdemServico>;
  produtos!: Table<any>;
  estoque_lojas!: Table<any>;
  sync_queue!: Table<SyncQueue>;

  constructor() {
    super('BellaOticaOfflineDB');
    
    this.version(1).stores({
      clientes: '++id, cpf, loja_id, sync_version, last_modified, needs_sync',
      ordens_servico: '++id, numero_os, loja_id, cliente_id, sync_version, last_modified, needs_sync',
      produtos: '++id, referencia, sync_version, last_modified',
      estoque_lojas: '++id, produto_id, loja_id, sync_version, last_modified',
      sync_queue: '++id, table_name, created_at, attempts'
    });
  }
}

export const offlineDb = new OfflineDatabase();
```

### Service de Sincronização
```typescript
// src/lib/sync-service.ts
import { supabaseClient } from './supabaseClient';
import { offlineDb, SyncQueue } from './offline-db';

export class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    // Monitorar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sincronização periódica quando online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncAll();
      }
    }, 30000); // A cada 30 segundos
  }

  async syncAll() {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    try {
      // 1. Enviar dados locais para o servidor
      await this.pushLocalChanges();
      
      // 2. Buscar dados atualizados do servidor
      await this.pullServerChanges();
      
      console.log('Sincronização concluída com sucesso');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pushLocalChanges() {
    const queueItems = await offlineDb.sync_queue.orderBy('created_at').toArray();
    
    for (const item of queueItems) {
      try {
        await this.processQueueItem(item);
        await offlineDb.sync_queue.delete(item.id!);
      } catch (error) {
        // Incrementar tentativas e reagendar se necessário
        await offlineDb.sync_queue.update(item.id!, {
          attempts: item.attempts + 1
        });
        
        // Remover da fila após 5 tentativas falhadas
        if (item.attempts >= 5) {
          await offlineDb.sync_queue.delete(item.id!);
          console.error(`Falha permanente ao sincronizar item ${item.id}:`, error);
        }
      }
    }
  }

  private async processQueueItem(item: SyncQueue) {
    const { table_name, operation, data } = item;

    switch (operation) {
      case 'INSERT':
        const { data: insertResult, error: insertError } = await supabaseClient
          .from(table_name)
          .insert(data)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        // Atualizar registro local com ID do servidor
        if (data.offline_id) {
          await this.updateLocalRecordWithServerId(table_name, data.offline_id, insertResult.id);
        }
        break;

      case 'UPDATE':
        const { error: updateError } = await supabaseClient
          .from(table_name)
          .update(data)
          .eq('id', data.id);
        
        if (updateError) throw updateError;
        break;

      case 'DELETE':
        const { error: deleteError } = await supabaseClient
          .from(table_name)
          .delete()
          .eq('id', data.id);
        
        if (deleteError) throw deleteError;
        break;
    }
  }

  private async updateLocalRecordWithServerId(tableName: string, offlineId: string, serverId: string) {
    const table = (offlineDb as any)[tableName];
    if (table) {
      await table.where('offline_id').equals(offlineId).modify({
        id: serverId,
        offline_id: undefined,
        needs_sync: false
      });
    }
  }

  private async pullServerChanges() {
    // Buscar última sincronização
    const lastSync = localStorage.getItem('last_sync_timestamp') || '1970-01-01T00:00:00Z';
    
    // Buscar dados atualizados de cada tabela
    const tables = ['clientes', 'ordens_servico', 'produtos', 'estoque_lojas'];
    
    for (const tableName of tables) {
      await this.pullTableChanges(tableName, lastSync);
    }
    
    // Atualizar timestamp da última sincronização
    localStorage.setItem('last_sync_timestamp', new Date().toISOString());
  }

  private async pullTableChanges(tableName: string, lastSync: string) {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select('*')
      .gte('last_modified', lastSync);

    if (error) throw error;

    const table = (offlineDb as any)[tableName];
    if (table && data) {
      for (const record of data) {
        if (record.is_deleted) {
          await table.delete(record.id);
        } else {
          await table.put({
            ...record,
            needs_sync: false
          });
        }
      }
    }
  }

  // Métodos para operações CRUD offline
  async createRecord(tableName: string, data: any) {
    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record = {
      ...data,
      offline_id: offlineId,
      sync_version: 1,
      last_modified: new Date().toISOString(),
      is_deleted: false,
      needs_sync: true
    };

    // Salvar localmente
    const table = (offlineDb as any)[tableName];
    await table.add(record);

    // Adicionar à fila de sincronização
    await offlineDb.sync_queue.add({
      table_name: tableName,
      record_id: offlineId,
      operation: 'INSERT',
      data: record,
      created_at: new Date().toISOString(),
      attempts: 0
    });

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncAll();
    }

    return record;
  }

  async updateRecord(tableName: string, id: string, data: any) {
    const table = (offlineDb as any)[tableName];
    const existingRecord = await table.get(id);
    
    if (!existingRecord) {
      throw new Error(`Registro não encontrado: ${id}`);
    }

    const updatedRecord = {
      ...existingRecord,
      ...data,
      sync_version: existingRecord.sync_version + 1,
      last_modified: new Date().toISOString(),
      needs_sync: true
    };

    // Atualizar localmente
    await table.put(updatedRecord);

    // Adicionar à fila de sincronização
    await offlineDb.sync_queue.add({
      table_name: tableName,
      record_id: id,
      operation: 'UPDATE',
      data: updatedRecord,
      created_at: new Date().toISOString(),
      attempts: 0
    });

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncAll();
    }

    return updatedRecord;
  }

  async deleteRecord(tableName: string, id: string) {
    const table = (offlineDb as any)[tableName];
    const existingRecord = await table.get(id);
    
    if (!existingRecord) {
      throw new Error(`Registro não encontrado: ${id}`);
    }

    // Marcar como deletado (soft delete)
    const deletedRecord = {
      ...existingRecord,
      is_deleted: true,
      sync_version: existingRecord.sync_version + 1,
      last_modified: new Date().toISOString(),
      needs_sync: true
    };

    await table.put(deletedRecord);

    // Adicionar à fila de sincronização
    await offlineDb.sync_queue.add({
      table_name: tableName,
      record_id: id,
      operation: 'DELETE',
      data: { id },
      created_at: new Date().toISOString(),
      attempts: 0
    });

    // Tentar sincronizar imediatamente se online
    if (this.isOnline) {
      this.syncAll();
    }

    return deletedRecord;
  }

  getConnectionStatus() {
    return this.isOnline;
  }

  getSyncStatus() {
    return this.syncInProgress;
  }
}

export const syncService = new SyncService();
```

### Hook React para Sincronização
```typescript
// src/hooks/useOfflineSync.ts
import { useState, useEffect } from 'react';
import { syncService } from '../lib/sync-service';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitorar status de sincronização
    const syncInterval = setInterval(() => {
      setIsSyncing(syncService.getSyncStatus());
      
      const lastSync = localStorage.getItem('last_sync_timestamp');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  const forcSync = async () => {
    await syncService.syncAll();
  };

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    forcSync
  };
}
```

## 5. Componente de Status de Conexão

```typescript
// src/components/ConnectionStatus.tsx
import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

export function ConnectionStatus() {
  const { isOnline, isSyncing, lastSyncTime, forcSync } = useOfflineSync();

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <div className="flex items-center space-x-1 text-green-600">
          <Wifi className="w-4 h-4" />
          <span>Online</span>
        </div>
      ) : (
        <div className="flex items-center space-x-1 text-red-600">
          <WifiOff className="w-4 h-4" />
          <span>Offline</span>
        </div>
      )}

      {isSyncing ? (
        <div className="flex items-center space-x-1 text-blue-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Sincronizando...</span>
        </div>
      ) : (
        lastSyncTime && (
          <div className="flex items-center space-x-1 text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>
              Última sync: {lastSyncTime.toLocaleTimeString()}
            </span>
          </div>
        )
      )}

      <button
        onClick={forcSync}
        disabled={!isOnline || isSyncing}
        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        Sincronizar
      </button>
    </div>
  );
}
```

## 6. Resolução de Conflitos

### Estratégia Last Write Wins
```typescript
// src/lib/conflict-resolution.ts
export interface ConflictResolution {
  strategy: 'last_write_wins' | 'manual_resolution' | 'merge';
  resolvedData?: any;
  requiresUserInput?: boolean;
}

export function resolveConflict(
  localRecord: any,
  serverRecord: any,
  strategy: 'last_write_wins' | 'manual_resolution' = 'last_write_wins'
): ConflictResolution {
  
  if (strategy === 'last_write_wins') {
    const localTime = new Date(localRecord.last_modified);
    const serverTime = new Date(serverRecord.last_modified);
    
    return {
      strategy: 'last_write_wins',
      resolvedData: localTime > serverTime ? localRecord : serverRecord
    };
  }

  // Para resolução manual, retornar ambos os registros para o usuário decidir
  return {
    strategy: 'manual_resolution',
    requiresUserInput: true
  };
}
```

## 7. Configuração do Service Worker

```typescript
// public/sw.js
const CACHE_NAME = 'bella-otica-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna o cache se disponível, senão busca na rede
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
```

## 8. Testes da Funcionalidade Offline

```typescript
// src/__tests__/offline-sync.test.ts
import { syncService } from '../lib/sync-service';
import { offlineDb } from '../lib/offline-db';

describe('Offline Sync', () => {
  beforeEach(async () => {
    await offlineDb.delete();
    await offlineDb.open();
  });

  test('deve criar registro offline', async () => {
    const cliente = {
      nome: 'João Silva',
      cpf: '12345678901',
      loja_id: 'loja-1'
    };

    const result = await syncService.createRecord('clientes', cliente);
    
    expect(result.offline_id).toBeDefined();
    expect(result.needs_sync).toBe(true);
    
    const localRecord = await offlineDb.clientes.get(result.offline_id);
    expect(localRecord).toBeDefined();
  });

  test('deve sincronizar quando voltar online', async () => {
    // Simular criação offline
    const cliente = await syncService.createRecord('clientes', {
      nome: 'Maria Santos',
      cpf: '98765432100',
      loja_id: 'loja-1'
    });

    // Simular sincronização
    await syncService.syncAll();

    // Verificar se foi removido da fila
    const queueItems = await offlineDb.sync_queue.toArray();
    expect(queueItems.length).toBe(0);
  });
});
```

Esta arquitetura offline-first garante que o sistema da Bella Ótica continue funcionando mesmo sem conexão com a internet, sincronizando automaticamente os dados quando a conexão for restabelecida. A implementação é robusta, com tratamento de conflitos e interface clara para o usuário sobre o status da sincronização.

