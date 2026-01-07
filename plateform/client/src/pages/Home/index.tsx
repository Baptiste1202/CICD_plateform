import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";

export const Home = () => {
    const { authUser } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (authUser) {
            const target = authUser.role === "admin" ? "/admin/dashboard" : "/pipelines";
            navigate(target);
        }
    }, [authUser, navigate]);

    return null;
};