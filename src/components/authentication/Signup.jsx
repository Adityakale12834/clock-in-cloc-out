import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { app } from "../../utils/firebase";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function Signup() {
    const [state, setState] = useState({ email: "", password: "" });

    const signUpWithGoogle = () => {
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log("Google Sign-Up Success:", result.user);
                alert("Signed up with Google!");
            })
            .catch((error) => {
                console.error("Google Sign-Up Error:", error);
                alert("Google Sign-Up Failed");
            });
    };

    const signUpUser = () => {
        createUserWithEmailAndPassword(auth, state.email, state.password)
            .then((value) => {
                console.log("User Signed Up:", value.user);
                alert("Signup Successful");
            })
            .catch((e) => {
                console.error("Signup Error:", e);
                alert("Signup Failed: " + e.message);
            });
    };

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setState((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleOnSubmit = (evt) => {
        evt.preventDefault();
        signUpUser();
        setState({ email: "", password: "" }); // Reset fields after signup
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
                <h2 className="text-3xl font-semibold text-center text-indigo-600">Sign Up</h2>
                <p className="text-sm text-gray-500 text-center mt-2">Create an account to get started.</p>

                <form className="mt-6" onSubmit={handleOnSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            value={state.email}
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your password"
                            value={state.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Sign Up
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <hr className="w-full border-gray-300" />
                    <span className="px-2 text-gray-400">OR</span>
                    <hr className="w-full border-gray-300" />
                </div>

                <button onClick={signUpWithGoogle} className="w-full flex items-center justify-center gap-3 border py-3 rounded-lg hover:bg-gray-100 transition">
                    <FcGoogle className="text-2xl" />
                    Sign up with Google
                </button>

                <p className="text-sm text-center text-gray-600 mt-4">
                    Already have an account? <Link to="/" className="text-indigo-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
