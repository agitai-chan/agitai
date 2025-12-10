import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ==========================================
// UI Store Types
// ==========================================

interface UIState {
  // 사이드바
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // 테마
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // 코멘트 패널
  commentPanelOpen: boolean;
  toggleCommentPanel: () => void;
  setCommentPanelOpen: (open: boolean) => void;
  
  // 모달
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  // 전역 로딩
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

// ==========================================
// UI Store
// ==========================================

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // 사이드바
      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // 테마
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // 코멘트 패널
      commentPanelOpen: true,
      toggleCommentPanel: () => set({ commentPanelOpen: !get().commentPanelOpen }),
      setCommentPanelOpen: (open) => set({ commentPanelOpen: open }),
      
      // 모달
      activeModal: null,
      modalData: null,
      openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),
      
      // 전역 로딩
      globalLoading: false,
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: 'agit-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        commentPanelOpen: state.commentPanelOpen,
      }),
    }
  )
);
