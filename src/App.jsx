 import { TonConnectUIProvider } from '@tonconnect/ui-react';
 import JettonDataDisplay from "./JettonDataDisplay"
import './App.css'
  //For local development
 const manifestUrl = 'http://localhost:5173/manifest.json';

function App() {
  return (
    <div>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <JettonDataDisplay/>
    
  <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga dolore minus asperiores odit neque quae eius nostrum culpa! Corporis nostrum molestias accusantium perferendis minima perspiciatis ducimus temporibus nulla! Quia, reiciendis ad voluptatibus beatae a totam doloribus sit officia adipisci quod?</div></TonConnectUIProvider>
    </div>
  );
}

export default App;