import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { AuthBootstrap } from './app/AuthBootstrap';
import { store } from './app/store';
import { ThemeProvider } from './context/ThemeContext';
import { AppRouter } from './routes/AppRouter';
import 'react-toastify/dist/ReactToastify.css';

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <AuthBootstrap>
        <AppRouter />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          limit={3}
        />
      </AuthBootstrap>
    </ThemeProvider>
  </Provider>
);

export default App;
