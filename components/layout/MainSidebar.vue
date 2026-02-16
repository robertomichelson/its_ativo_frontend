<template>
  <!-- Botao hamburguer mobile -->
  <button
    v-if="isMobile"
    class="hamburger-btn"
    @click="toggleMenu"
    :class="{ active: isOpen }"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

  <!-- Overlay mobile -->
  <div
    v-if="isMobile && isOpen"
    class="sidebar-overlay"
    @click="toggleMenu"
  ></div>

  <aside
    class="sidebar"
    @mouseenter="!isMobile && (hover = true)"
    @mouseleave="!isMobile && (hover = false)"
    :class="{ collapsed: isCollapsed, show: isOpen }"
  >
    <div class="sidebar-header">
      <img
        src="https://www.itscs.com.br/wp-content/themes/itscs/images/logotipo-itscs.png"
        alt="Logo ITS"
        class="logo"
        :class="{ collapsed: isCollapsed }"
      />
    </div>

    <div class="menu-items">
      <template v-for="item in menuItems" :key="item.id">
        <!-- Item sem submenu -->
        <div
          v-if="!item.submenu"
          class="menu-item"
          :class="{ active: item.path && isActive(item.path) }"
          @click="item.path && goTo(item.path)"
        >
          <q-icon :name="item.icon" class="icon" />
          <span class="label">{{ item.label }}</span>
        </div>

        <!-- Item com submenu -->
        <div v-else>
          <div
            class="menu-item submenu-header"
            :class="{
              active: isSubmenuActive(item.submenu),
              expanded: expandedMenus[item.id],
            }"
            @click="toggleSubmenu(item.id)"
          >
            <q-icon :name="item.icon" class="icon" />
            <span class="label">{{ item.label }}</span>
            <q-icon
              name="expand_more"
              class="expand-icon"
              :class="{ rotated: expandedMenus[item.id] }"
            />
          </div>

          <div class="submenu" :class="{ expanded: expandedMenus[item.id] }">
            <div
              v-for="subitem in item.submenu"
              :key="subitem.id"
              class="menu-item submenu-item"
              :class="{ active: isActive(subitem.path) }"
              @click="goTo(subitem.path)"
            >
              <q-icon :name="subitem.icon" class="icon" />
              <span class="label">{{ subitem.label }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Logout -->
    <div class="sidebar-footer">
      <div class="logout-button" @click="handleLogout">
        <q-icon name="logout" class="icon" />
        <span class="label">Sair</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { inject, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/store/auth'
import { logout } from '~/services/auth.service'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarState = inject('sidebarState') as {
  hover: Ref<boolean>
  isMobile: Ref<boolean>
  isCollapsed: ComputedRef<boolean>
  isOpen: Ref<boolean>
  toggleMenu: () => void
}

const { hover, isMobile, isCollapsed, isOpen, toggleMenu } = sidebarState

const expandedMenus = ref<Record<string, boolean>>({})

interface MenuItem {
  id: string
  label: string
  icon: string
  path?: string
  submenu?: Array<{
    id: string
    label: string
    icon: string
    path: string
  }>
}

const perfis: number[] = authStore.user?.idperfil || []
const isAdmin = computed(() => perfis.includes(1))

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [
    {
      id: 'home',
      label: 'HOME',
      icon: 'home',
      path: '/home',
    },
  ]

  if (isAdmin.value) {
    items.push({
      id: 'usuarios',
      label: 'USUARIOS',
      icon: 'group',
      path: '/usuarios',
    })
  }

  return items
})

const updateExpandedMenus = () => {
  const currentPath = route.path
  const newExpandedMenus: Record<string, boolean> = {}

  menuItems.value.forEach((item) => {
    if (item.submenu) {
      const hasActiveSubitem = item.submenu.some((subitem) => currentPath.startsWith(subitem.path))
      newExpandedMenus[item.id] = hasActiveSubitem
    }
  })

  expandedMenus.value = newExpandedMenus
}

