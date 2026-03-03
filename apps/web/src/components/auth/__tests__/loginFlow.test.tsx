/**
 * Teste do fluxo de login completo: formulário → chamada à API → atualização do contexto → navegação.
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginForm from "../LoginForm";
import { AuthProvider } from "@/lib/auth";
import * as authService from "../../../services/authService";
import type { User } from "@/types/user";

const mockUser: User = {
  _id: "user-1",
  name: "Usuário Teste",
  email: "teste@example.com",
  language: "pt-BR",
  isPremium: false,
  isEmailVerified: true,
  twoFactorEnabled: false,
  newsletterEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("../../../services/authService", () => ({
  getStoredToken: () => null,
  setAuthToken: jest.fn(),
  clearAuthToken: jest.fn(),
  setForceLoginCookie: jest.fn(),
  clearForceLoginCookie: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
  refreshToken: jest.fn(),
  logout: jest.fn(),
}));

function renderLoginFlow() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe("Fluxo de login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.login as jest.Mock).mockResolvedValue({ user: mockUser });
    (authService.getProfile as jest.Mock).mockRejectedValue(new Error("não autenticado"));
  });

  it("ao enviar credenciais válidas, chama login e redireciona para /dashboard", async () => {
    renderLoginFlow();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText("seu@email.com");
    const passwordInput = screen.getByPlaceholderText("•••••••••");
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: "teste@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "senha123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "teste@example.com",
        password: "senha123",
      });
    });

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith("/dashboard");
      },
      { timeout: 3000 }
    );
  });

  it("ao falhar o login, não redireciona", async () => {
    (authService.login as jest.Mock).mockRejectedValue(new Error("Credenciais inválidas"));
    renderLoginFlow();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText("seu@email.com");
    const passwordInput = screen.getByPlaceholderText("•••••••••");
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    fireEvent.change(emailInput, { target: { value: "teste@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });

    expect(mockReplace).not.toHaveBeenCalledWith("/dashboard");
  });
});
