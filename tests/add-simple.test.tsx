import React from 'react';
import { render } from '@testing-library/react-native';

// Mock do expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
  },
}));

// Mock do linkStorage
const mockLinkStorageSave = jest.fn().mockResolvedValue(undefined);
jest.mock('../src/storage/link-storage', () => ({
  linkStorage: {
    save: mockLinkStorageSave,
    get: jest.fn().mockResolvedValue([]),
    remove: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Alert
jest.spyOn(require('react-native'), 'Alert', 'get').mockImplementation(() => ({
  alert: jest.fn(),
}));

// Mock dos componentes
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: (props: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {
      ...props,
      testID: `material-icon-${props.name}`,
    }, `Icon: ${props.name}`);
  },
}));

jest.mock('../src/components/input', () => ({
  Input: (props: any) => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return React.createElement(TextInput, {
      ...props,
      testID: `input-${props.placeholder?.toLowerCase()}`,
    });
  },
}));

jest.mock('../src/components/button', () => ({
  Button: (props: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(TouchableOpacity, {
      ...props,
      testID: 'button-adicionar',
      onPress: props.onPress,
    }, React.createElement(Text, {}, props.title));
  },
}));

jest.mock('../src/components/categories', () => ({
  Categories: (props: any) => {
    const React = require('react');
    const { TouchableOpacity, Text } = require('react-native');
    return React.createElement(TouchableOpacity, {
      testID: 'categories',
      onPress: () => props.onChange && props.onChange('Curso'),
    }, React.createElement(Text, {}, 'Categories'));
  },
}));

// Mock dos estilos
jest.mock('../src/app/add/styles', () => ({
  styles: {
    container: {},
    header: {},
    title: {},
    label: {},
    form: {},
  },
}));

jest.mock('../src/styles/colors', () => ({
  colors: {
    gray: {
      200: '#E5E5E5',
      400: '#9CA3AF',
    },
  },
}));

import Add from '../src/app/add';

describe('Add Component - Teste Simples', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o componente sem erros', () => {
    console.log('Mock save function:', mockLinkStorageSave);
    const { getByText } = render(<Add />);
    expect(getByText('Novo')).toBeTruthy();
  });

  it('deve ter o mock do linkStorage configurado', () => {
    expect(mockLinkStorageSave).toBeDefined();
    expect(typeof mockLinkStorageSave).toBe('function');
  });
});
