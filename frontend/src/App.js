import './App.css';
import Header from './components/Header';
import UploadResume from './components/UploadResume'
import UploadJobDescription from './components/UploadJobDescription'


function App() {
  return (
    <div>
      <Header />
      <UploadResume/>
      <UploadJobDescription/>
    </div>
  );
}


export default App;
