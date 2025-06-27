// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { useForm } from "@/hooks/useForm";
// import { validateEmail, validatePassword } from "@/utils/validators";
// import { ROUTES } from "@/utils/constant";
// import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";

// // Import toast hook — adjust path if needed
// import { useToast } from "@/hooks/use-toast";

// export const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated, login } = useAuthContext();
//   const [showPassword, setShowPassword] = useState(false);

//   // Toast trigger
//   const { toast } = useToast();

//   // Redirect target after login
//   const from =
//     (location.state && location.state.from && location.state.from.pathname) ||
//     ROUTES.DASHBOARD;

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate(from, { replace: true });
//     }
//   }, [isAuthenticated, navigate, from]);

//   const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validate: (values) => {
//       const errors = {};

//       const emailError = validateEmail(values.email);
//       if (emailError) errors.email = emailError;

//       const passwordError = validatePassword(values.password);
//       if (passwordError) errors.password = passwordError;

//       return errors;
//     },
//     onSubmit: async (values) => {
//       try {
//         await login(values); // Make sure login throws error on failure!
//       } catch (error) {
//         toast({
//           title: "Login failed",
//           description: error.message || "Invalid credentials",
//           variant: "destructive",
//           duration: 5000,
//         });
//       }
//     },
//   });

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <div className="flex items-center justify-center mb-4">
//             <BookOpen className="h-8 w-8 text-primary" />
//           </div>
//           <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
//           <CardDescription className="text-center">
//             Sign in to your account to continue
//           </CardDescription>
//         </CardHeader>

//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-4">
//             {/* Removed old error alert to rely on toast */}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={values.email}
//                 onChange={(e) => setValue("email", e.target.value)}
//                 disabled={isSubmitting}
//                 autoComplete="email"
//                 autoFocus
//               />
//               {errors.email && (
//                 <p className="text-sm text-destructive">{errors.email}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   to="/forgot-password"
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={values.password}
//                   onChange={(e) => setValue("password", e.target.value)}
//                   disabled={isSubmitting}
//                   autoComplete="current-password"
//                   className="pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePasswordVisibility}
//                   className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                   disabled={isSubmitting}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm text-destructive">{errors.password}</p>
//               )}
//             </div>
//           </CardContent>

//           <CardFooter className="flex flex-col space-y-4">
//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting && (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               )}
//               Sign In
//             </Button>

//             <div className="text-center text-sm text-muted-foreground">
//               Don't have an account?{" "}
//               <Link
//                 to={ROUTES.REGISTER}
//                 className="text-primary hover:underline font-medium"
//               >
//                 Sign up
//               </Link>
//             </div>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// };






import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/AuthContext";
import { useForm } from "@/hooks/useForm";
import { validateEmail, validatePassword } from "@/utils/validators";
import { ROUTES } from "@/utils/constant";
import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";

// Import toast hook — adjust path if needed
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

  // Toast trigger
  const { toast } = useToast();

  // Redirect target after login
  const from =
    (location.state && location.state.from && location.state.from.pathname) ||
    ROUTES.DASHBOARD;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const { values, errors, isSubmitting, setValue, handleSubmit } = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};

      const emailError = validateEmail(values.email);
      if (emailError) errors.email = emailError;

      const passwordError = validatePassword(values.password);
      if (passwordError) errors.password = passwordError;

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await login(values); // Make sure login throws error on failure!
      } catch (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
          duration: 5000,
        });
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Removed old error alert to rely on toast */}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={(e) => setValue("email", e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={(e) => setValue("password", e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
