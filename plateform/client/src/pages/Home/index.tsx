import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";

export const Home = () => {
    const { authUser } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            navigate("/dashboard");
        }
    }, [authUser, navigate]);

    return null;
};