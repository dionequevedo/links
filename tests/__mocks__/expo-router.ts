// Mock do expo-router para os testes
export const Stack = ({ children, screenOptions }: any) => {
  return children;
};

export const router = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  navigate: jest.fn(),
};

export const useRouter = () => router;

export const useLocalSearchParams = () => ({});

export const usePathname = () => '/';

export const useFocusEffect = (callback: () => void) => {
  callback();
};