watch(() => route.path, () => updateExpandedMenus())
updateExpandedMenus()

const isActive = (path: string) => route.path.startsWith(path)

const isSubmenuActive = (submenu: any[]) => submenu.some((item) => isActive(item.path))

const toggleSubmenu = (menuId: string) => {
  expandedMenus.value[menuId] = !expandedMenus.value[menuId]
}

const goTo = (path: string) => {
  router.push(path)
  if (isMobile.value) toggleMenu()
}

const handleLogout = async () => {
  try {
    await logout()
    authStore.user = null
    authStore.ready = false
    await router.push('/auth')
  } catch (err) {
    console.error('Erro ao deslogar:', err)
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
  overflow-y: auto;
  height: 100vh;
  position: fixed;
  z-index: 10;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  scrollbar-width: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 80px;
  overflow: hidden;
}

.sidebar-header {
  position: relative;
}

.sidebar-header::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 65px;
  background: white;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .sidebar-header::before {
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.logo {
  width: 120px;
  height: auto;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.sidebar.collapsed .logo {
  width: 97px;
  margin-left: 49px;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  padding: 0.75rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 42px;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  position: relative;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
  border-left-color: rgba(224, 91, 61, 0.5);
}

.menu-item.active {
  background: rgba(224, 91, 61, 0.12);
  color: #E05B3D;
  border-left-color: #E05B3D;
}

.menu-item .icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  font-size: 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-item .label {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .menu-item .label {
  opacity: 0;
  width: 0;
}

/* Submenu */
.submenu-header {
  position: relative;
}

.expand-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: transform 0.3s ease;
  font-size: 0.875rem;
  opacity: 0.5;
}

.expand-icon.rotated {
  transform: translateY(-50%) rotate(180deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.12);
}

.submenu.expanded {
  max-height: 300px;
}

.submenu-item {
  padding-left: 3rem;
  font-size: 0.78rem;
  min-height: 38px;
}

.submenu-item .icon {
  width: 18px;
  height: 18px;
  font-size: 1.1rem;
}

/* Collapsed state */
.sidebar.collapsed .submenu,
.sidebar.collapsed .expand-icon {
  display: none;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0.65rem;
  gap: 0;
  border-left-color: transparent;
}

.sidebar.collapsed .menu-item:hover {
  background: transparent;
  border-left-color: transparent;
}

.sidebar.collapsed .menu-item:hover .icon {
  background: rgba(7, 174, 134, 0.15);
  border-radius: 10px;
  padding: 6px;
}

.sidebar.collapsed .menu-item.active {
  background: transparent;
  border-left-color: transparent;
}

.sidebar.collapsed .menu-item.active .icon {
  background: rgba(7, 174, 134, 0.2);
  color: #E05B3D;
  border-radius: 10px;
  padding: 6px;
}

.sidebar.collapsed .menu-item .icon {
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
}

/* Footer / Logout */
.sidebar-footer {
  margin-top: auto;
  padding: 0.75rem 0 1.25rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 42px;
  font-size: 0.8125rem;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.logout-button:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-left-color: #e74c3c;
}

.logout-button .icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  font-size: 1.35rem;
}

.logout-button .label {
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .logout-button {
  justify-content: center;
  gap: 0;
  padding: 0.65rem;
  border-left-color: transparent;
}

.sidebar.collapsed .logout-button .label {
  opacity: 0;
  width: 0;
}

.sidebar.collapsed .logout-button .icon {
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
}

.sidebar.collapsed .logout-button:hover .icon {
  background: rgba(231, 76, 60, 0.15);
  border-radius: 10px;
  padding: 6px;
}

/* Hamburger mobile */
.hamburger-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 1001;
  width: 46px;
  height: 46px;
  background: #1a1a2e;
  border: none;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.hamburger-btn span {
  width: 22px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsivo */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 280px !important;
    max-width: 85vw;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>
