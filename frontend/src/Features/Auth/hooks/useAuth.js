import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerApi, loginApi, getMeApi, protectedRouteApi } from "../services/authApi.js";
import { setLoading, setCurrentUser } from "../state/authSlice.js";

const useAuth = () => {
    const dispatch = useDispatch();
    const { currentUser, Loading } = useSelector((state) => state.auth);

    const registerHandler = useCallback(async ({ fullName, email, password }) => {
        dispatch(setLoading(true));
        try {
            const userData = await registerApi({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password: password.trim() });
            dispatch(setCurrentUser(userData.user));
            return true;
        } catch (error) {
            console.error("Register Error: ", error);
            return false;
        }
        finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const loginHandler = useCallback(async ({ email, password }) => {
        dispatch(setLoading(true));
        try {
            const userData = await loginApi({ email, password });
            dispatch(setCurrentUser(userData.user));
            return true;
        } catch (error) {
            console.error("Login Error: ", error);
            return false;
        }
        finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const protectedRouteHandler = useCallback(async () => {
        try {
            await protectedRouteApi();
            return true;
        }
        catch (error) {
            console.error("Protected Route Error: ", error);
            return false;
        }
    }, []);

    const getMeHandler = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const userData = await getMeApi();
            dispatch(setCurrentUser(userData.user));
            return true;
        } catch (error) {
            console.error("Get Current User Error: ", error);
            dispatch(setCurrentUser(null));
            return false;
        }
        finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    return { registerHandler, loginHandler, getMeHandler, protectedRouteHandler, currentUser, Loading };
};

export default useAuth;
