import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../../app/(auth)/login';

// Mock do auth store
jest.mock('../../src/store/auth_store', () => ({
  useAuthStore: () => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    loading: false,
  }),
}));

// Mock do tema
jest.mock('../../src/hooks/useThemePeriod', () => ({
  useThemePeriod: () => ({
    primary: '#EF9F27',
    background: '#FFF8E0',
    text: '#412402',
    name: 'Manhã',
  }),
}));

describe('LoginScreen', () => {
  it('deve renderizar os campos básicos de login', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    // Verifica elementos fundamentais
    expect(getByPlaceholderText('seu@email.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Acessar Essência')).toBeTruthy();
  });
});
