import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductInfo from './pages/details';
import Recommendations from './pages/alternates';
import Login from './Auth/Login';
import UserSignUp from './Auth/Signup'; 
import {  AuthProvider } from "./context/AuthContext";
import Imgscan from './components/imgscan';
import WebcamCapture from './components/WebCamCapture';
import Chat from './components/Chat';
import GamesBoard from './pages/GamesBoard';
// import Results from './game/results';
import Quizgame from './pages/monthdiet';
// import Pantrygame from "./game/pantrygame";
import MonthlyDiet from './pages/Monthlydiet';
import Dietgame from './pages/monthdiet';
import Navbar from './components/Navbar';
import Footer from './components/footer/Footer';
import ProductClassification from './components/classification/Classification';

// import Quiz from './game/quiz';

function App() {  
  return (
    <div className="App">
      <AuthProvider>
      <BrowserRouter>
      < Navbar/>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/details' element={<ProductInfo/>}/>
          <Route path='/recommendations' element={<Recommendations/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<UserSignUp/>}/>
          <Route path='/imgscan' element={<Imgscan/>}/>
          <Route path='/webcam' element={<WebcamCapture/>}/>
          <Route path='/chat' element={<Chat/>}/>
          <Route path='/monthlydiet' element={<MonthlyDiet/>}/>
          <Route path='/classification' element={<ProductClassification/>}/>
          {/* <Route path='/quiz' element={<Quiz/>}/>
          <Route path="/quizgame" element={<Quizgame />} />
        <Route path="/results" element={<Results />} />

        <Route path="/game" element={<GamesBoard />} />
        
        <Route path="/pantry" element={<Pantrygame />} />

        <Route path="/games" element={<Dietgame />} /> */}

        </Routes>
        <Footer />
      </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;