// src/pages/auth/AuthPage.jsx - COMPLETE FIXED VERSION WITH CONFIRM PASSWORD TOGGLE
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  LogIn, UserPlus, Building2, User, Stethoscope, MapPin, 
  ArrowRight, Check, X, Eye, EyeOff, UserCircle, ArrowLeft 
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import api from "../../api/client";

const AuthPage = () => {
  const { login, loginPharmacy, registerUser, registerPharmacy, doctors, organizations = [] } = useAppContext();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState("login"); // login | signup | org_register | pharmacy_register | forgot | set_password
  const [forgotStep, setForgotStep] = useState(1); // 1=email, 2=code, 3=new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  
  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Added state for confirm password
  
  const [setPasswordToken, setSetPasswordToken] = useState("");

  const { 
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ mode: "onChange" });

  // Watchers for Validation
  const password = watch("password", "");
  const newPassword = watch("newPassword", "");
  const activePassword =
    authMode === "set_password" || (authMode === "forgot" && forgotStep === 3)
      ? newPassword
      : password;
  const role = watch("role", "Patient");
  const tokenFromUrl = searchParams.get("token");

  useEffect(() => {
    if (tokenFromUrl) {
      setSetPasswordToken(tokenFromUrl);
      setAuthMode("set_password");
      setForgotStep(1);
      setForgotEmail("");
      setForgotCode("");
      reset({ newPassword: "", confirmNewPassword: "" });
    } else if (authMode === "set_password") {
      setAuthMode("login");
    }
  }, [authMode, reset, tokenFromUrl]);

  const clearTokenFromUrl = () => {
    setSetPasswordToken("");
    if (tokenFromUrl) {
      navigate("/", { replace: true });
    }
  };

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    setForgotStep(1);
    setForgotEmail("");
    setForgotCode("");
    clearTokenFromUrl();
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false); // Reset visibility on mode switch
  };

  const applyDemoCredentials = (email, password) => {
    switchAuthMode("login");
    reset({ email, password });
  };

  // Password Strength Logic
  const passwordRequirements = [
    { label: "Min 8 chars", valid: activePassword.length >= 8 },
    { label: "Number", valid: /[0-9]/.test(activePassword) },
    { label: "Uppercase", valid: /[A-Z]/.test(activePassword) },
    { label: "Special Char", valid: /[^A-Za-z0-9]/.test(activePassword) },
  ];

  // ✅ FIXED onSubmit - PHARMACY LOGIN WORKS NOW
  const onSubmit = async (data) => {
    if (authMode === "login") {
      const pharmacySuccess = await loginPharmacy(data.email, data.password);
      if (pharmacySuccess) {
        toast.success("Welcome Pharmacy!");
        return;
      }

      const success = await login(data.email, data.password);
      if (!success) {
        toast.error("Invalid credentials.");
      } else {
        toast.success("Welcome back!");
      }
    } else if (authMode === "set_password") {
      try {
        if (!setPasswordToken) {
          toast.error("Invalid or missing password token.");
          return;
        }
        await api.post("/auth/set-password", {
          token: setPasswordToken,
          newPassword: data.newPassword,
        });
        toast.success("Password set successfully. Please sign in.");
        setAuthMode("login");
        clearTokenFromUrl();
        reset();
      } catch (error) {
        toast.error(error?.response?.data?.error || "Unable to set password.");
      }
    } else if (authMode === "forgot") {
      try {
        if (forgotStep === 1) {
          await api.post("/auth/forgot-password", { email: data.email });
          setForgotEmail(data.email);
          setForgotStep(2);
          reset();
          toast.success(`Verification code sent to ${data.email}`);
        } else if (forgotStep === 2) {
          await api.post("/auth/verify-reset-code", {
            email: data.email,
            code: data.code,
          });
          setForgotEmail(data.email);
          setForgotCode(data.code);
          setForgotStep(3);
          reset();
          toast.success("Code verified. Set a new password.");
        } else if (forgotStep === 3) {
          await api.post("/auth/reset-password-code", {
            email: data.email,
            code: forgotCode,
            newPassword: data.newPassword,
          });
          toast.success("Password reset successfully!");
          setAuthMode("login");
          setForgotStep(1);
          setForgotEmail("");
          setForgotCode("");
          reset();
        }
      } catch (error) {
        toast.error(error?.response?.data?.error || "Unable to complete password reset.");
      }
    } else if (authMode === "pharmacy_register") {
      try {
        await registerPharmacy(data);
        toast.success("Pharmacy Registered Successfully!");
        setAuthMode("login");
        reset();
      } catch (error) {
        toast.error(error?.response?.data?.error || "Pharmacy registration failed.");
      }
    } else {
      const userData = {
        ...data,
        role: authMode === "org_register" ? "Admin" : data.role,
      };
      try {
        await registerUser(userData);
        toast.success(
          authMode === "org_register"
            ? "Organization Registered!"
            : "Account Created!"
        );
        setAuthMode("login");
        reset();
      } catch (error) {
        toast.error(error?.response?.data?.error || error?.message || "Registration failed.");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center auth-bg p-4 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in">
        {/* LEFT PANEL: Branding & Navigation */}
        <div className="md:w-5/12 bg-slate-900 text-white p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4 tracking-tight">MedCare<span className="text-teal-400">.</span></h1>
            
            <h2 className="text-2xl font-bold mb-4 text-slate-300">
              {authMode === "org_register" ? "For Healthcare Providers" :
               authMode === "pharmacy_register" ? "For Pharmacies" :
               authMode === "set_password" ? "Activate Your Account" :
               authMode === "forgot" ? "Account Recovery" : "For Patients & Doctors"}
            </h2>

            <p className="text-slate-400 leading-relaxed">
              {authMode === "org_register"
                ? "Register your hospital to manage staff, patients, and inventory in one unified dashboard."
                : authMode === "pharmacy_register"
                ? "Register your pharmacy to manage medicine inventory, stock, and patient prescriptions."
                : authMode === "set_password"
                ? "Set a secure password to activate your doctor account and continue."
                : authMode === "forgot"
                ? forgotStep === 1
                  ? "Enter your email to receive a verification code."
                  : forgotStep === 2
                  ? "Enter the verification code sent to your email."
                  : "Create a new password for your account."
                : "Manage prescriptions, track adherence, and connect with your healthcare providers seamlessly."
              }
            </p>
          </div>

          {/* Mode Switchers */}
          <div className="relative z-10 mt-12 space-y-3">
            <button 
              onClick={() => switchAuthMode("login")} 
              className={`w-full text-left p-4 rounded-xl transition flex items-center gap-3 ${authMode === "login" || authMode === "forgot" || authMode === "set_password" ? "bg-white/10 border border-white/20" : "hover:bg-white/5"}`}
            >
              <div className="bg-teal-500 p-2 rounded-lg"><LogIn size={16}/></div>
              <div><p className="font-bold text-sm">Sign In</p><p className="text-xs text-slate-400">Access your dashboard</p></div>
            </button>

            <button 
              onClick={() => switchAuthMode("signup")} 
              className={`w-full text-left p-4 rounded-xl transition flex items-center gap-3 ${authMode === "signup" ? "bg-white/10 border border-white/20" : "hover:bg-white/5"}`}
            >
              <div className="bg-purple-500 p-2 rounded-lg"><UserPlus size={16}/></div>
              <div><p className="font-bold text-sm">New User</p><p className="text-xs text-slate-400">Patient or Doctor registration</p></div>
            </button>

            <button 
              onClick={() => switchAuthMode("org_register")} 
              className={`w-full text-left p-4 rounded-xl transition flex items-center gap-3 ${authMode === "org_register" ? "bg-white/10 border border-white/20" : "hover:bg-white/5"}`}
            >
              <div className="bg-orange-500 p-2 rounded-lg"><Building2 size={16}/></div>
              <div><p className="font-bold text-sm">Register Organization</p><p className="text-xs text-slate-400">For healthcare providers</p></div>
            </button>

            <button 
              onClick={() => switchAuthMode("pharmacy_register")} 
              className={`w-full text-left p-4 rounded-xl transition flex items-center gap-3 ${authMode === "pharmacy_register" ? "bg-white/10 border border-white/20" : "hover:bg-white/5"}`}
            >
              <div className="bg-indigo-500 p-2 rounded-lg"><Building2 size={16}/></div>
              <div><p className="font-bold text-sm">Register Pharmacy</p><p className="text-xs text-slate-400">Manage medicine inventory</p></div>
            </button>
          </div>

          <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="md:w-7/12 p-8 md:p-12 bg-white flex flex-col justify-center overflow-y-auto max-h-[90vh]">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-black text-slate-800 mb-6">
              {authMode === "login" && "Welcome Back"}
              {authMode === "signup" && "Create Account"}
              {authMode === "org_register" && "Register Organization"}
              {authMode === "pharmacy_register" && "Register Pharmacy"}
              {authMode === "set_password" && "Set Your Password"}
              {authMode === "forgot" && "Forgot Password?"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* ORGANIZATION NAME FIELD */}
              {authMode === "org_register" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hospital Name</label>
                  <input 
                    {...register("hospitalName", { required: "Hospital name is required" })} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 mt-1" 
                    placeholder="e.g. City General" 
                  />
                  {errors.hospitalName && <p className="text-xs text-red-500 mt-1">{errors.hospitalName.message}</p>}
                </div>
              )}

              {/* PHARMACY REGISTER FIELDS */}
              {authMode === "pharmacy_register" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pharmacy Name</label>
                    <div className="relative mt-1">
                      <UserCircle className="absolute left-3 top-3 text-slate-400" size={18}/>
                      <input 
                        {...register("pharmacyName", { required: "Pharmacy name is required" })} 
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500" 
                        placeholder="ABC Medicals" 
                      />
                      {errors.pharmacyName && <p className="text-xs text-red-500 mt-1">{errors.pharmacyName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Location</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={18}/>
                      <input 
                        {...register("location", { required: "Location is required" })} 
                        className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500" 
                        placeholder="New Delhi, Delhi" 
                      />
                      {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* FULL NAME (Signup & Org) */}
              {(authMode === "signup" || authMode === "org_register") && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    {authMode === "org_register" ? "Admin Name" : "Full Name"}
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <input 
                      {...register("name", { required: "Name is required" })} 
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500" 
                      placeholder="John Doe" 
                    />
                  </div>
                </div>
              )}

              {/* ROLE SELECTOR (Signup Only) */}
              {authMode === "signup" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">I am a...</label>
                  <select 
                    {...register("role", { required: true })} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 mt-1"
                  >
                    <option value="Patient">Patient</option>
                    <option value="Doctor">Doctor</option>
                  </select>
                </div>
              )}

              {/* DOCTOR -> ORG SELECTION */}
              {authMode === "signup" && role === "Doctor" && (
                <div className="animate-slide-down">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Select Hospital</label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <select 
                      {...register("orgId", { required: "Hospital is required" })} 
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 appearance-none"
                    >
                      <option value="">-- Select Organization --</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* PATIENT -> DOCTOR SELECTION */}
              {authMode === "signup" && role === "Patient" && (
                <div className="animate-slide-down">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Assign Doctor</label>
                  <div className="relative mt-1">
                    <Stethoscope className="absolute left-3 top-3 text-slate-400" size={18}/>
                    <select 
                      {...register("doctorAssignedId")} 
                      className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 appearance-none"
                    >
                      <option value="">-- Assign Automatically --</option>
                      {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>{doc.personal.fullName} ({doc.qualifications.specialization})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* EMAIL - ALWAYS SHOWN */}
              {authMode !== "set_password" && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                  <input 
                    {...register("email", { required: "Email is required" })} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 mt-1" 
                    placeholder="name@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              )}

              {/* FORGOT PASSWORD CODE INPUT */}
              {authMode === "forgot" && forgotStep === 2 && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Verification Code</label>
                  <input 
                    {...register("code", { required: "Verification code is required" })} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 mt-1"
                    placeholder="6-digit code"
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                </div>
              )}

              {/* PASSWORD */}
              {authMode !== "forgot" && authMode !== "set_password" && (
                <div>
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                    {authMode === "login" && (
                      <button 
                        type="button" 
                        onClick={() => switchAuthMode("forgot")} 
                        className="text-xs font-bold text-teal-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", { required: "Password is required" })}
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              )}

              {/* FORGOT PASSWORD - NEW PASSWORD */}
              {(authMode === "forgot" && forgotStep === 3) || authMode === "set_password" ? (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("newPassword", { required: "New password is required" })}
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                </div>
              ) : null}

              {/* PASSWORD STRENGTH */}
              {(authMode === "signup" || authMode === "org_register" || authMode === "pharmacy_register" || authMode === "set_password" || (authMode === "forgot" && forgotStep === 3)) && (
                <div className="grid grid-cols-2 gap-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {req.valid ? <Check size={12} className="text-green-500"/> : <X size={12} className="text-slate-300"/>}
                      <span className={`text-[10px] font-bold uppercase ${req.valid ? "text-green-600" : "text-slate-400"}`}>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CONFIRM PASSWORD - UPDATED WITH TOGGLE */}
              {(authMode === "signup" || authMode === "org_register" || authMode === "pharmacy_register" || authMode === "set_password" || (authMode === "forgot" && forgotStep === 3)) && (
                <div className="animate-slide-down">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...register(authMode === "forgot" || authMode === "set_password" ? "confirmNewPassword" : "confirmPassword", {
                        validate: val => val === (authMode === "forgot" || authMode === "set_password" ? newPassword : password) || "Passwords do not match"
                      })}
                      className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                  {errors.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmNewPassword.message}</p>}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200/50 transition mt-4 flex justify-center items-center gap-2"
              >
                {authMode === "login" ? "Access Dashboard" :
                 authMode === "set_password" ? "Set Password" :
                 authMode === "forgot" ? (
                   forgotStep === 1 ? "Send Verification Code" :
                   forgotStep === 2 ? "Verify Code" : "Reset Password"
                 ) : "Register Now"}
                <ArrowRight size={18}/>
              </button>

              {(authMode === "forgot" || authMode === "set_password") && (
                <button 
                  type="button" 
                  onClick={() => switchAuthMode("login")} 
                  className="w-full py-3 mt-2 text-slate-500 font-bold hover:text-slate-800 flex justify-center items-center gap-2"
                >
                  <ArrowLeft size={16}/> Back to Login
                </button>
              )}
            </form>

            {authMode === "login" && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Demo Access</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyDemoCredentials("demo.admin@ompt.test", "Pass@1234")}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
                  >
                    Admin Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDemoCredentials("demo.doctor1@ompt.test", "Pass@1234")}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
                  >
                    Doctor Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDemoCredentials("demo.patient1@ompt.test", "Pass@1234")}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
                  >
                    Patient Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => applyDemoCredentials("demo.pharmacy@ompt.test", "Pass@1234")}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
                  >
                    Pharmacy Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;