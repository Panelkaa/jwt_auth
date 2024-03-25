import { FC, useContext, useEffect } from "react"
import LoginForm from "./components/LoginForm"
import { Context } from "./main"
import { observer } from "mobx-react-lite";
import RegistrationForm from "./components/RegistrationForm";
import {
  Route,
  BrowserRouter,
  Routes,
} from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
const App: FC = () => {
  const {store} = useContext(Context);

  useEffect(() => {
    if(localStorage.getItem('token')) [
      store.checkAuth()
    ]
  }, [store])

  if(!store.isAuth) {
    
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/registration" element={<RegistrationForm />}/>
          <Route path="/" element={<LoginForm />}/>
        </Routes>
      </BrowserRouter>
    )
  }
  return ( 
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <h1 className="text-xl mb-8 font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
          {store.isAuth ? `Пользователь авторизован ${store.user.email}`: 'Авторизуйтесь'}
        </h1>
        <button 
          className="w-64 text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          onClick={() => store.logout()}>
            Выйти
        </button>
      </div>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export default observer(App); 
