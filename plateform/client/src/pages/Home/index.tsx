import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";

export const Home = () => {
    const { authUser, loading } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && authUser) {
            navigate("/dashboard");
        } else if (!loading && !authUser) {
            navigate("/login");
        }
    }, [authUser, loading, navigate]);

    return null;
};