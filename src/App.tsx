import { DefaultLayout } from "./Components/Layouts/DefaultLayout";
import { renderRouteComponent, useNavigation } from "./Components/Navigation";

export default function App() {
  const navigation = useNavigation();

  return (
    <DefaultLayout
      navBarProps={{
        brand: "API Monitor",
        navigation: navigation.getNavItems(),
      }}
    >
      {renderRouteComponent(navigation.currentRoute, navigation)}
    </DefaultLayout>
  );
}
