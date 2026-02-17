<template>
  <div class="clt">
    <span class="clt__name">{{ client.name }}</span>

    <span class="clt__sep" />

    <span class="clt__field clt__field--phone">
      <q-icon name="phone_in_talk" size="13px" />
      <template v-if="client.ddd">({{ client.ddd }}) </template>{{ client.phones[0] }}
      <span v-if="client.phones.length > 1" class="clt__more">
        +{{ client.phones.length - 1 }}
        <q-tooltip>
          <div v-for="(p, i) in client.phones.slice(1)" :key="i">{{ p }}</div>
        </q-tooltip>
      </span>
    </span>

    <span class="clt__sep" />

    <span class="clt__field">
      <q-icon name="badge" size="13px" />
      {{ client.cpf }}
    </span>

    <span v-if="client.address" class="clt__sep" />

    <span v-if="client.address" class="clt__field clt__addr">
      <q-icon name="location_on" size="13px" />
      {{ client.address.street }}, {{ client.address.number }}
      <template v-if="client.address.complement"> – {{ client.address.complement }}</template>
      · {{ client.address.neighborhood }} · {{ client.address.city }}/{{ client.address.state }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ClientData } from '~/services/attendance.service'
defineProps<{ client: ClientData }>()
</script>

<style scoped>
.clt {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 0.75rem 1.1rem;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.clt__name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.clt__sep {
  width: 1px;
  height: 14px;
  background: var(--border);
  flex-shrink: 0;
}

.clt__field {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--muted);
  white-space: nowrap;
}

.clt__field--phone {
  color: var(--green);
  font-weight: 600;
}

.clt__addr {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clt__more {
  font-size: 0.65rem;
  font-weight: 700;
  background: var(--border);
  padding: 1px 5px;
  border-radius: 4px;
  cursor: default;
  color: var(--muted);
}

@media (max-width: 768px) {
  .clt__sep { display: none; }
}
</style>
