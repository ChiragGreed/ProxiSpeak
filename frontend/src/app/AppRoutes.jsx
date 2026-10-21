import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from '../Features/Auth/pages/Register/Register.jsx'
import Login from '../Features/Auth/pages/Login/Login.jsx'
import ProtectedRoute from '../Features/Auth/components/ProtectedRoute.jsx'
import App from './App'

const AppRoutes = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/register' element={<Register />} />
                <Route path='/login' element={<Login />} />
                <Route path='/' element={
                    <ProtectedRoute>
                        <App />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes
