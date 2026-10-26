import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerApi, loginApi, getMeApi, protectedRouteApi } from "../services/authApi.js";
import { setLoading, setCurrentUser, setError } from "../state/authSlice.js";

const getAuthErrorMessage = (error, fallback) => {
    const responseData = error.response?.data;

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
        return responseData.errors
            .map((validationError) => validationError.msg)
            .filter(Boolean)
            .join(". ");
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    if (error.request && !error.response) {
        return "Unable to reach the server. Check your connection and try again.";
    }

    return fallback;
};

const useAuth = () => {
    const dispatch = useDispatch();
    const { currentUser, Loading, error } = useSelector((state) => state.auth);

    const registerHandler = useCallback(async ({ fullName, email, password }) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const userData = await registerApi({ fullName: fullName.trim(), email: email.trim().toLowerCase(), password: password.trim() });
            dispatch(setCurrentUser(userData.user));
            return true;
        } catch (error) {
            console.error("Register Error: ", error);
            dispatch(setError(getAuthErrorMessage(error, "Registration failed. Please try again.")));
            return false;
        }
        finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const loginHandler = useCallback(async ({ email, password }) => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const userData = await loginApi({ email, password });
            dispatch(setCurrentUser(userData.user));
            return true;
        } catch (error) {
            console.error("Login Error: ", error);
            dispatch(setError(getAuthErrorMessage(error, "Login failed. Please try again.")));
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

    return { registerHandler, loginHandler, getMeHandler, protectedRouteHandler, currentUser, Loading, error };
};

export default useAuth;
