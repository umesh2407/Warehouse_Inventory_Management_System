import { Provider } from 'react-redux';
import { AuthBootstrap } from './app/AuthBootstrap';
import { store } from './app/store';
import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './routes/AppRouter';

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <AuthBootstrap>
        <AppRouter />
      </AuthBootstrap>
    </ThemeProvider>
  </Provider>
);

export default App;
