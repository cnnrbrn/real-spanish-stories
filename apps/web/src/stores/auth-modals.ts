import { create } from 'zustand'

interface AuthModalsState {
  loginOpen: boolean
  signupOpen: boolean
  forgotOpen: boolean
  checkEmailOpen: boolean
  resetSentOpen: boolean
  loginHeadline: string | null

  openLogin: (options?: { headline?: string }) => void
  openSignup: () => void
  openForgot: () => void
  setLoginOpen: (open: boolean) => void
  setSignupOpen: (open: boolean) => void
  setForgotOpen: (open: boolean) => void
  setCheckEmailOpen: (open: boolean) => void
  setResetSentOpen: (open: boolean) => void
}

export const useAuthModals = create<AuthModalsState>((set) => ({
  loginOpen: false,
  signupOpen: false,
  forgotOpen: false,
  checkEmailOpen: false,
  resetSentOpen: false,
  loginHeadline: null,

  openLogin: (options) =>
    set({
      loginOpen: true,
      signupOpen: false,
      forgotOpen: false,
      loginHeadline: options?.headline ?? null,
    }),
  openSignup: () =>
    set({
      loginOpen: false,
      signupOpen: true,
      forgotOpen: false,
      loginHeadline: null,
    }),
  openForgot: () =>
    set({
      loginOpen: false,
      signupOpen: false,
      forgotOpen: true,
    }),
  setLoginOpen: (open) =>
    set((s) => ({
      loginOpen: open,
      loginHeadline: open ? s.loginHeadline : null,
    })),
  setSignupOpen: (open) => set({ signupOpen: open }),
  setForgotOpen: (open) => set({ forgotOpen: open }),
  setCheckEmailOpen: (open) => set({ checkEmailOpen: open }),
  setResetSentOpen: (open) => set({ resetSentOpen: open }),
}))
