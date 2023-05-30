import { MainProvider } from "./providers/Main";
import { AppRoutes } from "./routes";
import "unfonts.css";

const App = () => {
  return (
    <MainProvider>
      <AppRoutes />
    </MainProvider>
  );
};

export default App;
