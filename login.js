document.addEventListener("DOMContentLoaded", () => {
    //page container
    const loginPage = document.getElementById("loginPage");
    const registerPage = document.getElementById("registerPage");
    const forgetPage = document.getElementById("forgetPage");

    //navigation button

    const goToRegisterButton = document.getElementById("goToRegisterButton");
    const goToForgetButton = document.getElementById("goToForgetButton");
    const backToLoginPageButtonRegister = document.getElementById("backToLoginPageButtonRegister");
    const backToLoginPageButtonForget = document.getElementById("backToLoginPageButtonForget");

    //otp element
    const otpSendButton = document.getElementById("otpSendButton");
    const otpVerifyButton = document.getElementById("otpVerifyButton");
    const otpRequestBlock = document.getElementById("otpRequestBlock");
    const otpVerifyBlock = document.getElementById("otpVerifyBlock");
    const otpCodeInput = document.getElementById("otpCodeInput");
    const otpStatus = document.getElementById("otpStatus");
    const finalRegisterButton = document.getElementById("finalRegisterButton");

    //step indicators
    const step2Circle =document.getElementById("step2Circle");
    const step3Circle =document.getElementById("step3Circle");

    let generateOtp = null; //simulated Otp state

    //function for view switching
    function showView(targetPage){
        loginPage.hidden = true;
        registerPage.hidden = true;
        forgetPage.hidden = true;
        targetPage.hidden = false;
    }

    //navigation for event listners 
    goToRegisterButton.addEventListener("click", () => showView(registerPage));
    goToForgetButton.addEventListener("click", () => showView(forgetPage));
    backToLoginPageButtonRegister.addEventListener("click", () => showView(loginPage));
    backToLoginPageButtonForget.addEventListener("click", () => showView(loginPage));

    //password visiblity
    document.querySelectorAll(".toggle-password").forEach((icon) =>{
        icon.addEventListener("click", () => {
            const targetId = icon.getAttribute("data-target");
            const passwordInput = document.getElementById(targetId);
            if(passwordInput) {
            if(passwordInput.type === "password") {
                passwordInput.type = "text";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            } else {
                passwordInput.type = "password";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }
        }
        });
    })

    //send otp EventListners
    otpSendButton.addEventListener("click", async () => {
        const mobile = document.getElementById("registerMobile").value.trim();
        const email = document.getElementById("registerEmail").value.trim();

        if (!email || !mobile || mobile.length !== 10) {
            alert("Please fill in a valid Email and 10-digit Mobile number");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success) {
                alert(data.message);
                //UI updates
                otpVerifyBlock.hidden = false;
                step2Circle.classList.add("active");
                otpStatus.textContent = "OTP sent Successfully to your email. Please enter the OTP";
                otpStatus.className = "otp-status-text success";
            } else {
                alert(data.message || "Failed to send OTP.");
            }
        } catch (err) {
            console.error("Error sending OTP:", err);
            alert("Server error while sending OTP.");
        }
    });

    // verify otp eventListner
    otpVerifyButton.addEventListener("click", async () => {
        const email = document.getElementById("registerEmail").value.trim();
        const enteredOtp = otpCodeInput.value.trim();

        if (!enteredOtp) {
            alert("Please enter the OTP.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: enteredOtp })
            });
            const data = await response.json();

            if (data.success) {
                otpStatus.textContent = "✓ OTP verified Successfully!";
                otpStatus.className = "otp-status-text success";

                //enable submit button and update program
                finalRegisterButton.disabled = false;
                step3Circle.classList.add("active");
                otpVerifyButton.disabled = true;
                otpCodeInput.disabled = true;
            } else {
                otpStatus.textContent = "✕ Invalid OTP. Please try again.";
                otpStatus.className = "otp-status-text error";
            }
        } catch (err) {
            console.error("Error verifying OTP:", err);
            alert("Server error while verifying OTP.");
        }
    });

    //form submittion
    document.getElementById("loginForm").addEventListener("submit", async(e) => {
        e.preventDefault();
        const emailOrMobile = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try{
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ emailOrMobile, password })

            });

            const data = await response.json();

 if (data.success) {
                alert("Login Successful!");

                // Yahan user_id save karein taaki baaki pages par use ho sake
                localStorage.setItem("user_id", data.user.id);
                localStorage.setItem("user_role", data.user.role);

                const role = data.user.role.toLowerCase();
                if(role === 'farmer') {
                    window.location.href = "farmer.html";
                } else if (role === 'provider') {
                    window.location.href = "provider.html";
                } else if (role === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "farmer.html";
                }
            }else {
                alert(data.message || "Login failed!");
            }
        } catch (err) {
            console.error("Error connecting to server:", err);
            alert("Server error. Make sure backend is running.");
        }
    });

    document.getElementById("registerForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        //gathers form value
        const role = document.querySelector('input[name="role"]:checked').value;
        const full_name = document.getElementById('full-name').value;
        const location = document.getElementById('register-location').value;
        const email = document.getElementById('registerEmail').value;
        const mobile = document.getElementById('registerMobile').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch ('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role, full_name, location, email,mobile, password})
            });
            const data = await response.json();

            if (data.success) {
                alert("Registration Successful! Please login.");
                showView(loginPage);
            }else {
                alert(data.message || "Registration failed!");
            }
        }catch (err) {
            console.error("Error connecting to server:",err);
            alert("Server error. Make sure backend is running.");
        }
        });

    document.getElementById("forgetForm").addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Password reset OTP requested!");
    });
});