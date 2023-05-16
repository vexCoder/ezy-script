import { MainProvider } from "./providers/Main";
import { AppRoutes } from "./routes";

const App = () => {
  return (
    <MainProvider>
      <AppRoutes />
    </MainProvider>
  );
};

export default App;
